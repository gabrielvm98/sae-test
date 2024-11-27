'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EventFormProps = {
  eventId?: number
}

const eventTypeOptions = ['Presencial', 'Virtual', 'Híbrido']

export function EventForm({ eventId }: EventFormProps) {
  const [name, setName] = useState('')
  const [eventType, setEventType] = useState('')
  const [dateHour, setDateHour] = useState('')
  const [place, setPlace] = useState('')

  const router = useRouter()

  const fetchEvent = useCallback(async () => {
    if (!eventId) return
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
    } else if (data) {
      setName(data.name)
      setEventType(data.event_type)
      setDateHour(data.date_hour)
      setPlace(data.place)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId, fetchEvent])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const event = {
      name,
      event_type: eventType,
      date_hour: dateHour,
      place
    }

    if (eventId) {
      const { error } = await supabase
        .from('event')
        .update(event)
        .eq('id', eventId)

      if (error) console.error('Error updating event:', error)
      else router.push('/eventos')
    } else {
      const { error } = await supabase
        .from('event')
        .insert([event])

      if (error) console.error('Error creating event:', error)
      else router.push('/eventos')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del evento</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="eventType">Modalidad</Label>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la modalidad" />
          </SelectTrigger>
          <SelectContent>
            {eventTypeOptions.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="dateHour">Fecha y hora</Label>
        <Input
          id="dateHour"
          type="datetime-local"
          value={dateHour}
          onChange={(e) => setDateHour(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="place">Lugar</Label>
        <Input
          id="place"
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{eventId ? 'Actualizar' : 'Crear'} evento</Button>
    </form>
  )
}