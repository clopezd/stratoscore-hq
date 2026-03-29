'use client'

interface ReportModalProps {
  report: string | null
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  if (!report) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/[0.1] rounded-2xl overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.07]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Reporte del Agente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-white/80 text-sm leading-relaxed">
            {report}
          </div>
        </div>
      </div>
    </div>
  )
}
