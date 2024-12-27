'use client'

import { use } from 'react'
import { ScanQRTab } from '@/components/ScanGuests'

export default function EventScanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Evento ID: {resolvedParams.id}</h1>
      <div>
        <ScanQRTab eventId={Number(resolvedParams.id)} />
      </div>
    </div>
  )
}
