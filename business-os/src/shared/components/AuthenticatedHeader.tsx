'use client'

import { Header } from './Header'

interface AuthenticatedHeaderProps {
  userProfile: {
    email: string
    role: string
    full_name: string | null
  }
}

export function AuthenticatedHeader({ userProfile }: AuthenticatedHeaderProps) {
  return <Header />
}
