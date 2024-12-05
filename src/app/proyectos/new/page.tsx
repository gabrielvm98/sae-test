'use client'

import { ProjectForm } from '@/components/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Agregar Nuevo Proyecto</h1>
      <ProjectForm />
    </div>
  )
}