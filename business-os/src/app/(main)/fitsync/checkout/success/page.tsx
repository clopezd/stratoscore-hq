'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'timeout'>('verifying')
  const router = useRouter()

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10

    const checkAccess = async () => {
      attempts++

      try {
        const res = await fetch('/api/fitsync/checkout/verify')
        const data = await res.json()

        if (data.tier && data.tier !== 'free') {
          setStatus('success')
          setTimeout(() => router.push('/fitsync'), 3000)
          return
        }
      } catch {}

      if (attempts < maxAttempts) {
        setTimeout(checkAccess, 2000)
      } else {
        setStatus('timeout')
      }
    }

    const timer = setTimeout(checkAccess, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        {status === 'verifying' && (
          <>
            <Loader2 size={48} className="mx-auto text-emerald-500 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900">Verificando tu suscripción...</h1>
            <p className="text-gray-500 text-sm">Esto toma unos segundos.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <h1 className="text-xl font-bold text-gray-900">¡Suscripción activada!</h1>
            <p className="text-gray-500 text-sm">Redirigiendo a FitSync AI...</p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <CheckCircle size={48} className="mx-auto text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900">Pago recibido</h1>
            <p className="text-gray-500 text-sm">
              Tu suscripción se está procesando. Puede tomar unos minutos.
            </p>
            <button
              onClick={() => router.push('/fitsync')}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              Ir a FitSync
            </button>
          </>
        )}
      </div>
    </div>
  )
}
