'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Executive = {
  id: number
  dni: string
  name: string
  last_name: string
  assistant_id: number
  company_id: number
  tareco: string
  birth_date: string
  country: string
  email: string
  position: string
  area: string
  user_type: string
  active: boolean
  office_phone_cc: string
  office_phone: string
  office_phone_extension: string
  mobile_phone_cc: string
  mobile_phone: string
  start_date: string
  end_date: string | null
  company: {
    razon_social: string
  }
  assistant: {
    name: string
    last_name: string
  }
}

export default function UsuariosPage() {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchExecutives()
  }, [searchQuery])

  async function fetchExecutives() {
    let query = supabase
      .from('executive')
      .select(`
        *,
        company:company_id (razon_social),
        assistant:assistant_id (name, last_name)
      `)

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }

  function formatPhoneNumber(cc: string, phone: string, extension?: string) {
    let formattedPhone = `${cc} ${phone}`
    if (extension) {
      formattedPhone += ` (${extension})`
    }
    return formattedPhone
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Lista de Usuarios</h1>
          <Button asChild>
            <Link href="/usuarios/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Usuario
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Secretaria</TableHead>
            <TableHead>Tareco</TableHead>
            <TableHead>Fecha de Nacimiento</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Tipo de usuario</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            <TableHead>Fecha de baja</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executives.map((executive) => (
            <TableRow key={executive.id}>
              <TableCell>{executive.dni}</TableCell>
              <TableCell>{executive.name}</TableCell>
              <TableCell>{executive.last_name}</TableCell>
              <TableCell>{executive.company.razon_social}</TableCell>
              <TableCell>{`${executive.assistant.name} ${executive.assistant.last_name}`}</TableCell>
              <TableCell>{executive.tareco}</TableCell>
              <TableCell>{executive.birth_date}</TableCell>
              <TableCell>{executive.country}</TableCell>
              <TableCell>{executive.email}</TableCell>
              <TableCell>{executive.position}</TableCell>
              <TableCell>{executive.area}</TableCell>
              <TableCell>{executive.user_type}</TableCell>
              <TableCell>{executive.active ? 'Activo' : 'No activo'}</TableCell>
              <TableCell>{formatPhoneNumber(executive.office_phone_cc, executive.office_phone, executive.office_phone_extension)}</TableCell>
              <TableCell>{formatPhoneNumber(executive.mobile_phone_cc, executive.mobile_phone)}</TableCell>
              <TableCell>{executive.start_date}</TableCell>
              <TableCell>{executive.end_date || 'N/A'}</TableCell>
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