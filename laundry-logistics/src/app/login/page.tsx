"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Placeholder — sin conexión real todavía
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#00F2FE] tracking-wide">
          Lavandería
        </h1>
        <p className="text-sm text-[#8B949E] mt-1">Sistema de Logística</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-lg font-semibold text-[#E0EDE0] mb-6">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-[#8B949E] mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                className="w-full bg-[#001117] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#E0EDE0] placeholder-[#8B949E] focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-[#8B949E] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#001117] border border-gray-700 rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#E0EDE0] placeholder-[#8B949E] focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E0EDE0] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F2FE] text-[#001117] font-semibold py-2.5 rounded-lg hover:bg-[#00c8d4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="text-xs text-[#8B949E] text-center mt-6">
          ¿Olvidaste tu contraseña?{" "}
          <span className="text-[#00F2FE] cursor-pointer hover:underline">
            Recuperar acceso
          </span>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-[#8B949E] hover:text-[#E0EDE0] transition-colors"
      >
        ← Volver al dashboard
      </Link>
    </div>
  )
}
