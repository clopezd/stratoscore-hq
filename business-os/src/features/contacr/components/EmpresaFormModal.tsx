'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createEmpresa } from '../services/empresas'
import type { Empresa } from '../types'

interface Props {
  onClose: () => void
  onCreated: (empresa: Empresa) => void
}

export function EmpresaFormModal({ onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [tipo, setTipo] = useState<'fisica' | 'juridica'>('juridica')
  const [actividad, setActividad] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es requerido'); return }

    setLoading(true)
    setError('')
    try {
      const empresa = await createEmpresa({
        nombre: nombre.trim(),
        cedula_juridica: cedula.trim() || undefined,
        tipo_persona: tipo,
        actividad_economica: actividad.trim() || undefined,
      })
      onCreated(empresa)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Nueva Empresa</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Nombre de la empresa *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Distribuidora CR S.A."
              className="w-full px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Cédula jurídica</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ej: 3-101-123456"
              className="w-full px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Tipo de persona</label>
            <div className="flex gap-3">
              {(['juridica', 'fisica'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                    tipo === t
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white/70'
                  }`}
                >
                  {t === 'juridica' ? 'Jurídica' : 'Física'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Actividad económica</label>
            <input
              type="text"
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              placeholder="Ej: Venta de productos al por menor"
              className="w-full px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-white/50 bg-white/[0.04] rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creando...' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
