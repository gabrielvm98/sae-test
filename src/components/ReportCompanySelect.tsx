'use client'

import { useState, useRef, useEffect } from "react";

export function CompanySelect({
  companies,
  onValueChange,
  defaultValue,
}: {
  companies: string[];
  onValueChange: (value: string) => void;
  defaultValue: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filtra las empresas según el término de búsqueda
  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen); // Abre o cierra el menú
    setTimeout(() => inputRef.current?.focus(), 0); // Mantén el enfoque
  };

  const handleCompanySelect = (company: string) => {
    setSelectedValue(company); // Actualiza el valor visual
    onValueChange(company); // Llama al callback funcional
    setIsOpen(false); // Cierra el menú
    setSearchTerm(""); // Resetea el término de búsqueda
  };

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full min-w-[240px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className="w-full px-4 py-2 border rounded-md bg-white text-left shadow-sm"
      >
        {selectedValue || "Selecciona una empresa"}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg min-w-[240px]">
          {/* Campo de búsqueda */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar empresa..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Lista de empresas */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCompanySelect(company)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  {company}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No se encontraron empresas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
