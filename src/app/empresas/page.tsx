'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Company = {
  id: number
  ruc: string
  razon_social: string
  nombre_comercial: string
  seats: number
  country: string
  department: string
  address: string
  phone_number: string
  industry: string
  status: string
  enrollment_date: string
  notes: string
  headcount: number
  sales: number
}

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [searchQuery])

  async function fetchCompanies() {
    let query = supabase.from('company').select('*')

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`razon_social.ilike.%${searchQuery}%,nombre_comercial.ilike.%${searchQuery}%,ruc.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lista de empresas</h1>
          <Button asChild>
            <Link href="/empresas/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar empresa
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre de empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RUC</TableHead>
            <TableHead>Razón social</TableHead>
            <TableHead>Nombre comercial</TableHead>
            <TableHead>Titulares</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            <TableHead>Número de trabajadores</TableHead>
            <TableHead>Ventas</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.ruc}</TableCell>
              <TableCell>{company.razon_social}</TableCell>
              <TableCell>{company.nombre_comercial}</TableCell>
              <TableCell>{company.seats}</TableCell>
              <TableCell>{company.country}</TableCell>
              <TableCell>{company.department}</TableCell>
              <TableCell>{company.address}</TableCell>
              <TableCell>{company.phone_number}</TableCell>
              <TableCell>{company.industry}</TableCell>
              <TableCell>{company.status}</TableCell>
              <TableCell>{company.enrollment_date}</TableCell>
              <TableCell>{company.headcount}</TableCell>
              <TableCell>{company.sales}</TableCell>
              <TableCell>{company.notes}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/empresas/${company.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/empresas/${company.id}/edit`}>
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