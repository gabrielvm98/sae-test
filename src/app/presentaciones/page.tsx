'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Presentation = {
  id: number
  company_id: number
  executive_id: number
  other_executive: boolean
  other_fullname: string | null
  other_email: string | null
  elaboration_assignee: string[]
  presentation_assignee: string[]
  order_source: string
  order_date: string
  presentation_date_hour: string
  presentation_type: string
  modalidad: string
  comments: string
  billable: boolean
  billable_currency: string | null
  billable_amount: number | null
  company: {
    razon_social: string
  }
  executive: {
    name: string
    last_name: string
  }
}

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([])

  useEffect(() => {
    fetchPresentations()
  }, [])

  async function fetchPresentations() {
    const { data, error } = await supabase
      .from('presentation')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name)
      `)
    
    if (error) {
      console.error('Error fetching presentations:', error)
    } else {
      setPresentations(data || [])
    }
  }

  function formatListOfStrings(list: string[]) {
    return list.join(', ')
  }

  function formatBillableInfo(presentation: Presentation) {
    if (presentation.billable && presentation.billable_currency && presentation.billable_amount) {
      return `${presentation.billable_currency} ${presentation.billable_amount.toFixed(2)}`
    }
    return 'No facturable'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Lista de presentaciones</h1>
        <Button asChild>
          <Link href="/presentaciones/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar presentación
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Responsable(s) de la elaboración</TableHead>
            <TableHead>Expositor(es)</TableHead>
            <TableHead>Origen de solicitud</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            <TableHead>Fecha y hora de presentación</TableHead>
            <TableHead>Tipo de presentación</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Facturación</TableHead>
            <TableHead>Comentarios</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {presentations.map((presentation) => (
            <TableRow key={presentation.id}>
              <TableCell>{presentation.company.razon_social}</TableCell>
              { presentation.other_executive ? (
                <TableCell>{presentation.other_fullname}</TableCell>
              ) : (
                <TableCell>{`${presentation.executive.name} ${presentation.executive.last_name}`}</TableCell>
              )}
              <TableCell>{formatListOfStrings(presentation.elaboration_assignee)}</TableCell>
              <TableCell>{formatListOfStrings(presentation.presentation_assignee)}</TableCell>
              <TableCell>{presentation.order_source}</TableCell>
              <TableCell>{presentation.order_date}</TableCell>
              <TableCell>{presentation.presentation_date_hour}</TableCell>
              <TableCell>{presentation.presentation_type}</TableCell>
              <TableCell>{presentation.modalidad}</TableCell>
              <TableCell>{formatBillableInfo(presentation)}</TableCell>
              <TableCell>{presentation.comments}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/presentaciones/${presentation.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/presentaciones/${presentation.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Borrar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}