'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type Company = {
  id: number
  razon_social: string
}

type Executive = {
  id: number
  name: string
  last_name: string
  email: string
  company_id: number
}

type CreateGuestFormProps = {
  eventId: number
  onComplete: () => void
}

export function CreateGuestForm({ eventId, onComplete }: CreateGuestFormProps) {
  const [isClientCompany, setIsClientCompany] = useState(false)
  const [isUser, setIsUser] = useState(false)
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [companyRazonSocial, setCompanyRazonSocial] = useState('')
  const [executiveId, setExecutiveId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [assistantName, setAssistantName] = useState('')
  const [assistantEmail, setAssistantEmail] = useState('')
  const [substitute, setSubstitute] = useState(false)
  const [substituteName, setSubstituteName] = useState('')
  const [substituteEmail, setSubstituteEmail] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [executives, setExecutives] = useState<Executive[]>([])

  useEffect(() => {
    fetchCompanies()
    fetchExecutives()
  }, [])

  async function fetchCompanies() {
    const { data, error } = await supabase
      .from('company')
      .select('id, razon_social')
    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  async function fetchExecutives() {
    const { data, error } = await supabase
      .from('executive')
      .select('id, name, last_name, email, company_id')
    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }

  const filteredExecutives = executives.filter(executive => executive.company_id === companyId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const guest = {
      event_id: eventId,
      is_client_company: isClientCompany,
      is_user: isUser,
      company_id: isClientCompany ? companyId : null,
      company_razon_social: isClientCompany ? null : companyRazonSocial,
      executive_id: isUser ? executiveId : null,
      name,
      dni,
      email,
      phone,
      assistant_name: !isUser ? assistantName : null,
      assistant_email: !isUser ? assistantEmail : null,
      substitute,
      substitute_name: substitute ? substituteName : null,
      substitute_email: substitute ? substituteEmail : null,
    }

    const { error } = await supabase
      .from('event_guest')
      .insert([guest])
    if (error) console.error('Error creating guest:', error)
    else onComplete()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>
          <Checkbox 
            checked={isClientCompany} 
            onCheckedChange={(checked) => {
              setIsClientCompany(checked as boolean)
              if (!checked) setIsUser(false)
            }} 
          />
          {' '}Empresa Interna
        </Label>
      </div>
      {isClientCompany ? (
        <div>
          <Label htmlFor="companyId">Empresa</Label>
          <Select 
            value={companyId?.toString()} 
            onValueChange={(value) => {
              setCompanyId(parseInt(value))
              setExecutiveId(null) // Reset executive when company changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la empresa" />
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
      ) : (
        <div>
          <Label htmlFor="companyRazonSocial">Razón Social de la Empresa</Label>
          <Input
            id="companyRazonSocial"
            value={companyRazonSocial}
            onChange={(e) => setCompanyRazonSocial(e.target.value)}
            required
          />
        </div>
      )}
      <div>
        <Label>
          <Checkbox 
            checked={isUser} 
            onCheckedChange={(checked) => setIsUser(checked as boolean)}
            disabled={!isClientCompany}
          />
          {' '}Usuario Interno
        </Label>
      </div>
      {isUser && companyId && (
        <>
          <div>
            <Label htmlFor="executiveId">Ejecutivo</Label>
            <Select
              value={executiveId?.toString()}
              onValueChange={(value) => {
                setExecutiveId(parseInt(value))
                const selectedExecutive = filteredExecutives.find((executive) => executive.id === parseInt(value))
                if (selectedExecutive) {
                  setEmail(selectedExecutive.email)
                }
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el ejecutivo" />
              </SelectTrigger>
              <SelectContent>
                {filteredExecutives.map((executive) => (
                  <SelectItem key={executive.id} value={executive.id.toString()}>
                    {`${executive.name} ${executive.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email del evento</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </>
      )}
      {!isUser && (
        <>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
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
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="assistantName">Nombre del Asistente</Label>
            <Input
              id="assistantName"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="assistantEmail">Email del Asistente</Label>
            <Input
              id="assistantEmail"
              type="email"
              value={assistantEmail}
              onChange={(e) => setAssistantEmail(e.target.value)}
            />
          </div>
        </>
      )}
      <div>
        <Label>
          <Checkbox 
            checked={substitute} 
            onCheckedChange={(checked) => setSubstitute(checked as boolean)} 
          />
          {' '}Sustituto
        </Label>
      </div>
      {substitute && (
        <>
          <div>
            <Label htmlFor="substituteName">Nombre del Sustituto</Label>
            <Input
              id="substituteName"
              value={substituteName}
              onChange={(e) => setSubstituteName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="substituteEmail">Email del Sustituto</Label>
            <Input
              id="substituteEmail"
              type="email"
              value={substituteEmail}
              onChange={(e) => setSubstituteEmail(e.target.value)}
              required
            />
          </div>
        </>
      )}
      <Button type="submit">Añadir Invitado</Button>
    </form>
  )
}

