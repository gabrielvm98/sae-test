'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Query = {
  id: number
  company_id: number
  executive_id: number | null
  other_executive: boolean
  other_fullname: string | null
  other_email: string | null
  assignee: string[]
  description: string
  solved_date: string | null
  company: {
    razon_social: string
  }
  executive: {
    name: string
    last_name: string
  }
}

export default function ConsultasPage() {
  const [queries, setQueries] = useState<Query[]>([])

  useEffect(() => {
    fetchQueries()
  }, [])

  async function fetchQueries() {
    const { data, error } = await supabase
      .from('query')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name)
      `)
    
    if (error) {
      console.error('Error fetching queries:', error)
    } else {
      setQueries(data || [])
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista de Consultas</h1>
        <Button asChild>
          <Link href="/consultas/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Consulta
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Encargado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha de resolución</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.id}>
              <TableCell>{query.company.razon_social}</TableCell>
              {query.other_executive ? (
                <TableCell>{query.other_fullname}</TableCell>
              ) : (
                <TableCell>{`${query.executive.name} ${query.executive.last_name}`}</TableCell>
              )}
              <TableCell>{query.assignee.join(', ')}</TableCell>
              <TableCell>{query.description.substring(0, 50)}...</TableCell>
              <TableCell>{query.solved_date || 'Pendiente'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/consultas/${query.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/consultas/${query.id}/edit`}>
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