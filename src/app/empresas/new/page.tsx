'use client'

import { CompanyForm } from '@/components/CompanyForm'

export default function NewCompanyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Nueva Empresa</h1>
      <CompanyForm />
    </div>
  )
}