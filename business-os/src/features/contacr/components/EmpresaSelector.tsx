'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Building2 } from 'lucide-react'
import { useContaCRStore } from '../store'
import { fetchEmpresas } from '../services/empresas'
import { EmpresaFormModal } from './EmpresaFormModal'
import type { Empresa } from '../types'

export function EmpresaSelector() {
  const { empresas, empresaActiva, setEmpresas, setEmpresaActiva } = useContaCRStore()
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEmpresas().then((data) => {
      setEmpresas(data)
      if (!empresaActiva && data.length > 0) {
        setEmpresaActiva(data[0])
      }
    }).catch(console.error)
  }, [setEmpresas, setEmpresaActiva, empresaActiva])

  const handleSelect = (empresa: Empresa) => {
    setEmpresaActiva(empresa)
    setOpen(false)
  }

  const handleCreated = (empresa: Empresa) => {
    setEmpresas([...empresas, empresa])
    setEmpresaActiva(empresa)
    setShowModal(false)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-sm transition-colors"
        >
          <Building2 size={14} className="text-blue-400" />
          <span className="text-white/80 truncate max-w-[180px]">
            {empresaActiva?.nombre || 'Seleccionar empresa'}
          </span>
          <ChevronDown size={14} className="text-white/40" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              {empresas.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    empresaActiva?.id === emp.id
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="font-medium">{emp.nombre}</div>
                  {emp.cedula_juridica && (
                    <div className="text-[10px] text-white/40 mt-0.5">{emp.cedula_juridica}</div>
                  )}
                </button>
              ))}
              <button
                onClick={() => { setOpen(false); setShowModal(true) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-white/[0.06] border-t border-white/10 transition-colors"
              >
                <Plus size={14} />
                Nueva empresa
              </button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <EmpresaFormModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
