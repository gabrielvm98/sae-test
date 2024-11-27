import { QueryForm } from '@/components/QueryForm'

export default function NewQueryPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Nueva consulta</h1>
      <QueryForm />
    </div>
  )
}