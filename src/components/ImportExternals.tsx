'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'
import { toast } from "@/hooks/use-toast"

export function ImportExternals({ eventId }: { eventId: number }) {
  const [file, setFile] = useState<File | null>(null)

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

  const downloadTemplate = () => {
    const headers = ['Empresa', 'Nombre', 'DNI', 'Correo', 'Teléfono', 'Nombre de secretaria', 'Correo de secretaria']
    const csvContent = Papa.unparse([headers])
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'plantilla_invitados_externos.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un archivo CSV para cargar.",
        variant: "destructive",
      })
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const data = results.data as Array<{
          Empresa: string
          Nombre: string
          DNI: string
          Correo: string
          Teléfono: string
          'Nombre de secretaria': string
          'Correo de secretaria': string
        }>

        const eventGuests = data.map((row) => ({
          event_id: eventId,
          company_razon_social: row.Empresa,
          name: row.Nombre,
          dni: row.DNI,
          email: row.Correo,
          phone: row.Teléfono,
          assistant_name: row['Nombre de secretaria'],
          assistant_email: row['Correo de secretaria'],
          is_user: false,
          is_client_company: false
        }))

        const { error } = await supabase
          .from('event_guest')
          .upsert(eventGuests)

        if (error) {
          console.error('Error uploading event guests:', error)
          toast({
            title: "Error",
            description: "Hubo un problema al cargar los invitados externos.",
            variant: "destructive",
          })
        } else {
          console.log('Event guests uploaded successfully!')
          toast({
            title: "Éxito",
            description: "Los invitados externos se han cargado correctamente.",
          })
          setFile(null)
        }
      },
      error: function(error) {
        console.error('Error parsing CSV:', error)
        toast({
          title: "Error",
          description: "Hubo un problema al procesar el archivo CSV.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <Button onClick={downloadTemplate}>Descargar Plantilla CSV</Button>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
      >
        <p>Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar un archivo</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="mt-2 inline-block">
          <Button variant="outline" type="button">Seleccionar archivo</Button>
        </label>
      </div>
      {file && <p>Archivo seleccionado: {file.name}</p>}
      <Button onClick={handleFileUpload} disabled={!file}>Importar CSV</Button>
    </div>
  )
}