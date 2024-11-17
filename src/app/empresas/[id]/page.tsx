'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { Eye, Pencil } from 'lucide-react'

type Company = {
  id: number
  ruc: string
  razon_social: string
  nombre_comercial: string
  seats: number
}

type Executive = {
  id: number
  dni: string
  name: string
  last_name: string
}

type Assistant = {
  id: number
  dni: string
  name: string
  last_name: string
  email: string
}

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const params = useParams()

  const fetchCompany = useCallback(async () => {
    if (typeof params.id !== 'string') return
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
  }, [params.id])

  const fetchExecutives = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('executive')
      .select('id, dni, name, last_name')
      .eq('company_id', params.id)

    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }, [params.id])

  const fetchAssistants = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('assistant')
      .select('id, dni, name, last_name, email')
      .eq('company_id', params.id)

    if (error) {
      console.error('Error fetching assistants:', error)
    } else {
      setAssistants(data || [])
    }
  }, [params.id])

  useEffect(() => {
    fetchCompany()
    fetchExecutives()
    fetchAssistants()
  }, [fetchCompany, fetchExecutives, fetchAssistants])

  if (!company) return <div>Loading...</div>

  return (
    <div className="space-y-8">
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

      <div>
        <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executives.map((executive) => (
              <TableRow key={executive.id}>
                <TableCell>{executive.dni}</TableCell>
                <TableCell>{executive.name}</TableCell>
                <TableCell>{executive.last_name}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/usuarios/${executive.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/usuarios/${executive.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Secretarias</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assistants.map((assistant) => (
              <TableRow key={assistant.id}>
                <TableCell>{assistant.dni}</TableCell>
                <TableCell>{assistant.name}</TableCell>
                <TableCell>{assistant.last_name}</TableCell>
                <TableCell>{assistant.email}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/secretarias/${assistant.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/secretarias/${assistant.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}