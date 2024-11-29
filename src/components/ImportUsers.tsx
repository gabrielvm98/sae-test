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
  last_name: string
  user_type: string
  company_id: number
  active: boolean
  sae_meetings: string[]
}

type Company = {
  id: number
  razon_social: string
  status: string
}

export function ImportUsers({ eventId }: { eventId: number }) {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<string>('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [selectedActive, setSelectedActive] = useState<string>('all')
  const [selectedSaeMeeting, setSelectedSaeMeeting] = useState<string>('all')
  const [selectedCompanyStatus, setSelectedCompanyStatus] = useState<string>('all')
  const [selectedExecutives, setSelectedExecutives] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

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
      .select('id, razon_social, status')

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  const filteredExecutives = executives.filter(executive => {
    const userTypeMatch = selectedUserType === 'all' || executive.user_type === selectedUserType
    const companyMatch = selectedCompanyId === 'all' || executive.company_id.toString() === selectedCompanyId
    const activeMatch = selectedActive === 'all' || executive.active.toString() === selectedActive
    const saeMeetingMatch = selectedSaeMeeting === 'all' || executive.sae_meetings.includes(selectedSaeMeeting)
    const searchMatch =
      executive.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executive.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    return userTypeMatch && companyMatch && activeMatch && saeMeetingMatch && searchMatch
  })

  const filteredCompanies = companies.filter(company => {
    return selectedCompanyStatus === 'all' || company.status === selectedCompanyStatus
  })

  const handleExecutiveSelect = (executiveId: number) => {
    setSelectedExecutives(prev => 
      prev.includes(executiveId)
        ? prev.filter(id => id !== executiveId)
        : [...prev, executiveId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedExecutives([])
    } else {
      setSelectedExecutives(filteredExecutives.map(executive => executive.id))
    }
    setSelectAll(!selectAll)
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
        variant: "default",
      })
      return
    }
    createEventGuestsBatch(eventId, selectedExecutives)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap space-x-4">
        <Select value={selectedUserType} onValueChange={setSelectedUserType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="internal">Interno</SelectItem>
            <SelectItem value="external">Externo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filteredCompanies.map(company => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.razon_social}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedActive} onValueChange={setSelectedActive}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado Activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">No Activo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSaeMeeting} onValueChange={setSelectedSaeMeeting}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Reuniones SAE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Meeting1">Reunión 1</SelectItem>
            <SelectItem value="Meeting2">Reunión 2</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCompanyStatus} onValueChange={setSelectedCompanyStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado de Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
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
              <TableCell>{executive.name} {executive.last_name}</TableCell>
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
