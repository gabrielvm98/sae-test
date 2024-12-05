'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { Eye, Pencil, Building, UserPlus } from 'lucide-react'

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

type Executive = {
  id: number
  dni: string
  name: string
  last_name: string
  membership_id: number | null
  assistant_id: number | null
}

type Assistant = {
  id: number
  dni: string
  name: string
  last_name: string
  email: string
}

type Membership = {
  id: number
  name: string
}

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
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
      .select('id, dni, name, last_name, membership_id, assistant_id')
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

  const fetchMemberships = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('membership')
      .select('id, name')
      .eq('company_id', params.id)

    if (error) {
      console.error('Error fetching memberships:', error)
    } else {
      setMemberships(data || [])
    }
  }, [params.id])

  useEffect(() => {
    fetchCompany()
    fetchExecutives()
    fetchAssistants()
    fetchMemberships()
  }, [fetchCompany, fetchExecutives, fetchAssistants, fetchMemberships])

  if (!company) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Detalles de la empresa</h1>
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
              Volver a empresas
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles de la empresa</TabsTrigger>
          <TabsTrigger value="users">Usuarios, membresías y secretarias</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información general</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt >RUC:</dt>
                  <dd>{company.ruc}</dd>
                  <dt >Razón social:</dt>
                  <dd>{company.razon_social}</dd>
                  <dt >Nombre comercial:</dt>
                  <dd>{company.nombre_comercial}</dd>
                  <dt >País:</dt>
                  <dd>{company.country}</dd>
                  <dt >Departamento:</dt>
                  <dd>{company.department}</dd>
                  <dt >Dirección:</dt>
                  <dd>{company.address}</dd>
                  <dt >Teléfono:</dt>
                  <dd>{company.phone_number}</dd>
                  <dt >Sector:</dt>
                  <dd>{company.industry}</dd>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de membresía</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt >Status:</dt>
                  <dd>{company.status}</dd>
                  <dt >Fecha de ingreso:</dt>
                  <dd>{company.enrollment_date}</dd>
                  <dt >Cantidad de titulares:</dt>
                  <dd>{company.seats}</dd>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <dt >Número de trabajadores:</dt>
                  <dd>{company.headcount}</dd>
                  <dt >Ventas:</dt>
                  <dd>{company.sales}</dd>
                  <dt >Notas:</dt>
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
                      Agregar usuario
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
                      <TableHead>Membresía</TableHead>
                      <TableHead>Secretaria</TableHead>
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
                          {memberships.find(m => m.id === executive.membership_id)?.name || 'No asignado'}
                        </TableCell>
                        <TableCell>
                          {assistants.find(a => a.id === executive.assistant_id)?.name || 'No asignado'}
                        </TableCell>
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
                  <span>Membresías</span>
                  <Button size="sm" asChild>
                    <Link href={`/membresias/new?company_id=${company.id}`}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar membresía
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell>{membership.name}</TableCell>
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
                      Agregar secretaria
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