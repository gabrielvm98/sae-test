import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CompanyFormProps = {
  companyId?: number
}

export function CompanyForm({ companyId }: CompanyFormProps) {
  const [ruc, setRuc] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [nombreComercial, setNombreComercial] = useState('')
  const [seats, setSeats] = useState('1')
  const router = useRouter()

  const fetchCompany = useCallback(async () => {
    if (!companyId) return
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
    } else if (data) {
      setRuc(data.ruc)
      setRazonSocial(data.razon_social)
      setNombreComercial(data.nombre_comercial)
      setSeats(data.seats.toString())
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchCompany()
    }
  }, [companyId, fetchCompany])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const company = {
      ruc,
      razon_social: razonSocial,
      nombre_comercial: nombreComercial,
      seats: parseInt(seats)
    }

    if (companyId) {
      const { error } = await supabase
        .from('company')
        .update(company)
        .eq('id', companyId)

      if (error) console.error('Error updating company:', error)
      else router.push('/empresas')
    } else {
      const { error } = await supabase
        .from('company')
        .insert([company])

      if (error) console.error('Error creating company:', error)
      else router.push('/empresas')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ruc">RUC</Label>
        <Input
          id="ruc"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={ruc}
          onChange={(e) => setRuc(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="razonSocial">Razón Social</Label>
        <Input
          id="razonSocial"
          type="text"
          value={razonSocial}
          onChange={(e) => setRazonSocial(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="nombreComercial">Nombre Comercial</Label>
        <Input
          id="nombreComercial"
          type="text"
          value={nombreComercial}
          onChange={(e) => setNombreComercial(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="seats">Número de Asientos</Label>
        <Select value={seats} onValueChange={setSeats}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el número de asientos" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(20)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{companyId ? 'Actualizar' : 'Crear'} Empresa</Button>
    </form>
  )
}