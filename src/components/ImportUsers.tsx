'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { SearchableSelectFilter } from './SearchableSelectFilter'

type Membership = {
  id: number
  name: string
  company_id: number
  membership_type: string
  forum_consumer_first_semester: boolean
  forum_consumer_second_semester: boolean
  forum_sectorial_first_semester: boolean
  forum_sectorial_second_semester: boolean
}

type Executive = {
  id: number
  name: string
  email: string
  last_name: string
  user_type: string
  company_id: number
  membership_id: number
  active: boolean
  sae_meetings: string[]
  membership: Membership
}

type Company = {
  id: number
  razon_social: string
  status: string
}

const forumTypes = [
  "Primero Comercial",
  "Segundo Comercial",
  "Primero Sectorial",
  "Segundo Sectorial"
]

const membershipTypes = [
  "SAE Ejecutivo",
  "SAE Reuniones",
  "SAE Virtual",
  "SAE Virtual Nuevo",
  "SAE Virtual Power",
  "SAE Básico",
  "SAE Básico Nuevo",
  "SAE Básico reuniones",
  "SAE Completo",
  "SAE Especial",
  "AC",
]

const userTypes = [
  "Titular",
  "Cupo de cortesía",
  "Cortesía de reportes",
  "Titular adicional",
  "Titular virtual",
  "Cliente potencial",
  "Titular Axpen",
  "Titular Vitalicio",
  "Titular indefinido",
  "Invitado por transición laboral",
  "Cliente beca",
  "Reemplazo",
  "AC",
  "Otros",
]

const saeMeetingsOptions = [
  "Encuentro mensual presencial",
  "Encuentro mensual virtual",
  "Convención anual",
  "SAE Especiales",
  "Reuniones especiales con autoridades"
]

const statusOptions = ['Cliente SAE', 'Ex-cliente SAE', 'No cliente SAE']

export function ImportUsers({ eventId }: { eventId: number }) {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedUserType, setSelectedUserType] = useState<string>('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all')
  const [selectedActive, setSelectedActive] = useState<string>('all')
  const [selectedSaeMeeting, setSelectedSaeMeeting] = useState<string>('all')
  const [selectedCompanyStatus, setSelectedCompanyStatus] = useState<string>('all')
  const [selectedExecutives, setSelectedExecutives] = useState<number[]>([])
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>('all')
  const [selectedForumType, setSelectedForumType] = useState<string>('all')
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


  useEffect(() => {
    fetchExecutives()
    fetchCompanies()
  }, [])

  async function fetchExecutives() {
    let query = supabase
      .from('executive')
      .select(`
        *,
        company:company_id (razon_social),
        assistant:assistant_id (name, last_name),
        membership:membership_id (name, company_id, membership_type, forum_consumer_first_semester, forum_consumer_second_semester, forum_sectorial_first_semester, forum_sectorial_second_semester)
      `)

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

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
    const userTypeMatch =
      selectedUserType === 'all' || (executive.user_type && executive.user_type === selectedUserType);
  
    const companyMatch =
      selectedCompanyId === 'all' || (executive.company_id && executive.company_id.toString() === selectedCompanyId);
  
    const activeMatch =
      selectedActive === 'all' || (executive.active !== null && executive.active.toString() === selectedActive);
  
    const saeMeetingMatch =
      selectedSaeMeeting === 'all' || 
      (executive.sae_meetings && Array.isArray(executive.sae_meetings) && executive.sae_meetings.includes(selectedSaeMeeting));
  
    const companyStatusMatch =
      selectedCompanyStatus === 'all' ||
      (companies.find(company => company.id === executive.company_id)?.status === selectedCompanyStatus);
  
    const searchMatch =
      executive.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      executive.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const membershipTypeMatch = selectedMembershipType === 'all' || executive.membership?.membership_type === selectedMembershipType;

    const forumTypeMatch = selectedForumType === 'all' || 
      (selectedForumType === "Primero Comercial" && executive.membership?.forum_consumer_first_semester) ||
      (selectedForumType === "Segundo Comercial" && executive.membership?.forum_consumer_second_semester) ||
      (selectedForumType === "Primero Sectorial" && executive.membership?.forum_sectorial_first_semester) ||
      (selectedForumType === "Segundo Sectorial" && executive.membership?.forum_sectorial_second_semester);
    
  
    return userTypeMatch && companyMatch && activeMatch && saeMeetingMatch && companyStatusMatch && searchMatch && membershipTypeMatch && forumTypeMatch;
  });
  

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
        email: executive?.email.toLowerCase().trim(),
        is_client_company: true,
        is_user: true,
        name: ""
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

  const getForumSemestrales = (executive: Executive) => {
    const forums = [];
    if (executive.membership?.forum_consumer_first_semester) forums.push("Primero Comercial");
    if (executive.membership?.forum_consumer_second_semester) forums.push("Segundo Comercial");
    if (executive.membership?.forum_sectorial_first_semester) forums.push("Primero Sectorial");
    if (executive.membership?.forum_sectorial_second_semester) forums.push("Segundo Sectorial");
    return forums.join(", ") || "N/A";
  };


  return (
    <div className="space-y-8">
      <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="text-md font-medium">Empresa</h4>
          <SearchableSelectFilter
            onSelect={(value) => setSelectedCompanyId(value)}
            label="empresa"
          />
        </div>
        <div>
          <h4 className="text-md font-medium">Tipo de Usuario</h4>
          <Select value={selectedUserType} onValueChange={setSelectedUserType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {userTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-md font-medium">Estado Activo</h4>
          <Select value={selectedActive} onValueChange={setSelectedActive}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">No Activo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-md font-medium">Reuniones SAE</h4>
          <Select value={selectedSaeMeeting} onValueChange={setSelectedSaeMeeting}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una reunión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {saeMeetingsOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-md font-medium">Estado de Empresa</h4>
          <Select value={selectedCompanyStatus} onValueChange={setSelectedCompanyStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-md font-medium">Tipo de Membresía</h4>
          <Select value={selectedMembershipType} onValueChange={setSelectedMembershipType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {membershipTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-md font-medium">Foros Semestrales</h4>
          <Select value={selectedForumType} onValueChange={setSelectedForumType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un foro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {forumTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
  
      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo de Usuario</TableHead>
            <TableHead>Estado de usuario</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado de Empresa</TableHead>
            <TableHead>Reuniones SAE</TableHead>
            <TableHead>Tipo de Membresía</TableHead>
            <TableHead>Foros Semestrales</TableHead>
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
              <TableCell>{executive.active ? 'Activo' : 'No Activo'}</TableCell>
              <TableCell>
                {companies.find(company => company.id === executive.company_id)?.razon_social || 'N/A'}
              </TableCell>
              <TableCell>
                {companies.find(company => company.id === executive.company_id)?.status || 'N/A'}
              </TableCell>
              <TableCell>
                {executive.sae_meetings?.join(', ') || 'N/A'}
              </TableCell>
              <TableCell>
                {executive.membership?.membership_type || 'N/A'}
              </TableCell>
              <TableCell>
                {getForumSemestrales(executive)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  
      {/* Botón de acción */}
      <Button onClick={handleImportSelected} className="mt-4">
        Importar Seleccionados
      </Button>
    </div>
  )
  
}
