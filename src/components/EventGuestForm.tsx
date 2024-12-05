'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type EventGuestFormProps = {
  eventId: number
  guestId?: number
  onComplete: () => void
}

export function EventGuestForm({ eventId, guestId, onComplete }: EventGuestFormProps) {
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
  const [companies, setCompanies] = useState<{ id: number, razon_social: string }[]>([])
  const [executives, setExecutives] = useState<{ id: number, name: string, email: string }[]>([])
  const [virtualSessionTime, setVirtualSessionTime] = useState<number | null>(null)
  const [registered, setRegistered] = useState(false)
  const [assisted, setAssisted] = useState(false)

  useEffect(() => {
    fetchCompanies()
    fetchExecutives()
    if (guestId) {
      fetchGuest()
    }
  }, [guestId])

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
      .select('id, name, email')
    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }

  async function fetchGuest() {
    if (!guestId) return
    const { data, error } = await supabase
      .from('event_guest')
      .select('*')
      .eq('id', guestId)
      .single()
    if (error) {
      console.error('Error fetching guest:', error)
    } else if (data) {
      setIsClientCompany(data.is_client_company)
      setIsUser(data.is_user)
      setCompanyId(data.company_id)
      setCompanyRazonSocial(data.company_razon_social || '')
      setExecutiveId(data.executive_id)
      setName(data.name)
      setDni(data.dni)
      setEmail(data.email)
      setPhone(data.phone)
      setAssistantName(data.assistant_name || '')
      setAssistantEmail(data.assistant_email || '')
      setSubstitute(data.substitute)
      setSubstituteName(data.substitute_name || '')
      setSubstituteEmail(data.substitute_email || '')
      setVirtualSessionTime(data.virtual_session_time)
      setRegistered(data.registered)
      setAssisted(data.assisted)
    }
  }

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
      virtual_session_time: virtualSessionTime,
      registered,
      assisted,
    }

    if (guestId) {
      const { error } = await supabase
        .from('event_guest')
        .update(guest)
        .eq('id', guestId)
      if (error) console.error('Error updating guest:', error)
      else onComplete()
    } else {
      const { error } = await supabase
        .from('event_guest')
        .insert([guest])
      if (error) console.error('Error creating guest:', error)
      else onComplete()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!guestId && 
      <>
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
          <Select value={companyId?.toString()} onValueChange={(value) => setCompanyId(parseInt(value))}>
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
      {isUser ? (
        <>
        <div>
          <Label htmlFor="executiveId">Ejecutivo</Label>
          <Select
            value={executiveId?.toString()}
            onValueChange={(value) => {
              setExecutiveId(parseInt(value))
              const selectedExecutive = executives.find((executive) => executive.id === parseInt(value))
              if (selectedExecutive) {
                setEmail(selectedExecutive.email)
              }
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el ejecutivo" />
            </SelectTrigger>
            <SelectContent>
              {executives.map((executive) => (
                <SelectItem key={executive.id} value={executive.id.toString()}>
                  {executive.name}
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
      ) : (
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
      </>
      }
      {guestId && (
        <>
          <div>
            <Label htmlFor="virtualSessionTime">Tiempo en sesión virtual (minutos)</Label>
            <Input
              id="virtualSessionTime"
              type="number"
              value={virtualSessionTime?.toString() || ''}
              onChange={(e) => setVirtualSessionTime(parseInt(e.target.value) || null)}
            />
          </div>
          <div>
            <Label>
              <Checkbox 
                checked={registered} 
                onCheckedChange={(checked) => setRegistered(checked as boolean)}
              />
              {' '}Registrado
            </Label>
          </div>
          <div>
            <Label>
              <Checkbox 
                checked={assisted} 
                onCheckedChange={(checked) => setAssisted(checked as boolean)}
              />
              {' '}Asistió
            </Label>
          </div>
        </>
      )}
      <Button type="submit">{guestId ? 'Actualizar' : 'Añadir'}</Button>
    </form>
  )
}