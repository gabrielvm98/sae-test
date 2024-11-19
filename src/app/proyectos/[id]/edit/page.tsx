'use client'

import { ProjectForm } from '@/components/ProjectForm'
import { useParams } from 'next/navigation'

export default function EditProjectPage() {
  const params = useParams()
  const projectId = typeof params.id === 'string' ? parseInt(params.id) : undefined

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Editar Proyecto</h1>
      <ProjectForm projectId={projectId} />
    </div>
  )
}