import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function Home() {
  const { data: companies, error } = await supabase
    .from('company')
    .select('ruc, razon_social')

  if (error) {
    console.error('Error fetching companies:', error)
    return <div>Error loading companies. Please try again later.</div>
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Company List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RUC</TableHead>
            <TableHead>Razón Social</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies?.map((company) => (
            <TableRow key={company.ruc}>
              <TableCell>{company.ruc}</TableCell>
              <TableCell>{company.razon_social}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}