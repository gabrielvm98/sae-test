'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EventGuestForm } from './EventGuestForm'

type EventGuest = {
  id: number
  event_id: number
  company_id: number | null
  is_client_company: boolean
  company_razon_social: string | null
  executive_id: number | null
  is_user: boolean
  name: string
  dni: string
  email: string
  phone: string
  assistant_name: string | null
  assistant_email: string | null
  substitute: boolean
  substitute_name: string | null
  substitute_email: string | null
  virtual_session_time: number | null
  registered: boolean
  assisted: boolean
}

export function EventGuestTable({ eventId }: { eventId: number }) {
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null)

  useEffect(() => {
    fetchGuests()
  }, [])

  async function fetchGuests() {
    const { data, error } = await supabase
      .from('event_guest')
      .select('*')
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching guests:', error)
    } else {
      setGuests(data || [])
    }
  }

  /*
  function handleDownloadCSV() {
    // Implementación pendiente
    console.log('Descarga de CSV no implementada aún')
  }
    */

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead>Asistió</TableHead>
            <TableHead>Tiempo en sesión virtual</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>{guest.name}</TableCell>
              <TableCell>{guest.is_client_company ? 'Interna' : guest.company_razon_social}</TableCell>
              <TableCell>{guest.email}</TableCell>
              <TableCell>{guest.phone}</TableCell>
              <TableCell>{guest.registered ? 'Sí' : 'No'}</TableCell>
              <TableCell>{guest.assisted ? 'Sí' : 'No'}</TableCell>
              <TableCell>{guest.virtual_session_time || 'N/A'}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingGuestId(guest.id)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingGuestId && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Editar Invitado</h3>
          <EventGuestForm 
            eventId={eventId} 
            guestId={editingGuestId} 
            onComplete={() => {
              setEditingGuestId(null)
              fetchGuests()
            }} 
          />
        </div>
      )}
    </div>
  )
}