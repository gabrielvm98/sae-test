'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

export function UploadZoomAttendance({ eventId }: { eventId: number }) {
  const [file, setFile] = useState<File | null>(null)
  console.log(eventId)


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
      >
        <p>Arrastra y suelta un archivo CSV de asistencia de Zoom aquí, o haz clic para seleccionar un archivo</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          id="zoom-csv-upload"
        />
        <label htmlFor="zoom-csv-upload" className="mt-2 inline-block">
          <Button variant="outline" type="button">Seleccionar archivo</Button>
        </label>
      </div>
      {file && <p>Archivo seleccionado: {file.name}</p>}
      <Button disabled>Subir asistencia de Zoom</Button>
    </div>
  )
}