'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ScanQRTab } from '@/components/ScanGuests'

export default function EventScanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [event, setEvent] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [])

  async function fetchEvent() {
    const { data, error } = await supabase
      .from('event')
      .select('id, name')
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
    } else {
      setEvent(data)
    }
  }

  if (!event) return <div>Cargando...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scan: {event.name}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Scanner Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Scanner</h2>
          <ScanQRTab eventId={event.id} />
        </div>        
      </div>
    </div>
  )
}
