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
  country: string
  department: string
  district: string
  address: string
  phone_number: string
  industry: string
  membership_type: string
  status: string
  membership_expire_date: string
  enrollment_date: string
  seats: number
  extra_seats: number
  panorama_economico_politico: boolean
  informe_sae: boolean
  sae_mercados: boolean
  meetings_amount: number
  query_access: boolean
  oc_needed: boolean
  bill_currency: string
  bill_amount: number
  payment_frecuency: string
  notes: string
  virtual_member: number
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

  function booleanToSiNo(value: boolean): string {
    return value ? 'Sí' : 'No'
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
            <TableHead>País</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Distrito</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Tipo de Membresía</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fecha de Término</TableHead>
            <TableHead>Fecha de Ingreso</TableHead>
            <TableHead>Titulares</TableHead>
            <TableHead>Cupos Adicionales</TableHead>
            <TableHead>Panorama Económico y Político</TableHead>
            <TableHead>Informe SAE</TableHead>
            <TableHead>SAE Mercados</TableHead>
            <TableHead>Cantidad de Reuniones</TableHead>
            <TableHead>Daily Note</TableHead>
            <TableHead>Titular Virtual</TableHead>
            <TableHead>Acceso a Consultas</TableHead>
            <TableHead>Necesita O/C</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Forma de Pago</TableHead>
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
              <TableCell>{company.country}</TableCell>
              <TableCell>{company.department}</TableCell>
              <TableCell>{company.district}</TableCell>
              <TableCell>{company.address}</TableCell>
              <TableCell>{company.phone_number}</TableCell>
              <TableCell>{company.industry}</TableCell>
              <TableCell>{company.membership_type}</TableCell>
              <TableCell>{company.status}</TableCell>
              <TableCell>{company.membership_expire_date}</TableCell>
              <TableCell>{company.enrollment_date}</TableCell>
              <TableCell>{company.seats}</TableCell>
              <TableCell>{company.extra_seats}</TableCell>
              <TableCell>{booleanToSiNo(company.panorama_economico_politico)}</TableCell>
              <TableCell>{booleanToSiNo(company.informe_sae)}</TableCell>
              <TableCell>{booleanToSiNo(company.sae_mercados)}</TableCell>
              <TableCell>{company.meetings_amount}</TableCell>
              <TableCell>{booleanToSiNo(company.query_access)}</TableCell>
              <TableCell>{company.virtual_member}</TableCell>
              <TableCell>{booleanToSiNo(company.query_access)}</TableCell>
              <TableCell>{booleanToSiNo(company.oc_needed)}</TableCell>
              <TableCell>{`${company.bill_currency} ${company.bill_amount}`}</TableCell>
              <TableCell>{company.payment_frecuency}</TableCell>
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