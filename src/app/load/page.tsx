'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';

export default function RegisterGuestsPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const logGuestsByEmail = async () => {
      const { data, error } = await supabase
        .from('event_guest')
        .select('*')
        .eq('email', 'sebastian.hurtado@utec.edu.pe');
      if (error) {
        console.error('Error fetching guests:', error);
      } else {
        console.log('Guests with email sebastian.hurtado@utec.edu.pe:', data);
      }
    };

    logGuestsByEmail();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCsvFile(file);
  };

  const processCsv = async () => {
    if (!csvFile) {
      setStatus('Por favor, selecciona un archivo CSV.');
      return;
    }

    setProcessing(true);
    setStatus(null);

    Papa.parse(csvFile, {
      header: true,
      complete: async (result) => {
        const rows = result.data as { correo: string; usuario: string, membresia: string }[];
        const updates = [];

        for (const row of rows) {
          try {
            const { error: updateError } = await supabase
              .from('event_guest')
              .update({ tipo_usuario: row.usuario, tipo_membresia: row.membresia })
              .eq('email', row.correo);
              console.log('Actualizando:', row.correo, row.usuario, row.membresia);

            if (updateError) {
              console.error(`Error actualizando: ${row.correo}`, updateError);
              continue;
            }

            updates.push(row);
          } catch (error) {
            console.error('Error procesando fila:', row, error);
          }
        }

        setStatus(`Procesado correctamente: ${updates.length} registros actualizados.`);
        setProcessing(false);
      },
      error: (error) => {
        console.error('Error procesando CSV:', error);
        setStatus('Error procesando el archivo CSV.');
        setProcessing(false);
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Registrar Invitados desde CSV</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <Button onClick={processCsv} disabled={processing}>
        {processing ? 'Procesando...' : 'Registrar'}
      </Button>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
