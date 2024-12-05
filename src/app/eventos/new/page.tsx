import { EventForm } from '@/components/EventForm'

export default function NewEventPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-5">Agregar Nuevo Evento</h1>
      <EventForm />
    </div>
  )
}