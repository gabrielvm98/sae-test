'use client'

import { Bar, BarChart, XAxis, ResponsiveContainer, LabelList  } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ReportAttendee = {
  id: string
  name: string
  company: string
  registered: boolean
  assisted: boolean
  virtual_session_time: number
}

type Props = {
  asistentes: ReportAttendee[]
}

export function ConnectionTimeDistributionChart({ asistentes }: Props) {
  // Agrupar tiempos de conexión en intervalos de 30 minutos
  const groupedData = asistentes.reduce((acc, attendee) => {
    const minutes = attendee.virtual_session_time || 0
    const interval = Math.floor(minutes / 30) * 30
    acc[interval] = (acc[interval] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Convertir los datos agrupados al formato requerido por el gráfico
  const chartData = Object.entries(groupedData).map(([interval, count]) => ({
    interval: `${interval}-${parseInt(interval) + 30} min`,
    count
  }))

  // Ordenar los datos por intervalos
  chartData.sort((a, b) => parseInt(a.interval) - parseInt(b.interval))

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Distribución de Tiempo de Conexión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="interval" 
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <Bar dataKey="count" fill="#006F96">
                <LabelList dataKey="count" position="top" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
