import { CalendarCheck } from 'lucide-react'

interface Props {
  clientName: string
}

export function OrderBlocked({ clientName }: Props) {
  return (
    <div className="w-full max-w-md mx-auto bg-blue-50/70 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-8 text-center shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <CalendarCheck size={28} className="text-blue-500" />
        </div>
      </div>
      <h2 className="text-lg font-bold text-blue-800 mb-3">Pedido registrado</h2>
      <p className="text-sm text-blue-700 leading-relaxed">
        ¡Hola! Notamos que ya se registró un pedido para{' '}
        <span className="font-semibold">{clientName}</span> el día de hoy.
        Para mantener un control óptimo en nuestras entregas, el sistema solo
        permite un pedido diario. ¡Mañana estaremos listos para recibir el
        siguiente! Muchas gracias por tu colaboración.
      </p>
    </div>
  )
}
