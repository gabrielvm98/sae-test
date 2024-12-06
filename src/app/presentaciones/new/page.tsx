'use client'

import { PresentationForm } from '@/components/PresentationForm'

export default function NewPresentationPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Agregar Nueva Presentación</h1>
      <PresentationForm />
    </div>
  )
}