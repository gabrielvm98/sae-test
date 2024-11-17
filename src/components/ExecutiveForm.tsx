import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ExecutiveFormProps = {
  executiveId?: number
}

type Company = {
  id: number
  razon_social: string
}

type Assistant = {
  id: number
  name: string
  last_name: string
  company_id: number
}

export function ExecutiveForm({ executiveId }: ExecutiveFormProps) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
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

  const fetchAssistants = useCallback(async (companyId: number) => {
    const { data, error } = await supabase
      .from('assistant')
      .select('id, name, last_name, company_id')
      .eq('company_id', companyId)

    if (error) {
      console.error('Error fetching assistants:', error)
    } else {
      setAssistants(data || [])
    }
  }, [])

  const fetchExecutive = useCallback(async () => {
    if (!executiveId) return

    const { data, error } = await supabase
      .from('executive')
      .select('*')
      .eq('id', executiveId)
      .single()

    if (error) {
      console.error('Error fetching executive:', error)
    } else if (data) {
      setDni(data.dni)
      setName(data.name)
      setLastName(data.last_name)
      setCompanyId(data.company_id.toString())
      setAssistantId(data.assistant_id.toString())
      await fetchAssistants(data.company_id)
    }
  }, [executiveId, fetchAssistants])

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchCompanies()
      await fetchExecutive()
      setLoading(false)
    }

    loadInitialData()
  }, [fetchCompanies, fetchExecutive])

  useEffect(() => {
    if (companyId) {
      fetchAssistants(parseInt(companyId))
    }
  }, [companyId, fetchAssistants])

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    setAssistantId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const executive = {
      dni,
      name,
      last_name: lastName,
      company_id: parseInt(companyId),
      assistant_id: parseInt(assistantId)
    }

    if (executiveId) {
      const { error } = await supabase
        .from('executive')
        .update(executive)
        .eq('id', executiveId)

      if (error) console.error('Error updating executive:', error)
      else router.push('/usuarios')
    } else {
      const { error } = await supabase
        .from('executive')
        .insert([executive])

      if (error) console.error('Error creating executive:', error)
      else router.push('/usuarios')
    }
  }

  if (loading) {
    return <div>Cargando...</div>
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
        <Label htmlFor="companyId">Empresa</Label>
        <Select value={companyId} onValueChange={handleCompanyChange}>
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
      <div>
        <Label htmlFor="assistantId">Secretaria</Label>
        <Select value={assistantId} onValueChange={setAssistantId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una secretaria" />
          </SelectTrigger>
          <SelectContent>
            {assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id.toString()}>
                {`${assistant.name} ${assistant.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{executiveId ? 'Actualizar' : 'Crear'} Usuario</Button>
    </form>
  )
}