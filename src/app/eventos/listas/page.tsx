'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Eye} from 'lucide-react'

type Event = {
  id: number
  name: string
  event_type: string
  date_hour: string
  place: string
  register_open: boolean
}

export default function EventosPage() {
  const [, setEvents] = useState<Event[]>([])
  const [searchQuery, ] = useState('')

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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Listas de envío del evento SAE Enero</h1>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modalidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow key={1}>
                <TableCell>Presencial</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                    <Link href={`/eventos/listas/53,60,61,62`}>
                    <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow key={2}>
                <TableCell>Virtual</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                    <Link href={`/eventos/listas/55`}>
                    <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}