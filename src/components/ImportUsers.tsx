'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

type Executive = {
  id: number
  name: string
  user_type: string
  company_id: number
}

type Company = {
  id: number
  razon_social: string
}

export function ImportUsers({ eventId }: { eventId: number }) {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedUserType, setSelectedUserType] = useState<string>('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [selectedExecutives, setSelectedExecutives] = useState<number[]>([])

  useEffect(() => {
    fetchExecutives()
    fetchCompanies()
  }, [])

  async function fetchExecutives() {
    const { data, error } = await supabase
      .from('executive')
      .select('*')

    if (error) {
      console.error('Error fetching executives:', error)
    } else {
      setExecutives(data || [])
    }
  }

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

  const filteredExecutives = executives.filter(executive => {
    const userTypeMatch = selectedUserType === 'all' || executive.user_type === selectedUserType
    const companyMatch = selectedCompanyId === 'all' || executive.company_id.toString() === selectedCompanyId
    return userTypeMatch && companyMatch
  })

  const handleExecutiveSelect = (executiveId: number) => {
    setSelectedExecutives(prev => 
      prev.includes(executiveId)
        ? prev.filter(id => id !== executiveId)
        : [...prev, executiveId]
    )
  }

  async function createEventGuestsBatch(eventId: number, executiveIds: number[]) {
    const eventGuests = executiveIds.map((executiveId) => {
      const executive = executives.find(e => e.id === executiveId)
      return {
        event_id: eventId,
        executive_id: executiveId,
        company_id: executive?.company_id,
        is_client_company: true,
        is_user: true
      }
    })

    const { error } = await supabase
      .from('event_guest')
      .upsert(eventGuests)

    if (error) {
      console.error('Error creating/updating event_guests:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al importar los usuarios seleccionados.",
        variant: "destructive",
      })
    } else {
      console.log('Event guests created/updated successfully!')
      toast({
        title: "Éxito",
        description: "Los usuarios seleccionados han sido importados correctamente.",
      })
      setSelectedExecutives([])
    }
  }

  const handleImportSelected = () => {
    if (selectedExecutives.length === 0) {
      toast({
        title: "Advertencia",
        description: "Por favor, seleccione al menos un usuario para importar.",
        variant: "warning",
      })
      return
    }
    createEventGuestsBatch(eventId, selectedExecutives)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Select value={selectedUserType} onValueChange={setSelectedUserType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="internal">Encuentro Mensual</SelectItem>
            <SelectItem value="external">Foro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.razon_social}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Seleccionar</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo de usuario</TableHead>
            <TableHead>Empresa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExecutives.map(executive => (
            <TableRow key={executive.id}>
              <TableCell>
                <Checkbox
                  checked={selectedExecutives.includes(executive.id)}
                  onCheckedChange={() => handleExecutiveSelect(executive.id)}
                />
              </TableCell>
              <TableCell>{executive.name}</TableCell>
              <TableCell>{executive.user_type}</TableCell>
              <TableCell>
                {companies.find(company => company.id === executive.company_id)?.razon_social || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleImportSelected}>Importar Seleccionados</Button>
    </div>
  )
}