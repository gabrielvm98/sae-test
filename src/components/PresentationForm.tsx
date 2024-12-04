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

type PresentationFormProps = {
  presentationId?: number
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

const orderSources = ["Comercial", "Secretaria de un usuario", "Usuario", "Trabajador SAE"]
const presentationTypes = ["Presentación cortesía", "Presentación adicional con costo", "Presentación de la membresía"]
const modalities = ["Presencial", "Virtual", "Sólo envio"]

export function PresentationForm({ presentationId }: PresentationFormProps) {
  const [companyId, setCompanyId] = useState('')
  const [executiveId, setExecutiveId] = useState('')
  const [elaborationAssignee, setElaborationAssignee] = useState<string[]>([])
  const [presentationAssignee, setPresentationAssignee] = useState<string[]>([])
  const [orderSource, setOrderSource] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [presentationDateHour, setPresentationDateHour] = useState('')
  const [presentationType, setPresentationType] = useState('')
  const [modalidad, setModalidad] = useState('')
  const [comments, setComments] = useState('')
  const [billable, setBillable] = useState(false)
  const [billableCurrency, setBillableCurrency] = useState('')
  const [billableAmount, setBillableAmount] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [executives, setExecutives] = useState<Executive[]>([])
  const [otherExecutive, setOtherExecutive] = useState(false)
  const [otherFullname, setOtherFullname] = useState('')
  const [otherEmail, setOtherEmail] = useState('')
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

  const fetchPresentation = useCallback(async () => {
    if (!presentationId) return
    const { data, error } = await supabase
      .from('presentation')
      .select('*')
      .eq('id', presentationId)
      .single()

    if (error) {
      console.error('Error fetching presentation:', error)
    } else if (data) {
      setCompanyId(data.company_id.toString())
      await fetchExecutives(data.company_id)
      setExecutiveId(data.executive_id ? data.executive_id.toString() : '0')
      setElaborationAssignee(data.elaboration_assignee)
      setPresentationAssignee(data.presentation_assignee)
      setOrderSource(data.order_source)
      setOrderDate(data.order_date)
      setPresentationDateHour(data.presentation_date_hour)
      setPresentationType(data.presentation_type)
      setModalidad(data.modalidad)
      setComments(data.comments)
      setBillable(data.billable)
      setBillableCurrency(data.billable_currency || '')
      setBillableAmount(data.billable_amount ? data.billable_amount.toString() : '')
      setOtherExecutive(data.other_executive)
      setOtherFullname(data.other_fullname || '')
      setOtherEmail(data.other_email || '')
    }
  }, [presentationId, fetchExecutives])

  useEffect(() => {
    fetchCompanies()
    if (presentationId) {
      fetchPresentation()
    }
  }, [presentationId, fetchCompanies, fetchPresentation])

  useEffect(() => {
    if (companyId && !presentationId) {
      fetchExecutives(parseInt(companyId))
    }
  }, [companyId, fetchExecutives, presentationId])

  const handleElaborationAssigneeChange = (name: string) => {
    setElaborationAssignee(prev =>
      prev.includes(name)
        ? prev.filter(a => a !== name)
        : [...prev, name]
    )
  }

  const handlePresentationAssigneeChange = (name: string) => {
    setPresentationAssignee(prev =>
      prev.includes(name)
        ? prev.filter(a => a !== name)
        : [...prev, name]
    )
  }

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    setExecutiveId('')
    setOtherExecutive(false)
    setOtherFullname('')
    setOtherEmail('')
    fetchExecutives(parseInt(value))
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const presentation = {
      company_id: parseInt(companyId),
      executive_id: executiveId === '0' ? null : parseInt(executiveId),
      elaboration_assignee: elaborationAssignee,
      presentation_assignee: presentationAssignee,
      order_source: orderSource,
      order_date: orderDate,
      presentation_date_hour: presentationDateHour,
      presentation_type: presentationType,
      modalidad: modalidad,
      comments: comments,
      billable,
      billable_currency: billable ? billableCurrency : null,
      billable_amount: billable ? parseFloat(billableAmount) : null,
      other_executive: otherExecutive,
      other_fullname: otherExecutive ? otherFullname : null,
      other_email: otherExecutive ? otherEmail : null,
    }

    if (presentationId) {
      const { error } = await supabase
        .from('presentation')
        .update(presentation)
        .eq('id', presentationId)

      if (error) console.error('Error updating presentation:', error)
      else router.push('/presentaciones')
    } else {
      const { error } = await supabase
        .from('presentation')
        .insert([presentation])

      if (error) console.error('Error creating presentation:', error)
      else router.push('/presentaciones')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label>Responsable(s) de la elaboración</Label>
        <div className="grid grid-cols-2 gap-2">
          {assignees.map((name) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={`elaboration-${name}`}
                checked={elaborationAssignee.includes(name)}
                onCheckedChange={() => handleElaborationAssigneeChange(name)}
              />
              <Label htmlFor={`elaboration-${name}`}>{name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Expositor(es)</Label>
        <div className="grid grid-cols-2 gap-2">
          {assignees.map((name) => (
            <div key={name} className="flex items-center space-x-2">
              <Checkbox
                id={`presentation-${name}`}
                checked={presentationAssignee.includes(name)}
                onCheckedChange={() => handlePresentationAssigneeChange(name)}
              />
              <Label htmlFor={`presentation-${name}`}>{name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="orderSource">Origen de solicitud</Label>
        <Select value={orderSource} onValueChange={setOrderSource}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el origen de solicitud" />
          </SelectTrigger>
          <SelectContent>
            {orderSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="orderDate">Fecha de ingreso</Label>
        <Input
          id="orderDate"
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="presentationDateHour">Fecha y hora de presentación</Label>
        <Input
          id="presentationDateHour"
          type="datetime-local"
          value={presentationDateHour}
          onChange={(e) => setPresentationDateHour(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="presentationType">Tipo de presentación</Label>
        <Select value={presentationType} onValueChange={setPresentationType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de presentación" />
          </SelectTrigger>
          <SelectContent>
            {presentationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="modalidad">Modalidad</Label>
        <Select value={modalidad} onValueChange={setModalidad}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la modalidad" />
          </SelectTrigger>
          <SelectContent>
            {modalities.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="billable"
            checked={billable}
            onCheckedChange={(checked) => setBillable(checked as boolean)}
          />
          <Label htmlFor="billable">Facturable</Label>
        </div>
      </div>
      {billable && (
        <>
          <div>
            <Label htmlFor="billableCurrency">Moneda</Label>
            <Select value={billableCurrency} onValueChange={setBillableCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="PEN">PEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="billableAmount">Monto</Label>
            <Input
              id="billableAmount"
              type="number"
              value={billableAmount}
              onChange={(e) => setBillableAmount(e.target.value)}
            />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="comments">Comentarios</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit">{presentationId ? 'Actualizar' : 'Crear'}</Button>
    </form>
  )
}