'use client'

import { useState } from 'react'
import { projectsData, categoryLabels, contactInfo, type Project } from '../data/projects'

export function TicoPortfolio() {
  const [filter, setFilter] = useState<string>('todos')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    servicio: '',
    mensaje: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const filteredProjects = filter === 'todos'
    ? projectsData
    : projectsData.filter(p => p.category === filter)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/tico-restoration/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSubmitted(true)
        setFormData({ nombre: '', email: '', telefono: '', servicio: '', mensaje: '' })
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevLightbox = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filteredProjects.length) % filteredProjects.length)
  }
  const nextLightbox = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filteredProjects.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        :root {
          --tico-primary: #003366;
          --tico-accent: #FF6B35;
          --tico-light: #E8F4F8;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#" className="text-xl font-bold" style={{ color: '#003366' }}>
            TICO RESTORATION
          </a>
          <div className="hidden md:flex gap-6">
            <a href="#portfolio" className="hover:text-orange-500 transition-colors">Portfolio</a>
            <a href="#servicios" className="hover:text-orange-500 transition-colors">Servicios</a>
            <a href="#contacto" className="hover:text-orange-500 transition-colors">Contacto</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="text-white py-24 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001f4d 100%)' }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Transformamos Espacios
        </h1>
        <p className="text-xl mb-8 opacity-95">
          Pintura, restauración y renovación comercial en Florida
        </p>
        <a
          href="#contacto"
          className="inline-block px-8 py-4 rounded font-semibold uppercase tracking-wide transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{ background: '#FF6B35', color: 'white' }}
        >
          Solicitar Presupuesto
        </a>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#003366', fontFamily: 'Playfair Display, serif' }}>
          Nuestros Proyectos
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 rounded border-2 font-medium transition-all ${
                filter === key
                  ? 'text-white border-transparent'
                  : 'border-gray-200 bg-white hover:border-orange-500'
              }`}
              style={filter === key ? { background: '#003366', borderColor: '#003366' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => openLightbox(index)}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
            >
              <div className="h-64 bg-gray-200 relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/400x300/003366/FFFFFF?text=${encodeURIComponent(project.title)}`
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2" style={{ color: '#003366' }}>
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <span
                  className="inline-block px-3 py-1 text-xs rounded-full"
                  style={{ background: '#E8F4F8', color: '#003366' }}
                >
                  {categoryLabels[project.category]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 px-4" style={{ background: '#E8F4F8' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#003366', fontFamily: 'Playfair Display, serif' }}>
            Nuestros Servicios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎨', title: 'Pintura Profesional', desc: 'Interior y exterior de alta calidad para proyectos comerciales y residenciales.' },
              { icon: '🔨', title: 'Restauración', desc: 'Servicios completos de restauración y remodelación de condominios y multi-familia.' },
              { icon: '💧', title: 'Waterproofing', desc: 'Impermeabilización profesional y sellado para máxima durabilidad.' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-lg text-center shadow-md">
                <div className="text-5xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#003366' }}>{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#003366', fontFamily: 'Playfair Display, serif' }}>
            Solicitar Presupuesto
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#003366' }}>¡Gracias!</h3>
                  <p className="text-gray-600">Responderemos en 24 horas.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre *"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono *"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500"
                  />
                  <select
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Tipo de servicio</option>
                    <option value="pintura">Pintura</option>
                    <option value="restauracion">Restauración</option>
                    <option value="waterproofing">Waterproofing</option>
                    <option value="otro">Otro</option>
                  </select>
                  <textarea
                    placeholder="Descripción del proyecto..."
                    rows={4}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded font-semibold uppercase tracking-wide text-white transition-all disabled:opacity-50"
                    style={{ background: '#FF6B35' }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Consulta'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3" style={{ color: '#003366' }}>📞 Teléfono</h3>
                <p className="text-lg">{contactInfo.phone}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3" style={{ color: '#003366' }}>📧 Email</h3>
                <p>{contactInfo.email}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3" style={{ color: '#003366' }}>📍 Ubicación</h3>
                <p className="text-sm">{contactInfo.address}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3" style={{ color: '#003366' }}>⏰ Horario</h3>
                <p className="text-sm">{contactInfo.hours.weekdays}</p>
                <p className="text-sm">{contactInfo.hours.saturday}</p>
                <p className="text-sm text-gray-500">{contactInfo.hours.sunday}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-white" style={{ background: '#003366' }}>
        <p>TICO RESTORATION LLC — Restauración Profesional en Florida</p>
        <p className="text-sm mt-2 opacity-75">© {new Date().getFullYear()} Todos los derechos reservados</p>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox() }}
            className="absolute top-4 right-4 text-white text-4xl hover:text-orange-500"
          >
            ×
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevLightbox() }}
            className="absolute left-4 text-white text-4xl bg-black/50 px-4 py-2 rounded hover:bg-black/80"
          >
            ❮
          </button>
          <img
            src={filteredProjects[lightboxIndex].image}
            alt={filteredProjects[lightboxIndex].title}
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/800x600/003366/FFFFFF?text=${encodeURIComponent(filteredProjects[lightboxIndex].title)}`
            }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextLightbox() }}
            className="absolute right-4 text-white text-4xl bg-black/50 px-4 py-2 rounded hover:bg-black/80"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  )
}
