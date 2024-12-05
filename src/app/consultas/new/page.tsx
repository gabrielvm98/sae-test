import { QueryForm } from '@/components/QueryForm'

export default function NewQueryPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Agregar Nueva Consulta</h1>
      <QueryForm />
    </div>
  )
}