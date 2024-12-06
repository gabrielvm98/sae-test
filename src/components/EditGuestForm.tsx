'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type EditGuestFormProps = {
  guestId: number
  onComplete: () => void
}

export function EditGuestForm({guestId, onComplete }: EditGuestFormProps) {
  const [virtualSessionTime, setVirtualSessionTime] = useState<number | null>(null)
  const [registered, setRegistered] = useState(false)
  const [assisted, setAssisted] = useState(false)
  const [eventGuestEmail, setEventGuestEmail] = useState('')

  useEffect(() => {
    fetchGuest()
  }, [guestId])

  async function fetchGuest() {
    const { data, error } = await supabase
      .from('event_guest')
      .select('virtual_session_time, registered, assisted, email')
      .eq('id', guestId)
      .single()
    if (error) {
      console.error('Error fetching guest:', error)
    } else if (data) {
      setVirtualSessionTime(data.virtual_session_time)
      setRegistered(data.registered)
      setAssisted(data.assisted)
      setEventGuestEmail(data.email)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const guest = {
      virtual_session_time: virtualSessionTime,
      registered,
      assisted,
      email: eventGuestEmail,
    }

    const { error } = await supabase
      .from('event_guest')
      .update(guest)
      .eq('id', guestId)
    if (error) console.error('Error updating guest:', error)
    else onComplete()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="virtualSessionTime">Tiempo en sesión virtual (minutos)</Label>
        <Input
          id="virtualSessionTime"
          type="number"
          value={virtualSessionTime?.toString() || ''}
          onChange={(e) => setVirtualSessionTime(parseInt(e.target.value) || null)}
        />
      </div>
      <div>
        <Label>
          <Checkbox 
            checked={registered} 
            onCheckedChange={(checked) => setRegistered(checked as boolean)}
          />
          {' '}Registrado
        </Label>
      </div>
      <div>
        <Label>
          <Checkbox 
            checked={assisted} 
            onCheckedChange={(checked) => setAssisted(checked as boolean)}
          />
          {' '}Asistió
        </Label>
      </div>
      <div>
        <Label htmlFor="eventGuestEmail">Email del evento</Label>
        <Input
          id="eventGuestEmail"
          type="email"
          value={eventGuestEmail}
          onChange={(e) => setEventGuestEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Actualizar</Button>
    </form>
  )
}

