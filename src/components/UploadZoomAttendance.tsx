'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { toast } from "@/hooks/use-toast";

export function UploadZoomAttendance({ eventId }: { eventId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orphanedEmails, setOrphanedEmails] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  async function processZoomAttendance(csvFile: File) {
    console.log('Procesando archivo CSV con PapaParse...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const fileContent = reader.result as string;
  
        // Dividir líneas y encontrar el inicio de "Detalles de asistente"
        const lines = fileContent.split('\n').map((line) => line.trim());
        const assistantIndex = lines.findIndex((line) => line.includes('Detalles de asistente'));
  
        if (assistantIndex === -1) {
          console.error('No se encontró la sección "Detalles de asistente".');
          return reject('El archivo no contiene datos relevantes.');
        }
  
        console.log(`"Detalles de asistente" encontrado en la línea ${assistantIndex + 1}`);
  
        // Procesar desde la línea siguiente
        const relevantLines = lines.slice(assistantIndex + 1).filter((line) => line !== '');
        if (relevantLines.length < 2) {
          console.error('No hay suficientes líneas después de "Detalles de asistente".');
          return reject('El archivo no contiene datos suficientes para procesar.');
        }
  
        // Parsear cabeceras
        const headers = Papa.parse(relevantLines[0], { delimiter: ',', quoteChar: '"' }).data[0] as string[];
        console.log('Cabeceras detectadas:', headers);
  
        // Validar cabeceras necesarias
        const attendedIndex = headers.indexOf('Asistió');
        const emailIndex = headers.indexOf('Correo electrónico');
        const timeIndex = headers.indexOf('Tiempo en la sesión (minutos)');
  
        if (attendedIndex === -1 || emailIndex === -1 || timeIndex === -1) {
          console.error('Faltan columnas requeridas.');
          return reject('Faltan columnas requeridas: Asistió, Correo electrónico, o Tiempo en la sesión (minutos)');
        }
  
        // Parsear filas DOS VECES
        const rows = relevantLines.slice(1).map((line) => {
          // Primer parseo: convertir la línea en un array de strings
          const parsedRow = Papa.parse(line, { delimiter: ',', quoteChar: '"' }).data;
        
          if (!Array.isArray(parsedRow) || !Array.isArray(parsedRow[0])) {
            throw new Error("El primer parseo no devolvió un array de strings.");
          }
          
          
          // Segundo parseo del primer elemento
          const reParsedRow = Papa.parse(parsedRow[0][0], { delimiter: ',', quoteChar: '"' }).data;
        
          if (!Array.isArray(reParsedRow) || !Array.isArray(reParsedRow[0])) {
            throw new Error("El segundo parseo no devolvió un array de strings.");
          }
        
          return reParsedRow[0]; // Devuelve la fila parseada correctamente
        });
  
        console.log('Filas procesadas (dos veces parseadas):', rows);
  
        // Consolidar datos
        const consolidated = rows.reduce((acc, row, rowIndex) => {
          if (row.length !== headers.length) {
            console.warn(`Fila ${rowIndex + 1} tiene un número incorrecto de columnas:`, row);
          }
  
          const attended = row[attendedIndex]?.toLowerCase().trim();
          const email = row[emailIndex]?.trim().toLowerCase();
          const time = parseInt(row[timeIndex], 10) || 0;
          console.log('Fila procesada:', { attended, email, time });
  
          if (attended === 'sí' && email) {
            if (!acc[email]) {
              acc[email] = { email, totalTime: 0 };
            }
            acc[email].totalTime += time;
          }
          return acc;
        }, {} as Record<string, { email: string; totalTime: number }>);
  
        const result = Object.values(consolidated);
        console.log('Asistencia consolidada:', result);
        resolve(result);
      };
  
      reader.onerror = () => {
        console.error('Error al leer el archivo CSV.');
        reject('No se pudo leer el archivo CSV.');
      };
  
      reader.readAsText(csvFile);
    });
  }
  
  

  async function updateEventGuests(attendanceData: { email: string; totalTime: number }[]) {
    console.log('Actualizando asistentes en Supabase...', attendanceData);
    const batchSize = 50;
    const orphanedEmails: string[] = [];
  
    for (let i = 0; i < attendanceData.length; i += batchSize) {
      const batch = attendanceData.slice(i, i + batchSize);
      console.log('Procesando lote:', batch);
  
      const emails = batch.map((item) => item.email.toLowerCase());
  
      const { data: guests, error } = await supabase
        .from('event_guest')
        .select('id, email, is_user')
        .eq('event_id', eventId)
        .or(`email.in.(${emails.join(',')})`)
  
      if (error) {
        console.error('Error al obtener invitados:', error);
        continue;
      }
  
      console.log('Invitados obtenidos:', guests);
  
      const updates = guests.map((guest) => {
        const guestEmail = guest.email;
        const attendanceInfo = batch.find((item) => item.email === guestEmail?.toLowerCase());
        if (attendanceInfo) {
          return {
            id: guest.id,
            virtual_session_time: attendanceInfo.totalTime,
            assisted: true,
          };
        }
        return null;
      }).filter(Boolean);
  
      console.log('Actualizaciones para invitados:', updates);
  
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('event_guest')
          .upsert(updates);
  
        if (updateError) {
          console.error('Error actualizando invitados:', updateError);
        }
      }
  
      // Check for orphaned emails
      const updatedEmails = new Set(guests.map(guest => guest.email).filter(Boolean));
      console.log('Correos actualizados:', updatedEmails);
      const batchOrphanedEmails = emails.filter(email => !updatedEmails.has(email));
      orphanedEmails.push(...batchOrphanedEmails);
    }
  
    setOrphanedEmails(orphanedEmails);
    if (orphanedEmails.length > 0) {
      console.log('Correos huérfanos encontrados:', orphanedEmails);
      toast({
        title: "Correos huérfanos encontrados",
        description: `Se encontraron ${orphanedEmails.length} correos en el CSV que no están en la tabla event_guest.`,
        variant: "default",
      });
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      console.log('Subiendo archivo:', file.name);
      const attendanceData = await processZoomAttendance(file);
      await updateEventGuests(attendanceData as { email: string; totalTime: number }[]);
      toast({
        title: "Éxito",
        description: "La asistencia de Zoom se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error al procesar asistencia de Zoom:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la asistencia de Zoom.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
      >
        <p>Arrastra y suelta un archivo CSV de asistencia de Zoom aquí, o haz clic para seleccionar un archivo</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          id="zoom-csv-upload"
        />
        <label htmlFor="zoom-csv-upload" className="mt-2 inline-block">
          <Button variant="outline" type="button">Seleccionar archivo</Button>
        </label>
      </div>
      {file && <p>Archivo seleccionado: {file.name}</p>}
      <Button onClick={handleUpload} disabled={!file || isUploading}>
        {isUploading ? 'Subiendo...' : 'Subir asistencia de Zoom'}
      </Button>
      {orphanedEmails.length > 0 && (
        <div className="mt-4 p-4 border rounded-md bg-yellow-50">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Correos huérfanos encontrados:</h3>
          <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
            {orphanedEmails.map((email, index) => (
              <li key={index} className="text-yellow-700">{email}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-yellow-600">Total: {orphanedEmails.length} correos huérfanos</p>
        </div>
      )}
    </div>
  );
}
