import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConnectionTimeDistributionChart } from './ConnectionTimeDistributionChart'

type SupabaseAttendee = {
  id: string
  name: string
  company_razon_social: string | null
  virtual_session_time: number | null
  is_user: boolean
  registered: boolean
  assisted: boolean
  executive?: {
    name: string
    last_name: string
  } | null
  company?: {
    razon_social: string
  } | null
  is_client_company?: boolean
}

type ReportAttendee = {
  id: string
  name: string
  company: string
  registered: boolean
  assisted: boolean
  virtual_session_time: number
}

type EventData = {
  totalInvitados: number
  totalRegistrados: number
  totalAsistentes: number
  tiempoConexionPromedio: string
  asistentes: ReportAttendee[]
}

export function EventReportTab({ eventId }: { eventId: number }) {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [companySeleccionada, setEmpresaSeleccionada] = useState("Todas")

  useEffect(() => {
    fetchEventData()
  }, [eventId])

  async function fetchEventData() {
    const { data: guests, error } = await supabase
      .from('event_guest')
      .select(`
        id,
        name,
        company_razon_social,
        virtual_session_time,
        is_user,
        registered,
        assisted,
        is_client_company,
        executive:executive_id (name, last_name),
        company:company_id (razon_social)
      `)
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching event data:', error)
      setLoading(false)
      return
    }

    const attendees = guests.filter(guest => guest.assisted)

    // Transformación a ReportAttendee
    // @ts-expect-error no se
    const formattedAttendees: ReportAttendee[] = attendees.map((attendee: SupabaseAttendee) => ({
      id: attendee.id,
      name: attendee.is_user && attendee.executive? `${attendee.executive.name} ${attendee.executive.last_name}`.trim(): attendee.name || '',
      company: attendee.is_client_company && attendee.company ? attendee.company.razon_social : attendee.company_razon_social || '',
      registered: attendee.registered,
      assisted: attendee.assisted,
      virtual_session_time: attendee.virtual_session_time || 0
    }))

    const totalInvitados = guests.length
    const totalRegistrados = guests.filter(guest => guest.registered).length
    const totalAsistentes = attendees.length
    const tiempoConexionTotal = formattedAttendees.reduce((sum, attendee) => sum + attendee.virtual_session_time, 0)
    const tiempoConexionPromedio = formatTime(
      totalAsistentes > 0 ? Math.round(tiempoConexionTotal / totalAsistentes) : 0
    )

    setEventData({
      totalInvitados,
      totalRegistrados,
      totalAsistentes,
      tiempoConexionPromedio,
      asistentes: formattedAttendees
    })
    setLoading(false)
  }

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const companies = ["Todas", ...new Set(eventData?.asistentes.map(a => a.company).filter(Boolean))]

  const filtrarPorEmpresa = (data: EventData) => {
    if (companySeleccionada === "Todas") return data

    const asistentesFiltrados = data.asistentes.filter(a => a.company === companySeleccionada)
    const totalAsistentes = asistentesFiltrados.length
    const tiempoConexionTotal = asistentesFiltrados.reduce((sum, attendee) => sum + attendee.virtual_session_time, 0)
    const tiempoConexionPromedio = formatTime(
      totalAsistentes > 0 ? Math.round(tiempoConexionTotal / totalAsistentes) : 0
    )

    return {
      ...data,
      totalInvitados: Math.round(data.totalInvitados * (asistentesFiltrados.length / data.asistentes.length)),
      totalRegistrados: Math.round(data.totalRegistrados * (asistentesFiltrados.length / data.asistentes.length)),
      totalAsistentes,
      tiempoConexionPromedio,
      asistentes: asistentesFiltrados,
    }
  }

  const datosFiltrados = eventData ? filtrarPorEmpresa(eventData) : null

  if (loading) {
    return <div>Cargando datos del evento...</div>
  }

  if (!eventData) {
    return <div>No se pudieron cargar los datos del evento.</div>
  }

  const porcentajeRegistrados = datosFiltrados
    ? (datosFiltrados.totalRegistrados / datosFiltrados.totalInvitados * 100).toFixed(2)
    : '0.00'

  const porcentajeAsistencia = datosFiltrados
    ? (datosFiltrados.totalAsistentes / datosFiltrados.totalRegistrados * 100).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      {/* Filtro de empresas */}
      <div className="flex justify-between items-center">
        <Select onValueChange={setEmpresaSeleccionada} defaultValue="Todas">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona una empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company, index) => (
              <SelectItem key={index} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Invitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosFiltrados?.totalInvitados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosFiltrados?.totalRegistrados}</div>
            <div className="text-sm text-gray-500">({porcentajeRegistrados}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Asistentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosFiltrados?.totalAsistentes}</div>
            <div className="text-sm text-gray-500">({porcentajeAsistencia}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Conexión Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosFiltrados?.tiempoConexionPromedio}</div>
          </CardContent>
        </Card>
      </div>
      <ConnectionTimeDistributionChart asistentes={datosFiltrados?.asistentes || []} />

      {/* Lista de asistentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Asistentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Asistido</TableHead>
                <TableHead>Tiempo de Conexión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datosFiltrados?.asistentes.map((asistente, index) => (
                <TableRow key={index}>
                  <TableCell>{asistente.name}</TableCell>
                  <TableCell>{asistente.company}</TableCell>
                  <TableCell>{asistente.registered ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{asistente.assisted ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{formatTime(asistente.virtual_session_time)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default EventReportTab
