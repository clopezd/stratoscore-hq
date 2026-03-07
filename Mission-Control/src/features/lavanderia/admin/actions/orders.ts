'use server'

import { createClient } from '@/lib/supabase/server'

interface SaveOrderData {
  client_name: string
  bags_count: number
  pickup_day: string
  pickup_time: 'AM' | 'PM'
}

export async function saveOrder(data: SaveOrderData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase.from('cc_orders').insert({
    user_id: user.id,
    client_name: data.client_name,
    bags_count: data.bags_count,
    pickup_day: data.pickup_day,
    pickup_time: data.pickup_time,
  })

  if (error) {
    return { error: 'No se pudo guardar el pedido. Inténtalo de nuevo.' }
  }

  return { success: true }
}
