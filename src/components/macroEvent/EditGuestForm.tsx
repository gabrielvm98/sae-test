'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditGuestFormProps = {
  guestId: number
  onComplete: () => void
}

export function EditGuestForm({guestId, onComplete }: EditGuestFormProps) {
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
      setEventGuestEmail(data.email)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from('event_guest')
      .update({ email: eventGuestEmail })
      .eq('id', guestId);

    if (error) {
      console.error('Error updating guest email:', error);
    } else {
      onComplete();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

