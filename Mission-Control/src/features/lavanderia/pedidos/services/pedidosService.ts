import { createClient } from '@/lib/supabase/client'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

export interface StaffOrderData {
  client_name: string
  bags_count: number
  pickup_day: string
  pickup_time: 'AM' | 'PM'
}

export async function getCcOrdersAll(): Promise<CcOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cc_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateCcOrderStatus(id: string, status: CcOrderStatus): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('cc_orders')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function createStaffOrder(data: StaffOrderData): Promise<CcOrder> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: result, error } = await supabase
    .from('cc_orders')
    .insert({
      user_id: user?.id ?? '',
      client_name: data.client_name,
      bags_count: data.bags_count,
      pickup_day: data.pickup_day,
      pickup_time: data.pickup_time,
    })
    .select()
    .single()

  if (error) throw error
  return result
}
