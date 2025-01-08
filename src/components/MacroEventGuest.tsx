'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Event {
  id: number;
  name: string;
  event_type: string;
  macro_event_id: number;
}

export function ListaDeAsistentes({ eventIds }: { eventIds: number[] }) {
  const [attendees, setAttendees] = useState<{ [email: string]: { [eventName: string]: boolean } }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'multiple'>('all');

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

    // @ts-expect-error prisa
    setEvents(eventsData || []);

    const { data: guestsData, error: guestsError } = await supabase
      .from('event_guest')
      .select('email, event_id, registered')
      .in('event_id', eventIds);

    if (guestsError) {
      console.error('Error fetching guests:', guestsError);
      return;
    }

    const attendeesMap: { [email: string]: { [eventName: string]: boolean } } = {};

    guestsData.forEach((guest) => {
      const event = eventsData.find((e) => e.id === guest.event_id);
      if (!event) return;

      if (!attendeesMap[guest.email]) {
        attendeesMap[guest.email] = {};
      }

      attendeesMap[guest.email][event.name] = guest.registered;
    });

    setAttendees(attendeesMap);
  };

  const filteredAttendees = Object.entries(attendees).filter(([, events]) => {
    const registeredCount = Object.values(events).filter((registered) => registered).length;
    return filter === 'multiple' ? registeredCount > 1 : true;
  });

  return (
    <div>
      <h2 className="text-lg font-bold">Lista de Asistentes</h2>

      <div className="mb-4">
        <label className="mr-2">Mostrar más de un registro:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'multiple')}
          className="border border-gray-300 p-1"
        >
          <option value="all">No</option>
          <option value="multiple">Sí</option>
        </select>
      </div>

      <table className="table-auto border-collapse border border-gray-200 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            {events.map((event) => (
              <th key={event.id} className="border border-gray-300 px-4 py-2">
                {event.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAttendees.map(([email, events]) => (
            <tr key={email}>
              <td className="border border-gray-300 px-4 py-2">{email}</td>
              {Object.values(events).map((registered, idx) => (
                <td key={idx} className="border border-gray-300 px-4 py-2">
                  {registered ? 'Sí' : 'No'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
