'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Clock, CreditCard, Plus, X, Edit2, Trash2, Settings, List, BarChart3, Tags } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Transaccion {
  id: string
  tipo: string
  monto: number
  categoria: string | null
  descripcion: string | null
  fecha_hora: string
  cuenta: string | null
  estado: string | null
  moneda: string
  tasa_cambio: number
}

interface Categoria {
  id: string
  nombre: string
  tipo: string
  icono: string
  color: string
  activo: boolean
}

interface FinanceSummary {
  month: string
  income: number
  expenses: number
  net_balance: number
  pending_amount: number
  active_recurring_monthly: number
  recent_transactions: Transaccion[]
  generated_at: string
}

type Tab = 'dashboard' | 'transactions' | 'categories' | 'config'

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [allTransactions, setAllTransactions] = useState<Transaccion[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaccion | null>(null)
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null)

  const [transactionForm, setTransactionForm] = useState({
    tipo: 'gasto',
    monto: '',
    categoria: '',
    descripcion: '',
    cuenta: 'Bancolombia',
    estado: 'pagado',
    moneda: 'USD'
  })

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    tipo: 'gasto',
    icono: '💰',
    color: '#3b82f6'
  })

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/finance/summary')
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body}`)
      }
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      console.error('fetchSummary error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const fetchAllTransactions = async () => {
    try {
      const res = await fetch('/api/finance/transactions')
      if (!res.ok) return
      const data = await res.json()
      setAllTransactions(data as Transaccion[])
    } catch (err) {
      console.warn('transactions fetch error:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/finance/categories')
      if (!res.ok) return
      const data = await res.json()
      setCategories(data as Categoria[])
    } catch (err) {
      console.warn('categories fetch error:', err)
    }
  }

  useEffect(() => {
    Promise.all([fetchSummary(), fetchAllTransactions(), fetchCategories()])
      .finally(() => setLoading(false))
  }, [])

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const data = {
      tipo: transactionForm.tipo,
      monto: parseFloat(transactionForm.monto),
      categoria: transactionForm.categoria || null,
      descripcion: transactionForm.descripcion || null,
      cuenta: transactionForm.cuenta,
      estado: transactionForm.estado,
      moneda: transactionForm.moneda,
      tasa_cambio: 1.0,
      fecha_hora: editingTransaction?.fecha_hora || new Date().toISOString()
    }

    if (editingTransaction) {
      await supabase.from('transacciones').update(data).eq('id', editingTransaction.id)
    } else {
      await supabase.from('transacciones').insert([data])
    }

    setShowTransactionForm(false)
    setEditingTransaction(null)
    setTransactionForm({ tipo: 'gasto', monto: '', categoria: '', descripcion: '', cuenta: 'Bancolombia', estado: 'pagado', moneda: 'USD' })
    fetchSummary()
    fetchAllTransactions()
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('¿Eliminar esta transacción?')) return
    const supabase = createClient()
    await supabase.from('transacciones').delete().eq('id', id)
    fetchSummary()
    fetchAllTransactions()
  }

  const handleEditTransaction = (tx: Transaccion) => {
    setEditingTransaction(tx)
    setTransactionForm({
      tipo: tx.tipo,
      monto: tx.monto.toString(),
      categoria: tx.categoria || '',
      descripcion: tx.descripcion || '',
      cuenta: tx.cuenta || 'Bancolombia',
      estado: tx.estado || 'pagado',
      moneda: tx.moneda || 'USD'
    })
    setShowTransactionForm(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const data = {
      nombre: categoryForm.nombre,
      tipo: categoryForm.tipo,
      icono: categoryForm.icono,
      color: categoryForm.color,
      activo: true
    }

    if (editingCategory) {
      await supabase.from('finance_categories').update(data).eq('id', editingCategory.id)
    } else {
      await supabase.from('finance_categories').insert([data])
    }

    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryForm({ nombre: '', tipo: 'gasto', icono: '💰', color: '#3b82f6' })
    fetchCategories()
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    const supabase = createClient()
    await supabase.from('finance_categories').delete().eq('id', id)
    fetchCategories()
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getStatusBadge = (estado: string | null) => {
    if (estado === 'pendiente') return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pendiente</span>
    if (estado === 'pagado') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Pagado</span>
    return null
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-red-400 font-semibold mb-2">Error al cargar Finance OS</h3>
            <p className="text-red-300/70 text-sm">{error || 'No se pudo obtener el resumen financiero'}</p>
            <p className="text-red-300/50 text-xs mt-2">Verifica que las tablas de Finance OS existan en Supabase</p>
          </div>
        </div>
      </div>
    )
  }

  const ingresoCategories = categories.filter(c => c.tipo === 'ingreso')
  const gastoCategories = categories.filter(c => c.tipo === 'gasto')

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">💰 Finance OS</h1>
            <p className="text-white/50 text-sm">Sistema de gestión financiera — {summary.month}</p>
          </div>
          <button
            onClick={() => { setEditingTransaction(null); setShowTransactionForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Nueva Transacción
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-white/10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'transactions', label: 'Transacciones', icon: List },
            { id: 'categories', label: 'Categorías', icon: Tags },
            { id: 'config', label: 'Configuración', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="text-green-400" size={20} />
                  </div>
                  <span className="text-xs text-green-400/70 font-medium">Este mes</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatMoney(summary.income)}</div>
                <div className="text-xs text-white/40">Ingresos</div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <TrendingDown className="text-red-400" size={20} />
                  </div>
                  <span className="text-xs text-red-400/70 font-medium">Este mes</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatMoney(summary.expenses)}</div>
                <div className="text-xs text-white/40">Gastos</div>
              </div>

              <div className={`bg-gradient-to-br ${summary.net_balance >= 0 ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20' : 'from-orange-500/10 to-orange-600/5 border-orange-500/20'} border rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${summary.net_balance >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'} rounded-lg`}>
                    <DollarSign className={summary.net_balance >= 0 ? 'text-blue-400' : 'text-orange-400'} size={20} />
                  </div>
                  <span className={`text-xs ${summary.net_balance >= 0 ? 'text-blue-400/70' : 'text-orange-400/70'} font-medium`}>
                    {summary.net_balance >= 0 ? 'Superávit' : 'Déficit'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatMoney(summary.net_balance)}</div>
                <div className="text-xs text-white/40">Balance Neto</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <CreditCard className="text-purple-400" size={20} />
                  </div>
                  <span className="text-xs text-purple-400/70 font-medium">Mensual</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatMoney(summary.active_recurring_monthly)}</div>
                <div className="text-xs text-white/40">Suscripciones</div>
              </div>
            </div>

            {summary.pending_amount > 0 && (
              <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
                <Clock className="text-yellow-400" size={20} />
                <div>
                  <div className="text-sm font-medium text-yellow-400">Pagos Pendientes</div>
                  <div className="text-xs text-yellow-400/70">{formatMoney(summary.pending_amount)} por pagar</div>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05]">
                <h2 className="text-lg font-semibold text-white">Transacciones Recientes</h2>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {summary.recent_transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-lg ${tx.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.tipo === 'ingreso' ? '📈' : '📉'}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {tx.descripcion || tx.categoria || 'Sin descripción'}
                            </div>
                            <div className="text-xs text-white/40">
                              {new Date(tx.fecha_hora).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {tx.cuenta && ` • ${tx.cuenta}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {getStatusBadge(tx.estado)}
                        <div className={`text-lg font-semibold ${tx.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.tipo === 'ingreso' ? '+' : '-'}{formatMoney(Math.abs(tx.monto))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.05]">
              <h2 className="text-lg font-semibold text-white">Todas las Transacciones ({allTransactions.length})</h2>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {allTransactions.map(tx => (
                <div key={tx.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-lg ${tx.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.tipo === 'ingreso' ? '📈' : '📉'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {tx.descripcion || tx.categoria || 'Sin descripción'}
                          </div>
                          <div className="text-xs text-white/40">
                            {new Date(tx.fecha_hora).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {tx.cuenta && ` • ${tx.cuenta}`}
                            {tx.categoria && ` • ${tx.categoria}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      {getStatusBadge(tx.estado)}
                      <div className={`text-lg font-semibold ${tx.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}{formatMoney(Math.abs(tx.monto))}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryForm(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                <Plus size={18} />
                Nueva Categoría
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ingresos */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.05] bg-green-500/10">
                  <h3 className="font-semibold text-green-400">Categorías de Ingresos ({ingresoCategories.length})</h3>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {ingresoCategories.map(cat => (
                    <div key={cat.id} className="px-6 py-3 hover:bg-white/[0.02] transition-colors group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icono}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{cat.nombre}</div>
                          <div className="text-xs text-white/40">Color: {cat.color}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gastos */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.05] bg-red-500/10">
                  <h3 className="font-semibold text-red-400">Categorías de Gastos ({gastoCategories.length})</h3>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {gastoCategories.map(cat => (
                    <div key={cat.id} className="px-6 py-3 hover:bg-white/[0.02] transition-colors group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icono}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{cat.nombre}</div>
                          <div className="text-xs text-white/40">Color: {cat.color}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Configuración Global</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Moneda Principal</label>
                <select className="w-full md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="USD">USD — Dólar Estadounidense</option>
                  <option value="COP">COP — Peso Colombiano</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
              <div className="text-xs text-white/40 mt-2">
                Todas las transacciones se almacenan en USD. Puedes ver los montos en otras monedas usando la tasa de cambio.
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-white/30">
          Última actualización: {new Date(summary.generated_at).toLocaleString('es-CO')}
        </div>
      </div>

      {/* Modal Transacción */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1f] border border-white/10 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingTransaction ? 'Editar' : 'Nueva'} Transacción</h3>
              <button onClick={() => { setShowTransactionForm(false); setEditingTransaction(null) }} className="p-2 hover:bg-white/5 rounded-lg">
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setTransactionForm({ ...transactionForm, tipo: 'ingreso' })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${transactionForm.tipo === 'ingreso' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                    📈 Ingreso
                  </button>
                  <button type="button" onClick={() => setTransactionForm({ ...transactionForm, tipo: 'gasto' })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${transactionForm.tipo === 'gasto' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                    📉 Gasto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Monto (USD)</label>
                <input type="number" step="0.01" required value={transactionForm.monto}
                  onChange={(e) => setTransactionForm({ ...transactionForm, monto: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="150.00" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Categoría</label>
                <select value={transactionForm.categoria}
                  onChange={(e) => setTransactionForm({ ...transactionForm, categoria: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="">Seleccionar categoría...</option>
                  {(transactionForm.tipo === 'ingreso' ? ingresoCategories : gastoCategories).map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.icono} {cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Descripción</label>
                <input type="text" value={transactionForm.descripcion}
                  onChange={(e) => setTransactionForm({ ...transactionForm, descripcion: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Ej: Compra en Amazon" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cuenta</label>
                <select value={transactionForm.cuenta}
                  onChange={(e) => setTransactionForm({ ...transactionForm, cuenta: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Wise">Wise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Estado</label>
                <select value={transactionForm.estado}
                  onChange={(e) => setTransactionForm({ ...transactionForm, estado: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowTransactionForm(false); setEditingTransaction(null) }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
                  {editingTransaction ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1f] border border-white/10 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nueva Categoría</h3>
              <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }} className="p-2 hover:bg-white/5 rounded-lg">
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nombre</label>
                <input type="text" required value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Ej: Gimnasio" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setCategoryForm({ ...categoryForm, tipo: 'ingreso' })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${categoryForm.tipo === 'ingreso' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                    Ingreso
                  </button>
                  <button type="button" onClick={() => setCategoryForm({ ...categoryForm, tipo: 'gasto' })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${categoryForm.tipo === 'gasto' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                    Gasto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Icono (emoji)</label>
                <input type="text" required value={categoryForm.icono}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icono: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl focus:outline-none focus:border-blue-500/50"
                  placeholder="💰" maxLength={2} />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Color</label>
                <input type="color" value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer" />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
