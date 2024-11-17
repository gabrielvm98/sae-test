'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

type Query = {
  id: number
  company_id: number
  executive_id: number
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

export default function QueryDetailsPage() {
  const [query, setQuery] = useState<Query | null>(null)
  const params = useParams()

  const fetchQuery = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('query')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching query:', error)
    } else {
      setQuery(data)
    }
  }, [params.id])

  useEffect(() => {
    fetchQuery()
  }, [fetchQuery])

  if (!query) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detalles de la Consulta</h1>
      <div className="space-y-2">
        <p><strong>Empresa:</strong> {query.company.razon_social}</p>
        <p><strong>Solicitante:</strong> {`${query.executive.name} ${query.executive.last_name}`}</p>
        <p><strong>Encargado:</strong> {query.assignee.join(', ')}</p>
        <p><strong>Descripción:</strong> {query.description}</p>
        <p><strong>Fecha de resolución:</strong> {query.solved_date || 'Pendiente'}</p>
      </div>
      <div className="mt-4 space-x-2">
        <Button asChild>
          <Link href={`/consultas/${query.id}/edit`}>Editar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/consultas">Volver</Link>
        </Button>
      </div>
    </div>
  )
}