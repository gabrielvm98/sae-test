'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowLeft, Pencil, Building, User, Calendar, FileText, Users, Briefcase, IdCard } from 'lucide-react'

type Project = {
  id: number
  project_code: string
  company_id: number
  executive_id: number
  other_executive: boolean
  other_fullname: string | null
  other_email: string | null
  assignee: string[]
  start_date: string
  end_date: string
  status: string
  comments: string
  company: {
    razon_social: string
  }
  executive: {
    name: string
    last_name: string
    position: string
  }
}

export default function ProjectDetailsPage() {
  const [project, setProject] = useState<Project | null>(null)
  const params = useParams()

  const fetchProject = useCallback(async () => {
    if (typeof params.id !== 'string') return
    const { data, error } = await supabase
      .from('project')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name, position)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
    } else {
      setProject(data)
    }
  }, [params.id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (!project) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Proyecto</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/proyectos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/proyectos/${project.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Building className="inline mr-2" /> <strong>Empresa:</strong> {project.company.razon_social}</p>
            <p><IdCard className="inline mr-2" /> <strong>Código:</strong> {project.project_code}</p>
            {project.other_executive ? 
            (<p><User className="inline mr-2" /> <strong>Solicitante:</strong> {project.other_fullname}</p>) :
            (<p><User className="inline mr-2" /> <strong>Solicitante:</strong> {`${project.executive.name} ${project.executive.last_name}`}</p>)}
            {project.other_executive ? 
            (<p><Briefcase className="inline mr-2"/><strong>Cargo del Solicitante:</strong> No disponible</p>) :
            (<p><Briefcase className="inline mr-2"/><strong>Cargo del Solicitante:</strong> {project.executive.position}</p>)}
            <p><strong>Status:</strong> {project.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><Calendar className="inline mr-2" /> <strong>Fecha de ingreso:</strong> {project.start_date}</p>
            <p><Calendar className="inline mr-2" /> <strong>Fecha de cierre:</strong> {project.end_date || 'No especificada'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsables</CardTitle>
          </CardHeader>
          <CardContent>
            <p><Users className="inline mr-2" /> {project.assignee.join(', ')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p><FileText className="inline mr-2" /> {project.comments}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}