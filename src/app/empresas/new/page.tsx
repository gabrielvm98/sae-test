'use client'

import { CompanyForm } from '@/components/CompanyForm'

export default function NewCompanyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear nueva empresa</h1>
      <CompanyForm />
    </div>
  )
}