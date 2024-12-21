'use client'

import { useState, useEffect } from 'react'
import { EventReportTab } from '@/components/EventReportTab'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { GuestsTable } from '@/components/ConsolidatedGuestTable'
import { CompanySelect } from '@/components/ReportCompanySelect'
interface Guest {
  name: string;
  company: string;
  email: string;
  registered: boolean;
  assisted: boolean;
  virtual_session_time: number;
}
type ConsolidatedData = {
  totalInvitados: number
  totalRegistrados: number
  totalAsistentes: number
}

export default function CompareEventsPage() {
  const [event1Id, setEvent1Id] = useState<number | null>(null)
  const [event2Id, setEvent2Id] = useState<number | null>(null)
  const [events, setEvents] = useState<{ id: number; name: string }[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("Todas")
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [consolidatedGuests, setConsolidatedGuests] = useState<any[]>([])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (event1Id && event2Id) {
      fetchCompanies()
      setSelectedCompany("Todas")
      calculateConsolidatedData()
    } else {
      setCompanies([])
      setConsolidatedData(null)
    }
  }, [event1Id, event2Id])

  useEffect(() => {
    if (event1Id && event2Id) {
      calculateConsolidatedData()
    }
  }, [selectedCompany])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('event')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
  }

  async function fetchCompanies() {
    if (!event1Id || !event2Id) return

    const { data, error } = await supabase
      .from('event_guest')
      .select('company_razon_social, company:company_id(razon_social)')
      .or(`event_id.eq.${event1Id},event_id.eq.${event2Id}`)

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      const companySet = new Set<string>()
      data.forEach(item => {
        if (item.company_razon_social) companySet.add(item.company_razon_social)     
        //@ts-expect-error supabase types are not updated
        if (item.company?.razon_social) companySet.add(item.company.razon_social)
        })
      setCompanies(["Todas", ...Array.from(companySet).sort()])
    }
  }

  async function calculateConsolidatedData() {
    if (!event1Id || !event2Id) return

    const query = supabase
      .from('event_guest')
      .select('email, registered, assisted, company_razon_social, company:company_id(razon_social), executive:executive_id(name), name, virtual_session_time')
      .or(`event_id.eq.${event1Id},event_id.eq.${event2Id}`)

      const { data: rawGuests, error } = await query;

      console.log('Raw guests:', rawGuests);

      if (error) {
        console.error('Error fetching guests:', error);
      }
        // Transformar los datos

        // @ts-expect-error supabase types are not updated
        const guests: Guest[] = rawGuests.reduce((acc: Guest[], guest) => {
          const existingGuest = acc.find(g => g.email === guest.email);
        
          if (existingGuest) {
            // Actualizar el registro existente
            existingGuest.registered = existingGuest.registered || guest.registered; // OR lógico para 'registered'
            existingGuest.assisted = existingGuest.assisted || guest.assisted; // OR lógico para 'assisted'
            existingGuest.virtual_session_time += guest.virtual_session_time || 0; // Suma considerando nulos
          } else {
            // Agregar nuevo registro único
            acc.push({
              name: guest.name,
              company: guest.company_razon_social,
              email: guest.email,
              registered: guest.registered || false,
              assisted: guest.assisted || false,
              virtual_session_time: guest.virtual_session_time || 0,
            });
          }
        
          return acc;
        }, []);
      
        console.log('Processed guests:', guests);


    const consolidated = guests.reduce((acc, guest) => {
        
    //@ts-expect-error supabase types are not updated
      const guestCompany = guest.company?.razon_social || guest.company_razon_social
      if (selectedCompany === "Todas" || guestCompany === selectedCompany) {
        acc.totalInvitados++
        if (guest.registered) acc.totalRegistrados++
        if (guest.assisted) acc.totalAsistentes++
      }
      return acc
    }, { totalInvitados: 0, totalRegistrados: 0, totalAsistentes: 0 })

    const filteredGuests = guests.filter((guest) => {
      //@ts-expect-error supabase types are not updated
      const guestCompany = guest.company?.razon_social || guest.company_razon_social;
      return selectedCompany === "Todas" || guestCompany === selectedCompany;
    });

    console.log(filteredGuests)

    setConsolidatedData(consolidated)
    setConsolidatedGuests(filteredGuests)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Comparar Reportes de Eventos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Evento 1</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setEvent1Id(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Evento 2</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setEvent2Id(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
          <CompanySelect
            companies={companies}
            onValueChange={setSelectedCompany}
            defaultValue="Todas"
          />
          </CardContent>
        </Card>
      </div>

      {consolidatedData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Consolidado</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Total Invitados</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{consolidatedData.totalInvitados}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Total Registrados</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{consolidatedData.totalRegistrados}</div>
                <div className="text-xs sm:text-sm text-gray-500">
                  ({((consolidatedData.totalRegistrados / consolidatedData.totalInvitados) * 100).toFixed(2)}%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Total Asistentes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{consolidatedData.totalAsistentes}</div>
                <div className="text-xs sm:text-sm text-gray-500">
                  ({((consolidatedData.totalAsistentes / consolidatedData.totalRegistrados) * 100).toFixed(2)}%)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {event1Id && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reporte del Evento 1</h2>
            <EventReportTab eventId={event1Id} defaultCompany={selectedCompany} showCompanyFilter={false} showGuestsTable={false} />
          </div>
        )}
        {event2Id && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reporte del Evento 2</h2>
            <EventReportTab eventId={event2Id} defaultCompany={selectedCompany} showCompanyFilter={false} showGuestsTable={false}/>
          </div>
        )}
      </div>

      
    <GuestsTable guests={consolidatedGuests} />
    </div>
  )
}

