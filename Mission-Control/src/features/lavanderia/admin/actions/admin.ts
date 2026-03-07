'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createAccessCode() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const code = generateCode()

  const { error } = await supabase
    .from('access_codes')
    .insert({ code })

  if (error) return { error: error.message }

  revalidatePath('/lavanderia/admin/codes')
  return { code }
}

export async function deleteAccessCode(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const { error } = await supabase
    .from('access_codes')
    .delete()
    .eq('id', id)
    .eq('is_used', false)

  if (error) return { error: error.message }

  revalidatePath('/lavanderia/admin/codes')
  return { success: true }
}
