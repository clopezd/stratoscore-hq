'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  Shirt,
  User,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Check,
  X,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
} from 'lucide-react'

interface ProfileData {
  name: string
  phone: string
  email: string
  address: string
}

// Datos de ejemplo — reemplazar con datos reales del usuario autenticado
const INITIAL_PROFILE: ProfileData = {
  name: 'Carlos Mario',
  phone: '+57 300 123 4567',
  email: 'carlos@ejemplo.com',
  address: 'Calle 123 # 45-67, Apto 201, Medellín',
}

function EditableField({
  label,
  value,
  icon: Icon,
  type = 'text',
  onSave,
}: {
  label: string
  value: string
  icon: React.ElementType
  type?: string
  onSave: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  function handleCancel() {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
        {editing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
              className="flex-1 text-sm border-b border-blue-400 outline-none py-0.5 bg-transparent"
            />
            <button
              type="button"
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm text-gray-900">{value}</span>
            <button
              type="button"
              onClick={() => {
                setDraft(value)
                setEditing(true)
              }}
              className="p-1 text-gray-400 hover:text-blue-500"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE)

  function updateField(field: keyof ProfileData) {
    return (value: string) => {
      setProfile(prev => ({ ...prev, [field]: value }))
      // TODO: persistir cambio en la API
    }
  }

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-600">Lavandería</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3 shadow-md">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500">Cliente desde marzo 2026</p>
        </div>

        {/* Personal data */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Datos personales
          </h3>
          <div className="space-y-2">
            <EditableField
              label="Nombre completo"
              value={profile.name}
              icon={User}
              onSave={updateField('name')}
            />
            <EditableField
              label="Teléfono"
              value={profile.phone}
              icon={Phone}
              type="tel"
              onSave={updateField('phone')}
            />
            <EditableField
              label="Correo electrónico"
              value={profile.email}
              icon={Mail}
              type="email"
              onSave={updateField('email')}
            />
          </div>
        </section>

        {/* Default address */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Dirección predeterminada
          </h3>
          <EditableField
            label="Dirección de recogida"
            value={profile.address}
            icon={MapPin}
            onSave={updateField('address')}
          />
        </section>

        {/* Other options */}
        <section className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Configuración
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-4 h-4 text-blue-500" />
              <span className="flex-1 text-sm text-gray-900">Notificaciones</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="flex-1 text-sm text-gray-900">Privacidad y seguridad</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </section>

        {/* Logout */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </main>
    </div>
  )
}
