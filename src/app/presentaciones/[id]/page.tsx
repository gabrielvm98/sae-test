'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowLeft, Pencil, Building, User, Calendar, FileText, Users, Briefcase } from 'lucide-react'

type Presentation = {
  id: number
  company_id: number
  executive_id: number
  elaboration_assignee: string[]
  presentation_assignee: string[]
  order_source: string
  order_date: string
  presentation_date_hour: string
  presentation_type: string
  modalidad: string
  comments: string
  company: {
    razon_social: string
  }
  executive: {
    name: string
    last_name: string
    position: string
  }
}

export default function PresentationDetailsPage() {
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const params = useParams()

  const fetchPresentation = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('presentation')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name, position)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching presentation:', error)
    } else {
      setPresentation(data)
    }
  }, [params.id])

  useEffect(() => {
    fetchPresentation()
  }, [fetchPresentation])

  if (!presentation) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles de la Presentación</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/presentaciones">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/presentaciones/${presentation.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Building className="inline mr-2" /> <strong>Empresa:</strong> {presentation.company.razon_social}</p>
            <p><User className="inline mr-2" /> <strong>Solicitante:</strong> {`${presentation.executive.name} ${presentation.executive.last_name}`}</p>
            <p><Briefcase className="inline mr-2"/><strong>Cargo del Solicitante:</strong> {presentation.executive.position}</p>
            <p><strong>Origen de solicitud:</strong> {presentation.order_source}</p>
            <p><Calendar className="inline mr-2" /> <strong>Fecha de ingreso:</strong> {presentation.order_date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Presentación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Calendar className="inline mr-2" /> <strong>Fecha y hora:</strong> {presentation.presentation_date_hour}</p>
            <p><strong>Tipo:</strong> {presentation.presentation_type}</p>
            <p><strong>Modalidad:</strong> {presentation.modalidad}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsables y Expositores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Users className="inline mr-2" /> <strong>Responsable(s) de la elaboración:</strong> {presentation.elaboration_assignee.join(', ')}</p>
            <p><Users className="inline mr-2" /> <strong>Expositor(es):</strong> {presentation.presentation_assignee.join(', ')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p><FileText className="inline mr-2" /> {presentation.comments}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}