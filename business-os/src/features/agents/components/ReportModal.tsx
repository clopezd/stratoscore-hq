'use client'

interface ReportModalProps {
  report: string | null
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  if (!report) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-[#0a0a0f] border border-white/[0.1] rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Reporte del Agente</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-white/80 text-sm leading-relaxed">
            {report}
          </div>
        </div>
      </div>
    </div>
  )
}
