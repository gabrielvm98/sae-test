'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditGuestForm } from './EditGuestForm'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type EventGuest = {
  id: string
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
  company?: {
    razon_social: string
  }
  executive?: {
    name: string
    last_name: string
    email: string
    office_phone: string
  }
}

export function EventGuestTable({ eventId }: { eventId: number }) {
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    fetchGuests()
  }, [])

  async function fetchGuests() {
    const { data, error } = await supabase
      .from('event_guest')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name, email, office_phone)
      `)
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching guests:', error)
    } else {
      setGuests(data || [])
    }
  }

  async function deleteGuest(guestId: string) {
    const { error } = await supabase
      .from('event_guest')
      .delete()
      .eq('id', guestId)

    if (error) {
      console.error('Error deleting guest:', error)
    } else {
      fetchGuests()
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Email del evento</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Interno/Externo</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead>Asistió</TableHead>
            <TableHead>Tiempo en sesión virtual</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                {guest.is_user 
                  ? `${guest.executive?.name} ${guest.executive?.last_name || ''}`.trim()
                  : guest.name
                }
              </TableCell>
              <TableCell>
                {guest.is_client_company
                  ? guest.company?.razon_social
                  : guest.company_razon_social}
              </TableCell>
              <TableCell>{guest.is_user ? guest.executive?.email : guest.email}</TableCell>
              <TableCell>{guest.email}</TableCell>
              <TableCell>{guest.is_user ? guest.executive?.office_phone : guest.phone}</TableCell>
              <TableCell>{guest.is_user ? 'Interno' : 'Externo'}</TableCell>
              <TableCell>{guest.registered ? 'Sí' : 'No'}</TableCell>
              <TableCell>{guest.assisted ? 'Sí' : 'No'}</TableCell>
              <TableCell>{guest.virtual_session_time || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingGuestId(guest.id)
                      setShowEditForm(true)
                    }}
                  >
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Borrar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente al invitado del evento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteGuest(guest.id)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingGuestId && showEditForm && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Editar Invitado</h3>
            <Button size="sm" onClick={() => setShowEditForm(false)}>
              Cerrar
            </Button>
          </div>
          <EditGuestForm 
            guestId={parseInt(editingGuestId)} 
            onComplete={() => {
              setEditingGuestId(null)
              setShowEditForm(false)
              fetchGuests()
            }} 
          />
        </div>
      )}
    </div>
  )
}

