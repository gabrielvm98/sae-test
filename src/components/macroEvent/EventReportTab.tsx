'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionTimeDistributionChart } from '@/components/ConnectionTimeDistributionChart';
import { CompanySelect } from '@/components/ReportCompanySelect';

type ReportGuest = {
  id: string;
  name: string;
  company: string;
  position: string;
  registered: boolean;
  assisted: boolean;
  virtual_session_time: number;
};

interface ReportGuest {
  name: string;
  company: string;
  email: string;
  registered: boolean;
  assisted: boolean;
  virtual_session_time: number;
}

type EventData = {
  totalInvitados: number;
  totalRegistrados: number;
  totalAsistentes: number;
  tiempoConexionPromedio: string;
  invitados: ReportGuest[];
};

export function EventReportTab({
  guests,
  defaultCompany = "Todas",
  showCompanyFilter = true,
  showConnectionTimeChart = false,
}: {
  guests: ReportGuest[]; // Recibe la lista de invitados como prop
  defaultCompany?: string;
  showCompanyFilter?: boolean;
  showConnectionTimeChart?: boolean;
}) {
  const [companySeleccionada, setEmpresaSeleccionada] = useState(defaultCompany);

  // Calcular datos iniciales de invitados
  const eventData = useMemo(() => {
    const totalInvitados = guests.length;
    const totalRegistrados = guests.filter((guest) => guest.registered).length;
    const totalAsistentes = guests.filter((guest) => guest.assisted).length;
    const tiempoConexionPromedio = calcularTiempoConexionPromedio(guests);

    return {
      totalInvitados,
      totalRegistrados,
      totalAsistentes,
      tiempoConexionPromedio,
      invitados: guests,
    };
  }, [guests]);

  // Filtrar invitados por empresa
  const filtrarPorEmpresa = useMemo(() => {
    if (companySeleccionada === "Todas") return eventData;

    const invitadosFiltrados = eventData.invitados.filter((guest) => guest.company === companySeleccionada);
    return {
      totalInvitados: invitadosFiltrados.length,
      totalRegistrados: invitadosFiltrados.filter((guest) => guest.registered).length,
      totalAsistentes: invitadosFiltrados.filter((guest) => guest.assisted).length,
      tiempoConexionPromedio: calcularTiempoConexionPromedio(invitadosFiltrados),
      invitados: invitadosFiltrados,
    };
  }, [eventData, companySeleccionada]);

  const companies = useMemo(() => {
    return ["Todas", ...new Set(guests.map((guest) => guest.company).filter(Boolean))];
  }, [guests]);

  function calcularTiempoConexionPromedio(invitados: ReportGuest[]): string {
    const asistentes = invitados.filter((guest) => guest.assisted);
    const totalTiempo = asistentes.reduce((sum, guest) => sum + guest.virtual_session_time, 0);
    const promedio = asistentes.length > 0 ? Math.round(totalTiempo / asistentes.length) : 0;
    return formatTime(promedio);
  }

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  if (!filtrarPorEmpresa) {
    return <div>No se pudieron cargar los datos.</div>;
  }

  const { totalInvitados, totalRegistrados, totalAsistentes, tiempoConexionPromedio } = filtrarPorEmpresa;
  const porcentajeRegistrados = (totalRegistrados / totalInvitados * 100).toFixed(2);
  const porcentajeAsistencia = (totalAsistentes / totalRegistrados * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Filtro de empresa */}
      {showCompanyFilter && (
        <div className="flex justify-between items-center">
          <CompanySelect
            companies={companies}
            onValueChange={setEmpresaSeleccionada}
            defaultValue="Todas"
          />
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Invitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalInvitados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalRegistrados}</div>
            <div className="text-sm text-gray-500">({porcentajeRegistrados}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Asistentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalAsistentes}</div>
            <div className="text-sm text-gray-500">({porcentajeAsistencia}%)</div>
          </CardContent>
        </Card>
        {showConnectionTimeChart && (
          <Card>
            <CardHeader>
              <CardTitle>Tiempo Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{tiempoConexionPromedio}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de tiempo de conexión */}
      {showConnectionTimeChart && (
        <div>
          <ConnectionTimeDistributionChart asistentes={filtrarPorEmpresa.invitados.filter((guest) => guest.assisted)} />
        </div>
      )}
    </div>
  );
}

export default EventReportTab;
