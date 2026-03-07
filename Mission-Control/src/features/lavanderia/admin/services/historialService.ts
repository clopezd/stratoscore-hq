import { createClient } from '@/lib/supabase/client'
import type { CcOrder } from '@/features/lavanderia/types/database'

export async function getAllCcOrders(): Promise<CcOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cc_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
