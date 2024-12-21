'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Event = {
  id: number
  name: string
  event_type: string
  date_hour: string
  place: string
}

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [searchQuery])

  async function fetchEvents() {
    let query = supabase.from('event').select('*')

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
  }

  function formatDateHour(dateHour: string) {
    const date = new Date(dateHour)
    return {
      date: date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lista de eventos</h1>
          <Button asChild>
            <Link href="/eventos/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar evento
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre del evento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4">
        <Button asChild>
            <Link href="/eventos/reportes">
              <Eye className="mr-2 h-4 w-4" /> Ver reportes
            </Link>
          </Button>
          </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del evento</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Lugar</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const { date, time } = formatDateHour(event.date_hour)
            return (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.event_type}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>{time}</TableCell>
                <TableCell>{event.place}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/eventos/${event.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/eventos/${event.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Borrar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}