'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { useFinancesStore } from '@/features/finances/store/financesStore'
import { EditableTable, ColumnConfig } from '@/features/finances/components/EditableTable'
import {
  fetchGastosAnuales,
  createGastoAnual,
  updateGastoAnual,
  deleteGastoAnual,
} from '@/features/finances/services/transactions'
import {
  GastoAnual,
  GastoAnualInput,
  CUENTAS,
} from '@/features/finances/types'
import { useCategories } from '@/features/admin/hooks/useCategories'

// Meses del año
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function AnnualPage() {
  const {
    gastosAnuales,
    isLoading,
    setGastosAnuales,
    addGastoAnual,
    updateGastoAnual: updateStore,
    removeGastoAnual,
    setLoading,
    setError,
  } = useFinancesStore()

  // Cargar categorías dinámicas del usuario
  const { expenseCategories, isLoading: categoriesLoading } = useCategories()

  // Columnas dinámicas (se regeneran cuando cambian las categorías)
  const columns: ColumnConfig<GastoAnual>[] = useMemo(() => [
    {
      key: 'activo',
      header: '',
      type: 'toggle',
      width: 'w-12',
    },
    {
      key: 'nombre_servicio',
      header: 'Nombre',
      type: 'text',
    },
    {
      key: 'categoria',
      header: 'Categoria',
      type: 'select',
      options: expenseCategories.map(c => ({ value: c.name, label: c.name })),
    },
    {
      key: 'cuenta',
      header: 'Cuenta',
      type: 'select',
      options: CUENTAS.map(c => ({ value: c, label: c })),
    },
    {
      key: 'mes_de_cobro',
      header: 'Mes',
      type: 'select',
      options: MESES.map((m, i) => ({ value: String(i + 1), label: m })),
      render: (value) => MESES[Number(value) - 1] || String(value),
    },
    {
      key: 'dia_de_cobro',
      header: 'Dia',
      type: 'select',
      options: Array.from({ length: 31 }, (_, i) => ({
        value: String(i + 1),
        label: String(i + 1),
      })),
      width: 'w-20',
    },
    {
      key: 'monto',
      header: 'Monto',
      type: 'number',
    },
  ], [expenseCategories])

  // Valores por defecto dinámicos
  const defaultValues: Omit<GastoAnual, 'id' | 'created_at'> = useMemo(() => ({
    nombre_servicio: '',
    categoria: expenseCategories[0]?.name || 'Otros',
    cuenta: 'Lavandería',
    mes_de_cobro: 1,
    dia_de_cobro: 1,
    monto: 0,
    activo: true,
  }), [expenseCategories])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchGastosAnuales()
      setGastosAnuales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [setGastosAnuales, setLoading, setError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = async (input: Omit<GastoAnual, 'id' | 'created_at'>) => {
    const newItem = await createGastoAnual(input as GastoAnualInput)
    addGastoAnual(newItem)
  }

  const handleUpdate = async (id: string, updates: Partial<GastoAnual>) => {
    const updated = await updateGastoAnual(id, updates)
    updateStore(id, updated)
  }

  const handleDelete = async (id: string) => {
    await deleteGastoAnual(id)
    removeGastoAnual(id)
  }

  return (
    <div className="min-h-screen bg-neu-bg p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/finances">
            <NeuButton variant="icon" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </NeuButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gastos Anuales</h1>
            <p className="text-gray-500">Dominios, hosting y pagos anuales</p>
          </div>
        </div>

        {/* Tabla Editable */}
        <EditableTable
          title="Gastos Anuales"
          subtitle="Click en cualquier celda para editar"
          items={gastosAnuales}
          columns={columns}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isLoading={isLoading || categoriesLoading}
          defaultValues={defaultValues}
          getTotal={(items) => items.filter(i => i.activo).reduce((sum, i) => sum + i.monto, 0)}
          totalLabel="Total anual activo"
        />
      </div>
    </div>
  )
}
