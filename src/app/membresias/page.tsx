'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Membership = {
  id: number
  name: string
  company: {
    razon_social: string
  }
  membership_type: string
  area: string
  titulares: number
  cupos_adicionales: number
  titular_adicional: number
  cupos_foros: number
  panorama_economico: boolean
  panorama_politico: boolean
  informe_sae: boolean
  sae_mercados: boolean
  cantidad_reuniones: number
  daily_note: boolean
  app_sae: boolean
  web_sae: boolean
  titular_virtual: number
  cantidad_presentaciones: number
  consultas_acceso: boolean
  fecha_renovacion: string
  payment_method: string
  payment_currency: string
  payment_amount: number
  oc_needed: boolean
  signed_proposal: boolean
  invoice_sent: boolean
  area_scope: boolean
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMemberships()
  }, [searchQuery])

  async function fetchMemberships() {
    let query = supabase
      .from('membership')
      .select(`
        *,
        company:company_id (razon_social)
      `)

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching memberships:', error)
    } else {
      setMemberships(data || [])
    }
  }
  const convertDateFormat = (dateString: string) => {
    if (!dateString) return ''
    // Split the date string
    const [year, month, day] = dateString.split('-')
    // Rearrange into DD-MM-YYYY format
    return `${day}-${month}-${year}`
  }
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lista de membresías</h1>
          <Button asChild>
            <Link href="/membresias/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar membresía
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre de membresía..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la membresía</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Tipo de membresía</TableHead>
            <TableHead>Membresía por área</TableHead>
            <TableHead>Titulares</TableHead>
            <TableHead>Cupos adicionales</TableHead>
            <TableHead>Fecha de renovación</TableHead>
            <TableHead>Forma de pago</TableHead>
            <TableHead>Renovación completa</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell>{membership.name}</TableCell>
              <TableCell>{membership.company.razon_social}</TableCell>
              <TableCell>{membership.membership_type}</TableCell>
              <TableCell>{membership.area_scope ? membership.area : 'General'}</TableCell>
              <TableCell>{membership.titulares}</TableCell>
              <TableCell>{membership.cupos_adicionales}</TableCell>
              <TableCell>{convertDateFormat(membership.fecha_renovacion)}</TableCell>
              <TableCell>{membership.payment_method}</TableCell>
              <TableCell>{membership.signed_proposal && membership.invoice_sent ? 'Sí' : 'No'}</TableCell>
              <TableCell>{`${membership.payment_currency} ${membership.payment_amount}`}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/membresias/${membership.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/membresias/${membership.id}/edit`}>
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