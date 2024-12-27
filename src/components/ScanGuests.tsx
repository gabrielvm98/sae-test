'use client'

import { useState } from 'react'
import { QrReader } from 'react-qr-reader'

interface ScanQRTabProps {
  eventId: number
}

export function ScanQRTab({ eventId }: ScanQRTabProps) {
  const [isScanning, setIsScanning] = useState(false)

  const startScanning = () => {
    setIsScanning(true)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div>
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result) => result && console.log('QR Code scanned:', result.getText(), eventId)}
            containerStyle={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
            videoStyle={{ width: '100%', height: 'auto' }}
          />
          <button onClick={stopScanning} className="w-full bg-red-500 text-white py-2 mt-4 rounded">Detener Escaneo</button>
        </div>
      ) : (
        <button onClick={startScanning} className="w-full bg-green-500 text-white py-2 mt-4 rounded">Iniciar Escaneo de QR</button>
      )}
    </div>
  )
}
