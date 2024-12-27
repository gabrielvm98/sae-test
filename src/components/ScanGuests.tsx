'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'

interface ScanQRTabProps {
  eventId: number
}

export function ScanQRTab({ eventId }: ScanQRTabProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (err) {
      console.error('Error checking camera permission:', err)
      setHasPermission(false)
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setScannedData(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const handleScan = (result: IDetectedBarcode[]) => {
    if (result && result.length > 0) {
      // Assuming you want to use the first detected barcode's text
      const barcodeText = result[0].rawValue;  // Replace `.text` with the actual property if necessary
      console.log('QR Code scanned:', barcodeText, eventId)
      setScannedData(barcodeText)  // Store the text of the first barcode
      stopScanning()
    }
  }

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.error('Error scanning QR code:', error);
    } else {
      console.error('Unknown error scanning QR code:', error);
    }
  }
  

  if (hasPermission === false) {
    return <div className="text-red-500">Camera permission is required to scan QR codes.</div>
  }

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div className="space-y-4">
          <Scanner
            onScan={(result) => handleScan(result)}
            onError={handleError}            
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
