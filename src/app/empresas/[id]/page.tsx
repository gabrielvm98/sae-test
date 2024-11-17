'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<any>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.id) {
      fetchCompany()
    }
  }, [params.id])

  async function fetchCompany() {
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
    } else {
      setCompany(data)
    }
  }

  if (!company) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detalles de la Empresa</h1>
      <div className="space-y-2">
        <p><strong>RUC:</strong> {company.ruc}</p>
        <p><strong>Razón Social:</strong> {company.razon_social}</p>
        <p><strong>Nombre Comercial:</strong> {company.nombre_comercial}</p>
        <p><strong>Número de Asientos:</strong> {company.seats}</p>
      </div>
      <div className="mt-4 space-x-2">
        <Button asChild>
          <Link href={`/empresas/${company.id}/edit`}>Editar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/empresas">Volver</Link>
        </Button>
      </div>
    </div>
  )
}