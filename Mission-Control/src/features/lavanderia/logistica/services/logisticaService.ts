import { createClient } from '@/lib/supabase/client'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

export async function getUserCcOrders(userId: string): Promise<CcOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cc_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw error
  return data ?? []
}

export async function getCcOrders(): Promise<CcOrder[]> {
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
