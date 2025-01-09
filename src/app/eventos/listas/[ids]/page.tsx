'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventGuestTable } from '@/components/macroEvent/EventGuestTable'
import { CreateGuestForm } from '@/components/macroEvent/CreateGuestForm'
import { ImportUsers } from '@/components/macroEvent/ImportUsers'
import { ImportExternals } from '@/components/macroEvent/ImportExternals'
import * as XLSX from 'xlsx'

type Event = {
  id: number
  name: string
  event_type: string
  date_hour: string
  place: string
  register_open: boolean
}

export default function EventDetailPage({ params }: { params: Promise<{ ids?: string }> }) {
  const resolvedParams = use(params); // Resolvemos la Promise de `params`
  const idsParam = resolvedParams?.ids ? decodeURIComponent(resolvedParams.ids) : '';
  const eventIds = idsParam ? idsParam.split(',').map(Number) : [];

  console.log(eventIds);

  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .in('id', eventIds);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  }

  if (events.length === 0) return <div>Cargando...</div>;

  const handleExcelClick = async () => {
    const { data, error } = await supabase
      .from('event_guest')
      .select(`
        *,
        executive:executive_id (name, last_name)
      `)
      .in('event_id', eventIds);

    if (error) {
      console.error('Error fetching guests:', error);
      return;
    }

    if (data) {
      try {
        const enrichedData = data.map((guest) => ({
          email: guest.email,
          name: guest.is_user
            ? `${guest.executive?.name} ${guest.executive?.last_name || ''}`.trim()
            : guest.name,
          registered: guest.registered === null ? false : guest.registered,
          registration_link: `https://sae-register.vercel.app/${encodeURIComponent(guest.email)}`
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(enrichedData);
        XLSX.utils.book_append_sheet(wb, ws, "Guests");

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'event_guests.xlsx';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      } catch (parseError) {
        console.error('Error generating Excel:', parseError);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">Eventos</h1>

      <Tabs defaultValue="invitados" className="w-full">
        <TabsList className="sm:hidden flex gap-2 overflow-x-auto scrollbar-hide w-full">
          <TabsTrigger value="invitados" className="flex-shrink-0 text-sm px-4 py-2">
            Invitados
          </TabsTrigger>
          <TabsTrigger value="importar-usuarios" className="flex-shrink-0 text-sm px-4 py-2">
            Importar Usuarios
          </TabsTrigger>
          <TabsTrigger value="importar-externos" className="flex-shrink-0 text-sm px-4 py-2">
            Importar Externos
          </TabsTrigger>
        </TabsList>
        <TabsList className="hidden sm:grid w-full grid-cols-6">
          <TabsTrigger value="invitados">Invitados</TabsTrigger>
          <TabsTrigger value="importar-usuarios">Importar Usuarios</TabsTrigger>
          <TabsTrigger value="importar-externos">Importar Externos</TabsTrigger>
        </TabsList>

        <TabsContent value="invitados">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cerrar formulario' : 'Añadir invitado'}
              </Button>
              <div className="flex ml-auto space-x-2">
                <Button variant="outline" onClick={() => handleExcelClick()}>Descargar Excel</Button>
              </div>
            </div>
            {showForm && <CreateGuestForm eventIds={eventIds} onComplete={() => setShowForm(false)} />}
            <EventGuestTable eventIds={eventIds} />
          </div>
        </TabsContent>

        <TabsContent value="importar-usuarios">
          <ImportUsers eventIds={eventIds} />
        </TabsContent>

        <TabsContent value="importar-externos">
          <ImportExternals eventIds={eventIds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
