'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { ArrowLeft, Pencil, Building, User, Mail, Phone, Calendar } from 'lucide-react'

type Executive = {
  id: number
  dni: string
  name: string
  last_name: string
  company_id: number
  assistant_id: number
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

export default function ExecutiveDetailsPage() {
  const [executive, setExecutive] = useState<Executive | null>(null)
  const params = useParams()

  const fetchExecutive = useCallback(async () => {
    if (typeof params.id !== 'string') return
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
  }, [params.id])

  useEffect(() => {
    fetchExecutive()
  }, [fetchExecutive])

  if (!executive) return <div>Loading...</div>

  function formatPhoneNumber(cc: string, phone: string, extension?: string) {
    let formattedPhone = `${cc} ${phone}`
    if (extension) {
      formattedPhone += ` (${extension})`
    }
    return formattedPhone
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Usuario</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/usuarios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/usuarios/${executive.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><User className="inline mr-2" /> <strong>Nombre:</strong> {executive.name} {executive.last_name}</p>
            <p><strong>DNI:</strong> {executive.dni}</p>
            <p><strong>Tareco:</strong> {executive.tareco}</p>
            <p><Calendar className="inline mr-2" /> <strong>Fecha de Nacimiento:</strong> {executive.birth_date}</p>
            <p><strong>País:</strong> {executive.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Building className="inline mr-2" /> <strong>Empresa:</strong> {executive.company.razon_social}</p>
            <p><strong>Cargo:</strong> {executive.position}</p>
            <p><strong>Área:</strong> {executive.area}</p>
            <p><strong>Tipo de usuario:</strong> {executive.user_type}</p>
            <p><strong>Status:</strong> <Badge variant={executive.active ? "default" : "secondary"}>{executive.active ? 'Activo' : 'No activo'}</Badge></p>
            <p><strong>Secretaria:</strong> {`${executive.assistant.name} ${executive.assistant.last_name}`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Phone className="inline mr-2" /> <strong>Teléfono:</strong> {formatPhoneNumber(executive.office_phone_cc, executive.office_phone, executive.office_phone_extension)}</p>
            <p><Phone className="inline mr-2" /> <strong>Celular:</strong> {formatPhoneNumber(executive.mobile_phone_cc, executive.mobile_phone)}</p>
            <p><Mail className="inline mr-2" /> <strong>Email:</strong> {executive.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Calendar className="inline mr-2" /> <strong>Fecha de ingreso:</strong> {executive.start_date}</p>
            <p><Calendar className="inline mr-2" /> <strong>Fecha de baja:</strong> {executive.end_date || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}