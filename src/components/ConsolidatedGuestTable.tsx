'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GuestsTable({ guests }: { guests: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [registeredFilter, setRegisteredFilter] = useState("Todos");
    const [attendedFilter, setAttendedFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
      }
  
    const filteredGuests = useMemo(() => {
      return guests.filter(guest => {
        const matchesSearch = 
        searchQuery === '' ||
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.company && guest.company.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRegistered = registeredFilter === "Todos" || (registeredFilter === "Sí" && guest.registered) || (registeredFilter === "No" && !guest.registered);
        const matchesAttended = attendedFilter === "Todos" || (attendedFilter === "Sí" && guest.assisted) || (attendedFilter === "No" && !guest.assisted);
        return matchesSearch && matchesRegistered && matchesAttended;
      });
    }, [guests, searchQuery, registeredFilter, attendedFilter]);
  
    const paginatedGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Invitados</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Buscador y Filtros */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 sm:space-x-4 mb-4">
            <Input
              type="text"
              placeholder="Buscar invitados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="registered-filter" className="text-sm font-medium">Se registró</label>
                <Select onValueChange={setRegisteredFilter} defaultValue="Todos">
                  <SelectTrigger id="registered-filter" className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Total" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Total</SelectItem>
                    <SelectItem value="Sí">Sí</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="attended-filter" className="text-sm font-medium">Asistió</label>
                <Select onValueChange={setAttendedFilter} defaultValue="Todos">
                  <SelectTrigger id="attended-filter" className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Total" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Total</SelectItem>
                    <SelectItem value="Sí">Sí</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
  
          {/* Tabla */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead>Asistió</TableHead>
                  <TableHead>Tiempo de Conexión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGuests.map((guest, index) => (
                  <TableRow key={index}>
                    <TableCell>{guest.name}</TableCell>
                    <TableCell>{guest.company}</TableCell>
                    <TableCell>{guest.registered ? "Sí" : "No"}</TableCell>
                    <TableCell>{guest.assisted ? "Sí" : "No"}</TableCell>
                    <TableCell>{formatTime(guest.virtual_session_time || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
  
          {/* Paginación */}
          <div className="flex justify-between items-center mt-4">
            <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  