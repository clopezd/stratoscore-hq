import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'
import { StratoscoreLogo } from '@/shared/components/StratoscoreLogo'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Glass card */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl backdrop-saturate-150 p-8
        bg-gradient-to-br from-white/12 via-white/5 to-white/8 border border-white/[0.08]
        shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
        {/* Specular rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-white/30 via-white/5 to-transparent" />
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/[0.07] rounded-full blur-2xl" />

        {/* Header — Stratoscore logo + título */}
        <div className="relative z-10 text-center mb-8">
          <StratoscoreLogo width={160} className="mx-auto mb-6 text-white" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-white/40">Mission Control</p>
        </div>

        {/* Form */}
        <div className="relative z-10">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-white/30 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-white/60 hover:text-white transition-colors duration-200">
          Sign up
        </Link>
      </p>
    </div>
  )
}
