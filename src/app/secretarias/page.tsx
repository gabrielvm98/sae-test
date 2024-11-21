'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Assistant = {
  id: number
  dni: string
  name: string
  last_name: string
  email: string
  company_id: number
  cc_office_phone: string
  office_phone: string
  office_phone_extension: string
  cc_mobile_phone: string
  mobile_phone: string
  company: {
    razon_social: string
  }
}

export default function SecretariasPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAssistants()
  }, [searchQuery])

  async function fetchAssistants() {
    let query = supabase
      .from('assistant')
      .select(`
        *,
        company:company_id (razon_social)
      `)

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assistants:', error)
    } else {
      setAssistants(data || [])
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
          <h1 className="text-2xl font-bold">Lista de Secretarias</h1>
          <Button asChild>
            <Link href="/secretarias/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Secretaria
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
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
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Celular</TableHead>
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
              <TableCell>{assistant.company.razon_social}</TableCell>
              <TableCell>{formatPhoneNumber(assistant.cc_office_phone, assistant.office_phone, assistant.office_phone_extension)}</TableCell>
              <TableCell>{formatPhoneNumber(assistant.cc_mobile_phone, assistant.mobile_phone)}</TableCell>
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