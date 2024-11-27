'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  console.log(eventId)


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
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo de usuario</TableHead>
            <TableHead>Empresa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExecutives.map(executive => (
            <TableRow key={executive.id}>
              <TableCell>{executive.name}</TableCell>
              <TableCell>{executive.user_type}</TableCell>
              <TableCell>
                {companies.find(company => company.id === executive.company_id)?.razon_social || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button>Importar Seleccionados</Button>
    </div>
  )
}