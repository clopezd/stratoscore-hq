'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { BrainCircuit, X, Minimize2 } from 'lucide-react'
import { ConsultantChat } from './ConsultantChat'

/**
 * VIDEO 18 — Floating AI Assistant Button
 * Aparece en todas las páginas de Videndum con contexto automático de página
 */
export function V18FloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [autoMessage, setAutoMessage] = useState<string | null>(null)
  const pathname = usePathname()

  // Detectar página y generar mensaje contextual automático
  useEffect(() => {
    if (!isOpen) return // Solo cuando se abre el chat

    const path = pathname ?? ''
    let contextMessage: string | null = null

    if (path.includes('/ml-forecast')) {
      contextMessage = '¿Cuál es el forecast ML para las próximas semanas y cómo se compara con el histórico?'
    } else if (path.includes('/planning')) {
      contextMessage = '¿Qué ajustes recientes ha hecho CR al forecast UK y qué accuracy han tenido?'
    } else if (path.includes('/analisis')) {
      contextMessage = '¿Cuáles son los principales riesgos competitivos detectados en el portfolio actual?'
    }

    if (contextMessage) {
      setAutoMessage(contextMessage)
    }
  }, [isOpen, pathname])

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Abrir VIDEO 18"
        >
          {/* Círculo principal */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-violet-500/60">
              <BrainCircuit size={26} className="text-white" />
            </div>

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />

            {/* Badge "V18" */}
            <div className="absolute -top-1 -right-1 bg-white text-violet-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md border border-violet-200">
              V18
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
            <div className="bg-[#13131f] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
              <p className="text-[10px] text-white font-medium">Pregúntale a VIDEO 18</p>
              <p className="text-[9px] text-white/50 mt-0.5">Asistente IA · 50k+ profesionales confían</p>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 w-2 h-2 bg-[#13131f] border-r border-b border-white/10 rotate-[-45deg]" />
          </div>
        </button>
      )}

      {/* Panel flotante (cuando está abierto) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-64'
              : 'bottom-6 right-6 w-[420px]'
          }`}
        >
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header con controles */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-white" />
                <div>
                  <p className="text-xs font-bold text-white">VIDEO 18</p>
                  <p className="text-[9px] text-violet-100/70">Asistente Estratégico IA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenido del chat (solo si no está minimizado) */}
            {!isMinimized && (
              <div className="p-0">
                <ConsultantChat triggerMessage={autoMessage} />
              </div>
            )}

            {/* Estado minimizado */}
            {isMinimized && (
              <div className="p-4 text-center">
                <p className="text-xs text-white/50">Click para expandir</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
