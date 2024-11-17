'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function AssistantDetailsPage() {
  const [assistant, setAssistant] = useState<any>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      fetchAssistant()
    }
  }, [params.id])

  async function fetchAssistant() {
    const { data, error } = await supabase
      .from('assistant')
      .select(`
        *,
        company:company_id (razon_social)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching assistant:', error)
    } else {
      setAssistant(data)
    }
  }

  if (!assistant) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detalles de la Secretaria</h1>
      <div className="space-y-2">
        <p><strong>DNI:</strong> {assistant.dni}</p>
        <p><strong>Nombre:</strong> {assistant.name}</p>
        <p><strong>Apellido:</strong> {assistant.last_name}</p>
        <p><strong>Email:</strong> {assistant.email}</p>
        <p><strong>Empresa:</strong> {assistant.company.razon_social}</p>
      </div>
      <div className="mt-4 space-x-2">
        <Button asChild>
          <Link href={`/secretarias/${assistant.id}/edit`}>Editar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/secretarias">Volver</Link>
        </Button>
      </div>
    </div>
  )
}