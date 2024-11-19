'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react'

type Project = {
  id: number
  company_id: number
  executive_id: number
  assignee: string[]
  start_date: string
  end_date: string
  status: 'Inicial' | 'Intermedio' | 'Avanzado' | 'Finalizado' | 'Propuesta enviada'
  comments: string
  company: {
    razon_social: string
  }
  executive: {
    name: string
    last_name: string
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('project')
      .select(`
        *,
        company:company_id (razon_social),
        executive:executive_id (name, last_name)
      `)
    
    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista de Proyectos</h1>
        <Button asChild>
          <Link href="/proyectos/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Proyecto
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Responsable(s)</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            <TableHead>Fecha de cierre</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.company.razon_social}</TableCell>
              <TableCell>{`${project.executive.name} ${project.executive.last_name}`}</TableCell>
              <TableCell>{project.assignee.join(', ')}</TableCell>
              <TableCell>{project.start_date}</TableCell>
              <TableCell>{project.end_date}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/proyectos/${project.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/proyectos/${project.id}/edit`}>
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