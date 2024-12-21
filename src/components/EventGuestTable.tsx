'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditGuestForm } from './EditGuestForm'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  position: string | null
  company?: {
    razon_social: string
  }
  executive?: {
    name: string
    last_name: string
    email: string
    office_phone: string
    position: string
  }
}

export function EventGuestTable({ eventId }: { eventId: number }) {
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchGuests()
  }, [searchQuery, currentPage])

  async function fetchGuests() {
    console.log("Fetching guests")
    const { data, error, count } = await supabase
      .from('event_guest')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name, email, office_phone, position)
      `, { count: 'exact' })
      .eq('event_id', eventId)
      .ilike('name', `%${searchQuery}%`)
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
  
    if (error) {
      console.error('Error fetching guests:', error)
      return
    }
  
    if (data && count !== null) {
      const sortedData = data.sort((a, b) => {
        const companyNameA = a.is_client_company ? a.company?.razon_social : a.company_razon_social;
        const companyNameB = b.is_client_company ? b.company?.razon_social : b.company_razon_social;
        return (companyNameA || '').localeCompare(companyNameB || '');
      });
      setGuests(sortedData)
      setTotalPages(Math.ceil(count / itemsPerPage))
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      <span>
        Página {currentPage} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Lista de invitados</h1>
        </div>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <PaginationControls />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Cargo</TableHead>
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
            <>
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
                <TableCell>
                  {guest.is_user 
                    ? guest.executive?.position ?? '' 
                    : guest.position ?? ''}
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
                      onClick={() => setEditingGuestId(guest.id)}
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
              {editingGuestId === guest.id && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <div className="space-y-4">
                      <EditGuestForm 
                        guestId={parseInt(guest.id)} 
                        onComplete={() => {
                          setEditingGuestId(null)
                          fetchGuests()
                        }} 
                      />
                      <div className="flex">
                        <Button 
                          variant="outline"
                          onClick={() => setEditingGuestId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
      <PaginationControls />
    </div>
  )
}

