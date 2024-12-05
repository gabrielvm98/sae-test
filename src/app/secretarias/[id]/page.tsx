'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowLeft, Pencil, Building, User, Mail, Phone } from 'lucide-react'

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

export default function AssistantDetailsPage() {
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const params = useParams()

  const fetchAssistant = useCallback(async () => {
    if (typeof params.id !== 'string') return
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
  }, [params.id])

  useEffect(() => {
    fetchAssistant()
  }, [fetchAssistant])

  if (!assistant) return <div>Loading...</div>

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
        <h1 className="text-xl font-bold">Detalles de la secretaria</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/secretarias">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/secretarias/${assistant.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><User className="inline mr-2" /> Nombre: {assistant.name} {assistant.last_name}</p>
            <p>DNI: {assistant.dni}</p>
            <p><Mail className="inline mr-2" /> Email: {assistant.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Building className="inline mr-2" /> Empresa: {assistant.company.razon_social}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Phone className="inline mr-2" /> Teléfono de oficina: {formatPhoneNumber(assistant.cc_office_phone, assistant.office_phone, assistant.office_phone_extension)}</p>
            <p><Phone className="inline mr-2" /> Celular: {formatPhoneNumber(assistant.cc_mobile_phone, assistant.mobile_phone)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}