'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';

export default function RegisterGuestsPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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
        const rows = result.data as { dia: string; link: string }[];
        const updates = [];

        for (const row of rows) {
          try {
            console.log('Email:', row);
            const email = row.link.replace('https://sae-register.vercel.app/', '').replace('%40', '@');
            console.log('Email:', email);
            if (!email) continue;

            const eventId = parseInt(row.dia, 10);

            const { error: updateError } = await supabase
              .from('event_guest')
              .update({ registered: true })
              .eq('email', email)
              .eq('event_id', eventId);

            if (updateError) {
              console.error(`Error actualizando: ${email}, evento ${eventId}`, updateError);
              continue;
            }

            updates.push({ email, eventId });
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
