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
  const [ccOfficePhone, setCcOfficePhone] = useState('')
  const [officePhone, setOfficePhone] = useState('')
  const [officePhoneExtension, setOfficePhoneExtension] = useState('')
  const [ccMobilePhone, setCcMobilePhone] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
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
      setCcOfficePhone(data.cc_office_phone)
      setOfficePhone(data.office_phone)
      setOfficePhoneExtension(data.office_phone_extension)
      setCcMobilePhone(data.cc_mobile_phone)
      setMobilePhone(data.mobile_phone)
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
      company_id: parseInt(companyId),
      cc_office_phone: ccOfficePhone,
      office_phone: officePhone,
      office_phone_extension: officePhoneExtension,
      cc_mobile_phone: ccMobilePhone,
      mobile_phone: mobilePhone
    }

    if (assistantId) {
      const { error } = await supabase
        .from('assistant')
        .update(assistant)
        .eq('id', assistantId)

      if (error) console.error('Error updating assistant:', error)
      else router.push('/secretarias')
    } else {
      const { error } = await supabase
        .from('assistant')
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
      <div>
        <Label htmlFor="officePhone">Teléfono de oficina</Label>
        <div className="flex space-x-2">
          <Input
            id="ccOfficePhone"
            type="text"
            value={ccOfficePhone}
            onChange={(e) => setCcOfficePhone(e.target.value)}
            placeholder="Código"
            className="w-20"
          />
          <Input
            id="officePhone"
            type="tel"
            value={officePhone}
            onChange={(e) => setOfficePhone(e.target.value)}
            placeholder="Número"
          />
          <Input
            id="officePhoneExtension"
            type="text"
            value={officePhoneExtension}
            onChange={(e) => setOfficePhoneExtension(e.target.value)}
            placeholder="Anexo"
            className="w-20"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="mobilePhone">Celular</Label>
        <div className="flex space-x-2">
          <Input
            id="ccMobilePhone"
            type="text"
            value={ccMobilePhone}
            onChange={(e) => setCcMobilePhone(e.target.value)}
            placeholder="Código"
            className="w-20"
          />
          <Input
            id="mobilePhone"
            type="tel"
            value={mobilePhone}
            onChange={(e) => setMobilePhone(e.target.value)}
            placeholder="Número"
          />
        </div>
      </div>
      <Button type="submit">{assistantId ? 'Actualizar' : 'Crear'} Secretaria</Button>
    </form>
  )
}