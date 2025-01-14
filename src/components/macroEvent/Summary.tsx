'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase';

type Group = {
  id: number;
  name: string;
  eventIds: number[];
};

type MacroReport = {
  name: string;
  groups: Group[];
};

type Guest = {
  email: string;
  registered: boolean;
  assisted: boolean;
};

type GroupSummary = {
  name: string;
  totalInvitados: number;
  totalRegistrados: number;
  totalAsistentes: number;
};

export default function MacroEventSummary({
  macroReports,
  defaultCompany,
  onSummariesChange,
}: {
  macroReports: MacroReport[];
  defaultCompany: string;
  onSummariesChange: (summaries: { [key: string]: GroupSummary[] }) => void;
}) {
  const [summaries, setSummaries] = useState<{ [key: string]: GroupSummary[] }>({});

  useEffect(() => {
    async function fetchGroupData() {
      const newSummaries: { [key: string]: GroupSummary[] } = {};

      for (const report of macroReports) {
        const groupSummaries: GroupSummary[] = [];

        for (const group of report.groups) {
          let query = supabase
          .from('event_guest')
          .select('email, registered, assisted, company_razon_social')
          .in('event_id', group.eventIds);

        // Agregar filtro por company_razon_social si defaultCompany no es "Todas"
        if (defaultCompany !== "Todas") {
          query = query.eq('company_razon_social', defaultCompany);
        }

        const { data: guests, error } = await query;

        if (error) {
          console.error('Error fetching guests:', error);
         }
          // Agrupar invitados por email
          const guestMap: { [email: string]: Guest } = {};
          guests?.forEach((guest: Guest) => {
            if (!guestMap[guest.email]) {
              guestMap[guest.email] = { ...guest };
            } else {
              guestMap[guest.email].registered = guestMap[guest.email].registered || guest.registered;
              guestMap[guest.email].assisted = guestMap[guest.email].assisted || guest.assisted;
            }
          });

          const uniqueGuests = Object.values(guestMap);
          const totalInvitados = uniqueGuests.length;
          const totalRegistrados = uniqueGuests.filter((g) => g.registered).length;
          const totalAsistentes = uniqueGuests.filter((g) => g.assisted).length;

          groupSummaries.push({
            name: group.name,
            totalInvitados,
            totalRegistrados,
            totalAsistentes,
          });
        }

        newSummaries[report.name] = groupSummaries;
        onSummariesChange(newSummaries);
      }

      setSummaries(newSummaries);
    }

    fetchGroupData();
  }, [macroReports, defaultCompany]);

  return (
    <div className="space-y-6">
      {Object.entries(summaries).map(([reportName, groupSummaries]) => (
        <Card key={reportName}>
          <CardHeader>
            <CardTitle>{reportName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Grupo</TableHead>
                  <TableHead>Invitados</TableHead>
                  <TableHead>Registrados</TableHead>
                  <TableHead>Asistentes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupSummaries.map((summary) => {
                  const porcentajeRegistrados = summary.totalInvitados
                    ? ((summary.totalRegistrados / summary.totalInvitados) * 100).toFixed(2)
                    : '0.00';
                  const porcentajeAsistentes = summary.totalRegistrados
                    ? ((summary.totalAsistentes / summary.totalRegistrados) * 100).toFixed(2)
                    : '0.00';

                  return (
                    <TableRow key={summary.name}>
                      <TableCell>{summary.name}</TableCell>
                      <TableCell>{summary.totalInvitados}</TableCell>
                      <TableCell>
                        {summary.totalRegistrados} ({porcentajeRegistrados}%)
                      </TableCell>
                      <TableCell>
                        {summary.totalAsistentes} ({porcentajeAsistentes}%)
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
