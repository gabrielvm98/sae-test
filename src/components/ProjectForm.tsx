import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { assignees } from '@/components/common/Assignees'
import { SearchableSelect } from './SearchableSelect'


type ProjectFormProps = {
  projectId?: number
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

const statusOptions = ["Inicial", "Intermedio", "Avanzado", "Finalizado", "Propuesta enviada"]

export function ProjectForm({ projectId }: ProjectFormProps) {
  const [companyId, setCompanyId] = useState('')
  const [executiveId, setExecutiveId] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [comments, setComments] = useState('')
  const [projectCode, setProjectCode] = useState('') // Updated: New state variable for project_code
  const [otherExecutive, setOtherExecutive] = useState(false) // Updated: New state variable for other executive
  const [otherFullname, setOtherFullname] = useState('') // Updated: New state variable for other executive fullname
  const [otherEmail, setOtherEmail] = useState('') // Updated: New state variable for other executive email
  const [executives, setExecutives] = useState<Executive[]>([])
  const [initialCompany, setInitialCompany] = useState<Company | undefined>(undefined)
  const router = useRouter()

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

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    const { data, error } = await supabase
      .from('project')
      .select('*, company:company_id(id, razon_social)')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
    } else if (data) {
      setInitialCompany(data.company)
      await fetchExecutives(data.company_id)
      setExecutiveId(data.executive_id ? data.executive_id.toString() : '0') // Updated: Handle new executive fields
      setOtherExecutive(data.other_executive)
      setOtherFullname(data.other_fullname || '')
      setOtherEmail(data.other_email || '')
      setSelectedAssignees(data.assignee)
      setStartDate(data.start_date)
      setEndDate(data.end_date)
      setStatus(data.status)
      setComments(data.comments)
      setProjectCode(data.project_code || '') // Updated: Set project_code
    }
  }, [projectId, fetchExecutives])

  useEffect(() => {
    if (companyId && !projectId) {
      fetchExecutives(parseInt(companyId))
    }
  }, [companyId, fetchExecutives, projectId])

  useEffect(() => {
    fetchProject();
  }, [])

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    setExecutiveId('')
    fetchExecutives(parseInt(value))
  }

  const handleExecutiveChange = (value: string) => { // Updated: New function to handle executive changes
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const project = {
      company_id: parseInt(companyId),
      executive_id: executiveId === '0' ? null : parseInt(executiveId), // Updated: Handle new executive fields
      other_executive: otherExecutive,
      other_fullname: otherExecutive ? otherFullname : null,
      other_email: otherExecutive ? otherEmail : null,
      assignee: selectedAssignees,
      start_date: startDate,
      end_date: endDate,
      status,
      comments,
      project_code: projectCode // Updated: Add project_code to the project object
    }

    if (projectId) {
      const { error } = await supabase
        .from('project')
        .update(project)
        .eq('id', projectId)

      if (error) console.error('Error updating project:', error)
      else router.push('/proyectos')
    } else {
      const { error } = await supabase
        .from('project')
        .insert([project])

      if (error) console.error('Error creating project:', error)
      else router.push('/proyectos')
    }
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
        <Label htmlFor="projectCode">Código</Label> {/* Updated: New input field for project_code */}
        <Input
          id="projectCode"
          type="text"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="executiveId">Solicitante</Label>
        <Select value={executiveId} onValueChange={handleExecutiveChange}> {/* Updated: Modified executive dropdown */}
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un solicitante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Otro</SelectItem> {/* Updated: Added "Otro" option */}
            {executives.map((executive) => (
              <SelectItem key={executive.id} value={executive.id.toString()}>
                {`${executive.name} ${executive.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {otherExecutive && ( // Updated: Conditional rendering for other executive fields
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
        <Label>Responsable(s)</Label>
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
        <Label htmlFor="startDate">Fecha de ingreso</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="endDate">Fecha de cierre</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="comments">Comentarios</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit">{projectId ? 'Actualizar' : 'Agregar Nuevo Proyecto'}</Button>
    </form>
  )
}