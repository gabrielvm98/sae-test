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
}

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    const { data, error } = await supabase
      .from('company')
      .select('*')
    
    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista de Empresas</h1>
        <Button asChild>
          <Link href="/empresas/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Empresa
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RUC</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Nombre Comercial</TableHead>
            <TableHead>Titulares</TableHead>
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