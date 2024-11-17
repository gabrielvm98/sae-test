import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              SAE CRM
            </Link>
          </div>
          <div className="flex">
            <Button variant="ghost" asChild>
              <Link href="/empresas">
                Empresas
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/usuarios">
                Usuarios
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/secretarias">
                Secretarias
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/consultas">
                Consultas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}