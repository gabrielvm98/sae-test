'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { QrReader } from 'react-qr-reader'

interface ScanQRTabProps {
  eventId: number
}

export function ScanQRTab({ eventId }: ScanQRTabProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)

  const startScanning = () => {
    setIsScanning(true)
    setScannedData(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const handleScan = (result: string | null) => {
    if (result) {
      console.log('QR Code scanned:', result, eventId)
      setScannedData(result)
      stopScanning()
      // TODO lógica para procesar el código QR      
    }
  }

  /*const handleError = (error: Error) => {
    console.error('Error al escanear el código QR:', error)
  }*/

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div className="space-y-4">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result) => result && handleScan(result.getText())}
            containerStyle={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
            videoStyle={{ width: '100%', height: 'auto' }}
          />
          <Button onClick={stopScanning} className="w-full">Detener Escaneo</Button>
        </div>
      ) : (
        <Button onClick={startScanning} className="w-full">Iniciar Escaneo de QR</Button>
      )}
      {scannedData && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <p className="font-bold">Código QR escaneado:</p>
          <p>{scannedData}</p>
        </div>
      )}
    </div>
  )
}

