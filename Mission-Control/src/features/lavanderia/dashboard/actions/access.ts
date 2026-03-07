'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'lavanderia_access'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 días

export async function verifyAccessCode(code: string): Promise<{ success: boolean }> {
  const expected = process.env.LAVANDERIA_ACCESS_CODE ?? 'RMA-2027'

  if (code.trim() !== expected) {
    return { success: false }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '1', {
    httpOnly: true,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return { success: true }
}

export async function hasLavanderiaAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === '1'
}
