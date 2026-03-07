import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrderDashboard } from '@/features/lavanderia/dashboard/components/OrderDashboard'
import { OrderBlocked } from '@/features/lavanderia/dashboard/components/OrderBlocked'
import { MisPedidos } from '@/features/lavanderia/dashboard/components/MisPedidos'

function getSixHoursAgo() {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
}

export default async function LavanderiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: todayOrder } = await supabase
    .from('cc_orders')
    .select('client_name')
    .eq('user_id', user.id)
    .gte('created_at', getSixHoursAgo())
    .limit(1)
    .maybeSingle()

  return (
    <div className="min-h-screen px-4 pt-8 pb-16">
      <div className="w-full max-w-md mx-auto mb-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0077B6]/50 mb-1">
          Portal Oficial · Servicio Exclusivo
        </p>
        <h1 className="text-xl font-black text-[#0077B6] tracking-tight leading-tight">
          MEDCARE
          <span className="block text-sm font-semibold text-[#00B4D8] mt-0.5 tracking-normal">
            C&amp;C Clean Express
          </span>
        </h1>
        <div className="mt-2 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[#00B4D8]/50 to-transparent" />
      </div>

      {todayOrder ? (
        <OrderBlocked clientName={todayOrder.client_name} />
      ) : (
        <OrderDashboard />
      )}
      <MisPedidos userId={user.id} />
    </div>
  )
}
