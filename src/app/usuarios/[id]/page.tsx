'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function ExecutiveDetailsPage() {
  const [executive, setExecutive] = useState<any>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      fetchExecutive()
    }
  }, [params.id])

  async function fetchExecutive() {
    const { data, error } = await supabase
      .from('executive')
      .select(`
        *,
        company:company_id (razon_social),
        assistant:assistant_id (name, last_name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching executive:', error)
    } else {
      setExecutive(data)
    }
  }

  if (!executive) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detalles del Usuario</h1>
      <div className="space-y-2">
        <p><strong>DNI:</strong> {executive.dni}</p>
        <p><strong>Nombre:</strong> {executive.name}</p>
        <p><strong>Apellido:</strong> {executive.last_name}</p>
        <p><strong>Empresa:</strong> {executive.company.razon_social}</p>
        <p><strong>Secretaria:</strong> {`${executive.assistant.name} ${executive.assistant.last_name}`}</p>
      </div>
      <div className="mt-4 space-x-2">
        <Button asChild>
          <Link href={`/usuarios/${executive.id}/edit`}>Editar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/usuarios">Volver</Link>
        </Button>
      </div>
    </div>
  )
}