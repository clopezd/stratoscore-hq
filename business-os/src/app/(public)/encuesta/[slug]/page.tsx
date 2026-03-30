'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  type: 'text' | 'single' | 'multiple'
  required: boolean
  question: string
  options?: string[]
}

interface Survey {
  id: string
  title: string
  description: string
  slug: string
  questions: Question[]
}

export default function SurveyPage() {
  const params = useParams()
  const slug = params.slug as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/surveys?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError('Encuesta no encontrada')
        else setSurvey(data)
      })
      .catch(() => setError('Error cargando encuesta'))
      .finally(() => setLoading(false))
  }, [slug])

  const setAnswer = (qId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const toggleMultiple = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || []
    if (current.includes(option)) {
      setAnswer(qId, current.filter(o => o !== option))
    } else {
      setAnswer(qId, [...current, option])
    }
  }

  const submit = async () => {
    if (!survey) return

    // Validate required
    for (const q of survey.questions) {
      if (q.required) {
        const a = answers[q.id]
        if (!a || (Array.isArray(a) && a.length === 0)) {
          setError(`Por favor responde: "${q.question}"`)
          return
        }
      }
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: survey.id,
          answers,
          contact: contact || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Error al enviar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]">
        <p className="text-gray-500 dark:text-white/40">Cargando encuesta...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Gracias!</h1>
          <p className="text-gray-500 dark:text-white/40">Tu respuesta fue registrada. Te contactaremos cuando la herramienta esté lista.</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]">
        <p className="text-red-500">{error || 'Encuesta no encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{survey.title}</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">{survey.description}</p>
          <p className="text-xs text-gray-400 dark:text-white/20 mt-2">⏱ Toma menos de 3 minutos</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {survey.questions.map((q, i) => (
            <div key={q.id} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-5">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                <span className="text-indigo-500 dark:text-indigo-400 mr-2">{i + 1}.</span>
                {q.question}
                {q.required && <span className="text-red-400 ml-1">*</span>}
              </p>

              {q.type === 'text' && (
                <input
                  type="text"
                  value={(answers[q.id] as string) || ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}

              {q.type === 'single' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswer(q.id, opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                        answers[q.id] === opt
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'multiple' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const selected = ((answers[q.id] as string[]) || []).includes(opt)
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleMultiple(q.id, opt)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                          selected
                            ? 'bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {selected ? '✓ ' : ''}{opt}
                      </button>
                    )
                  })}
                  <p className="text-[10px] text-gray-400 dark:text-white/20">Puedes seleccionar varias</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full mt-6 py-3 rounded-xl text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {submitting ? '⏳ Enviando...' : '✅ Enviar respuestas'}
        </button>

        <p className="text-center text-[10px] text-gray-400 dark:text-white/20 mt-4">
          Powered by Stratoscore Business OS
        </p>
      </div>
    </div>
  )
}
