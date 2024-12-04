'use client'

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Tiempo de Conexión</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Número de Asistentes",
              color: "#006F96",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="interval" 
                label={{ value: 'Intervalo de Tiempo', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Número de Asistentes', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
