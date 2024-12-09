'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventGuestTable } from '@/components/EventGuestTable'
import { CreateGuestForm } from '@/components/CreateGuestForm'
import { ImportUsers } from '@/components/ImportUsers'
import { ImportExternals } from '@/components/ImportExternals'
import { UploadZoomAttendance } from '@/components/UploadZoomAttendance'
import { EventReportTab } from '@/components/EventReportTab'
import { useSearchParams } from 'next/navigation'

type Event = {
  id: number
  name: string
  event_type: string
  date_hour: string
  place: string
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)

  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'invitados' // Leer el tab de la URL o usar "invitados" por defecto.

  useEffect(() => {
    fetchEvent()
  }, [])

  async function fetchEvent() {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
    } else {
      setEvent(data)
    }
  }

  function formatDateHour(dateHour: string) {
    const date = new Date(dateHour)
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  if (!event) return <div>Cargando...</div>

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">{event.name}</h1>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p><strong>Modalidad:</strong> {event.event_type}</p>
          <p><strong>Fecha y hora:</strong> {formatDateHour(event.date_hour)}</p>
        </div>
        <div>
          <p><strong>Lugar:</strong> {event.place}</p>
        </div>
      </div>
      
      <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="sm:hidden flex gap-2 overflow-x-auto scrollbar-hide w-full">
        <TabsTrigger value="invitados" className="flex-shrink-0 text-sm px-4 py-2">
          Invitados
        </TabsTrigger>
        <TabsTrigger value="importar-usuarios" className="flex-shrink-0 text-sm px-4 py-2">
          Importar Usuarios
        </TabsTrigger>
        <TabsTrigger value="importar-externos" className="flex-shrink-0 text-sm px-4 py-2">
          Importar Externos
        </TabsTrigger>
        <TabsTrigger value="subir-asistencia" className="flex-shrink-0 text-sm px-4 py-2">
          Subir Asistencia Zoom
        </TabsTrigger>
        <TabsTrigger value="reporte" className="flex-shrink-0 text-sm px-4 py-2">
          Reporte
        </TabsTrigger>
      </TabsList>
      <TabsList className="hidden sm:grid w-full grid-cols-5">
        <TabsTrigger value="invitados">Invitados</TabsTrigger>
        <TabsTrigger value="importar-usuarios">Importar Usuarios</TabsTrigger>
        <TabsTrigger value="importar-externos">Importar Externos</TabsTrigger>
        <TabsTrigger value="subir-asistencia">Subir Asistencia Zoom</TabsTrigger>
        <TabsTrigger value="reporte">Reporte</TabsTrigger>
      </TabsList>
        
        <TabsContent value="invitados">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cerrar formulario' : 'Añadir invitado'}
              </Button>
              <Button variant="outline">Descargar CSV</Button>
            </div>
            {showForm && <CreateGuestForm eventId={parseInt(resolvedParams.id)} onComplete={() => setShowForm(false)} />}
            <EventGuestTable eventId={parseInt(resolvedParams.id)} />
          </div>
        </TabsContent>
        
        <TabsContent value="importar-usuarios">
          <ImportUsers eventId={parseInt(resolvedParams.id)} />
        </TabsContent>
        
        <TabsContent value="importar-externos">
          <ImportExternals eventId={parseInt(resolvedParams.id)} />
        </TabsContent>
        
        <TabsContent value="subir-asistencia">
          <UploadZoomAttendance eventId={parseInt(resolvedParams.id)} />
        </TabsContent>

        <TabsContent value="reporte">
          <EventReportTab eventId={parseInt(resolvedParams.id)}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}