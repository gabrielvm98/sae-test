'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { Eye, Pencil, Building, Users, UserPlus } from 'lucide-react'

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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles de la Empresa</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link href={`/empresas/${company.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/empresas">
              <Building className="mr-2 h-4 w-4" />
              Volver a Empresas
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles de la Empresa</TabsTrigger>
          <TabsTrigger value="users">Usuarios y Secretarias</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="font-semibold">RUC:</dt>
                  <dd>{company.ruc}</dd>
                  <dt className="font-semibold">Razón Social:</dt>
                  <dd>{company.razon_social}</dd>
                  <dt className="font-semibold">Nombre Comercial:</dt>
                  <dd>{company.nombre_comercial}</dd>
                  <dt className="font-semibold">País:</dt>
                  <dd>{company.country}</dd>
                  <dt className="font-semibold">Departamento:</dt>
                  <dd>{company.department}</dd>
                  <dt className="font-semibold">Distrito:</dt>
                  <dd>{company.district}</dd>
                  <dt className="font-semibold">Dirección:</dt>
                  <dd>{company.address}</dd>
                  <dt className="font-semibold">Teléfono:</dt>
                  <dd>{company.phone_number}</dd>
                  <dt className="font-semibold">Sector:</dt>
                  <dd>{company.industry}</dd>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Membresía</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="font-semibold">Tipo de Membresía:</dt>
                  <dd>{company.membership_type}</dd>
                  <dt className="font-semibold">Status:</dt>
                  <dd>{company.status}</dd>
                  <dt className="font-semibold">Fecha de Término:</dt>
                  <dd>{company.membership_expire_date}</dd>
                  <dt className="font-semibold">Fecha de Ingreso:</dt>
                  <dd>{company.enrollment_date}</dd>
                  <dt className="font-semibold">Cantidad de Titulares:</dt>
                  <dd>{company.seats}</dd>
                  <dt className="font-semibold">Cupos Adicionales:</dt>
                  <dd>{company.extra_seats}</dd>
                  <dt className="font-semibold">Titular Virtual:</dt>
                  <dd>{company.virtual_member}</dd>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Servicios y Accesos</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="font-semibold">Panorama Económico y Político:</dt>
                  <dd>{company.panorama_economico_politico ? 'Sí' : 'No'}</dd>
                  <dt className="font-semibold">Informe SAE:</dt>
                  <dd>{company.informe_sae ? 'Sí' : 'No'}</dd>
                  <dt className="font-semibold">SAE Mercados:</dt>
                  <dd>{company.sae_mercados ? 'Sí' : 'No'}</dd>
                  <dt className="font-semibold">Cantidad de Reuniones:</dt>
                  <dd>{company.meetings_amount}</dd>
                  <dt className="font-semibold">Acceso a Consultas:</dt>
                  <dd>{company.query_access ? 'Sí' : 'No'}</dd>
                  <dt className="font-semibold">Necesita O/C:</dt>
                  <dd>{company.oc_needed ? 'Sí' : 'No'}</dd>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Facturación y Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="font-semibold">Moneda de Facturación:</dt>
                  <dd>{company.bill_currency}</dd>
                  <dt className="font-semibold">Monto de Facturación:</dt>
                  <dd>{company.bill_amount}</dd>
                  <dt className="font-semibold">Forma de Pago:</dt>
                  <dd>{company.payment_frecuency}</dd>
                  <dt className="font-semibold">Notas:</dt>
                  <dd>{company.notes}</dd>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Usuarios</span>
                  <Button size="sm" asChild>
                    <Link href={`/usuarios/new?company_id=${company.id}`}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar Usuario
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Secretarias</span>
                  <Button size="sm" asChild>
                    <Link href={`/secretarias/new?company_id=${company.id}`}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar Secretaria
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}