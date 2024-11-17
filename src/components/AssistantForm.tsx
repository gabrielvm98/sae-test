import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AssistantFormProps = {
  assistantId?: number
}

type Company = {
  id: number
  razon_social: string
}

export function AssistantForm({ assistantId }: AssistantFormProps) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const router = useRouter()

  const fetchCompanies = useCallback(async () => {
    const { data, error } = await supabase
      .from('company')
      .select('id, razon_social')

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }, [])

  const fetchAssistant = useCallback(async () => {
    if (!assistantId) return
    const { data, error } = await supabase
      .from('assistant')
      .select('*')
      .eq('id', assistantId)
      .single()

    if (error) {
      console.error('Error fetching assistant:', error)
    } else if (data) {
      setDni(data.dni)
      setName(data.name)
      setLastName(data.last_name)
      setEmail(data.email)
      setCompanyId(data.company_id.toString())
    }
  }, [assistantId])

  useEffect(() => {
    fetchCompanies()
    if (assistantId) {
      fetchAssistant()
    }
  }, [assistantId, fetchAssistant, fetchCompanies])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const assistant = {
      dni,
      name,
      last_name: lastName,
      email,
      company_id: parseInt(companyId)
    }

    if (assistantId) {
      const { error } = await supabase
        .from('assistants')
        .update(assistant)
        .eq('id', assistantId)

      if (error) console.error('Error updating assistant:', error)
      else router.push('/secretarias')
    } else {
      const { error } = await supabase
        .from('assistants')
        .insert([assistant])

      if (error) console.error('Error creating assistant:', error)
      else router.push('/secretarias')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="dni">DNI</Label>
        <Input
          id="dni"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="lastName">Apellido</Label>
        <Input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="companyId">Empresa</Label>
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.razon_social}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{assistantId ? 'Actualizar' : 'Crear'} Secretaria</Button>
    </form>
  )
}