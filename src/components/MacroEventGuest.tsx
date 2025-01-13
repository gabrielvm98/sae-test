'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

interface Event {
  id: number;
  name: string;
  event_type: string;
  macro_event_id: number;
}

export function ListaDeAsistentes({ eventIds }: { eventIds: number[] }) {
  const [attendees, setAttendees] = useState<{ [email: string]: { [key: string]: any } }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'multiple' | 'none'>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('');
  const [membershipTypeFilter, setMembershipTypeFilter] = useState<string>('');
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchAttendees();
  }, [eventIds]);

  const fetchAttendees = async () => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('event')
      .select('id, name')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return;
    }

    //@ts-expect-error prisa
    setEvents(eventsData || []);

    const { data: guestsData, error: guestsError } = await supabase
      .from('event_guest')
      .select('email, event_id, name, company_razon_social, registered, tipo_usuario, tipo_membresia, reemplaza_a_correo')
      .in('event_id', eventIds);

    if (guestsError) {
      console.error('Error fetching guests:', guestsError);
      return;
    }

    const attendeesMap: { [email: string]: { [key: string]: any } } = {};
    const userTypesSet = new Set<string>();
    const membershipTypesSet = new Set<string>();

    const replacementDict: { [reemplaza_a_correo: string]: string } = {};
    guestsData.forEach((guest) => {
      if (guest.tipo_usuario === 'Reemplazo' && guest.reemplaza_a_correo) {
        replacementDict[guest.reemplaza_a_correo] = guest.email;
      }
    });

    guestsData.forEach((guest) => {
      const event = eventsData.find((e) => e.id === guest.event_id);
      if (!event) return;

      if (!attendeesMap[guest.email]) {
        attendeesMap[guest.email] = {
          tipo_usuario: guest.tipo_usuario,
          tipo_membresia: guest.tipo_membresia,
          reemplaza_a_correo: guest.reemplaza_a_correo,
          reemplazo_correo: replacementDict[guest.email],
          name: guest.name,
          company_razon_social: guest.company_razon_social,
        };
      }

      attendeesMap[guest.email][event.name] = guest.registered;
      userTypesSet.add(guest.tipo_usuario);
      membershipTypesSet.add(guest.tipo_membresia);
    });

    setAttendees(attendeesMap);
    setUserTypes(Array.from(userTypesSet).sort());
    setMembershipTypes(Array.from(membershipTypesSet).sort());
  };

  const filteredAttendees = Object.entries(attendees).filter(([, details]) => {
    const registeredCount = Object.values(details).filter((value) => value === true).length;
    if (filter === 'multiple' && registeredCount <= 1) return false;
    if (filter === 'none' && registeredCount > 0) return false;
    if (userTypeFilter && details.tipo_usuario !== userTypeFilter) return false;
    if (membershipTypeFilter && details.tipo_membresia !== membershipTypeFilter) return false;
    return true; // 'all'
  });

  const downloadExcel = () => {
    const dataToExport = filteredAttendees.map(([email, details]) => {
      const row: { [key: string]: any } = {
        Email: email,
        Reemplazo: details.reemplazo_correo,
        Reemplaza_a: details.reemplaza_a_correo,
        Nombre: details.name,
        Razon_Social: details.company_razon_social,
        Loop: `${details.name} | ${details.company_razon_social?.toUpperCase() || ''}`,
        Tipo_Usuario: details.tipo_usuario,
        Tipo_Membresia: details.tipo_membresia,
      };
      Object.entries(details).forEach(([key, value]) => {
        if (
          !['tipo_usuario', 'tipo_membresia', 'reemplazo_correo', 'reemplaza_a_correo', 'name', 'company_razon_social'].includes(key)
        ) {
          row[key] = value ? 'Sí' : 'No';
        }
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes');
    XLSX.writeFile(wb, 'asistentes.xlsx');
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Lista de Asistentes</h2>

      <div className="mb-4">
        <label className="mr-2">Filtrar:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'multiple' | 'none')}
          className="border border-gray-300 p-1"
        >
          <option value="all">Todos</option>
          <option value="multiple">Más de un registro</option>
          <option value="none">Ningún registro</option>
        </select>

        <label className="ml-4 mr-2">Tipo de Usuario:</label>
        <select
          value={userTypeFilter}
          onChange={(e) => setUserTypeFilter(e.target.value)}
          className="border border-gray-300 p-1"
        >
          <option value="">Todos</option>
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label className="ml-4 mr-2">Tipo de Membresía:</label>
        <select
          value={membershipTypeFilter}
          onChange={(e) => setMembershipTypeFilter(e.target.value)}
          className="border border-gray-300 p-1"
        >
          <option value="">Todos</option>
          {membershipTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={downloadExcel}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Descargar Excel
        </button>
      </div>

      <table className="table-auto border-collapse border border-gray-200 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Tipo de Usuario</th>
            <th className="border border-gray-300 px-4 py-2">Tipo de Membresía</th>
            <th className="border border-gray-300 px-4 py-2">Reemplazo</th>
            <th className="border border-gray-300 px-4 py-2">Reemplaza a</th> 
            {events.map((event) => (
              <th key={event.id} className="border border-gray-300 px-4 py-2">
                {event.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAttendees.map(([email, details]) => (
            <tr key={email}>
              <td className="border border-gray-300 px-4 py-2">{email}</td>
              <td className="border border-gray-300 px-4 py-2">{details.tipo_usuario}</td>
              <td className="border border-gray-300 px-4 py-2">{details.tipo_membresia}</td>
              <td className="border border-gray-300 px-4 py-2">{details.reemplaza_a_correo}</td>
              <td className="border border-gray-300 px-4 py-2">{details.reemplazo_correo}</td>
              {events.map((event) => (
                <td
                  key={event.id}
                  className="border border-gray-300 px-4 py-2"
                >
                  {details[event.name] ? 'Sí' : 'No'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
