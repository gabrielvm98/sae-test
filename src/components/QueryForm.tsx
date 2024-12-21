'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { assignees } from "@/components/common/Assignees"
import { SearchableSelect } from './SearchableSelect'

type QueryFormProps = {
  queryId?: number
}

type Company = {
  id: number
  razon_social: string
}

type Executive = {
  id: number
  name: string
  last_name: string
  company_id: number
}

export function QueryForm({ queryId }: QueryFormProps) {
  const [companyId, setCompanyId] = useState('')
  const [executiveId, setExecutiveId] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [solvedDate, setSolvedDate] = useState('')
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)
  const [otherExecutive, setOtherExecutive] = useState(false)
  const [otherFullname, setOtherFullname] = useState('')
  const [otherEmail, setOtherEmail] = useState('')
  const router = useRouter()
  const [initialCompany, setInitialCompany] = useState<Company | undefined>(undefined)

  const fetchExecutives = useCallback(async (companyId: number) => {
    const { data, error } = await supabase
      .from('executive')
      .select('id, name, last_name, company_id')
      .eq('company_id', companyId)

    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }, [])

  const fetchQuery = useCallback(async () => {
    if (!queryId) return

    const { data, error } = await supabase
      .from('query')
      .select('*, company:company_id(id, razon_social)')
      .eq('id', queryId)
      .single()

    if (error) {
      console.error('Error fetching query:', error)
    } else if (data) {
      setCompanyId(data.company_id.toString())
      setInitialCompany(data.company)
      setExecutiveId(data.executive_id ? data.executive_id.toString() : '0')
      setSelectedAssignees(data.assignee)
      setDescription(data.description)
      setSolvedDate(data.solved_date)
      setOtherExecutive(data.other_executive)
      setOtherFullname(data.other_fullname || '')
      setOtherEmail(data.other_email || '')
      await fetchExecutives(data.company_id)
    }
  }, [queryId, fetchExecutives])

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await fetchQuery()
      setLoading(false)
    }

    loadInitialData()
  }, [fetchQuery])

  useEffect(() => {
    if (companyId) {
      fetchExecutives(parseInt(companyId))
    }
  }, [companyId, fetchExecutives])

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    setExecutiveId('')
    setOtherExecutive(false)
    setOtherFullname('')
    setOtherEmail('')
  }

  const handleExecutiveChange = (value: string) => {
    setExecutiveId(value)
    if (value === '0') {
      setOtherExecutive(true)
    } else {
      setOtherExecutive(false)
      setOtherFullname('')
      setOtherEmail('')
    }
  }

  const handleAssigneeChange = (assignee: string) => {
    setSelectedAssignees(prev => 
      prev.includes(assignee)
        ? prev.filter(a => a !== assignee)
        : [...prev, assignee]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = {
      company_id: parseInt(companyId),
      executive_id: executiveId === '0' ? null : parseInt(executiveId),
      assignee: selectedAssignees,
      description,
      solved_date: solvedDate ? solvedDate : null,
      other_executive: otherExecutive,
      other_fullname: otherExecutive ? otherFullname : null,
      other_email: otherExecutive ? otherEmail : null
    }

    if (queryId) {
      const { error } = await supabase
        .from('query')
        .update(query)
        .eq('id', queryId)

      if (error) console.error('Error updating query:', error)
      else router.push('/consultas')
    } else {
      const { error } = await supabase
        .from('query')
        .insert([query])

      if (error) console.error('Error creating query:', error)
      else router.push('/consultas')
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="companyId">Empresa</Label>
        <SearchableSelect
          onSelect={handleCompanyChange}
          placeholder="Selecciona una empresa"
          label="empresa"
          initialValue={initialCompany}
        />
      </div>
      <div>
        <Label htmlFor="executiveId">Solicitante</Label>
        <Select value={executiveId} onValueChange={handleExecutiveChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un solicitante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Otro</SelectItem>
            {executives.map((executive) => (
              <SelectItem key={executive.id} value={executive.id.toString()}>
                {`${executive.name} ${executive.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {otherExecutive && (
        <>
          <div>
            <Label htmlFor="otherFullname">Nombre completo</Label>
            <Input
              id="otherFullname"
              value={otherFullname}
              onChange={(e) => setOtherFullname(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="otherEmail">Correo</Label>
            <Input
              id="otherEmail"
              type="email"
              value={otherEmail}
              onChange={(e) => setOtherEmail(e.target.value)}
              required
            />
          </div>
        </>
      )}
      <div>
        <Label>Encargado</Label>
        <div className="grid grid-cols-2 gap-2">
          {assignees.map((assignee) => (
            <div key={assignee} className="flex items-center space-x-2">
              <Checkbox
                id={assignee}
                checked={selectedAssignees.includes(assignee)}
                onCheckedChange={() => handleAssigneeChange(assignee)}
              />
              <Label htmlFor={assignee}>{assignee}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="solvedDate">Fecha de resolución</Label>
        <Input
          id="solvedDate"
          type="date"
          value={solvedDate}
          onChange={(e) => setSolvedDate(e.target.value)}
        />
      </div>
      <Button type="submit">{queryId ? 'Actualizar' : 'Agregar Nueva Consulta'}</Button>
    </form>
  )
}