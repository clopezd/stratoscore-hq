'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { useFinancesStore } from '@/features/finances/store/financesStore'
import { EditableTable, ColumnConfig } from '@/features/finances/components/EditableTable'
import {
  fetchGastosMensuales,
  createGastoMensual,
  updateGastoMensual,
  deleteGastoMensual,
} from '@/features/finances/services/transactions'
import {
  GastoMensual,
  GastoMensualInput,
  CUENTAS,
} from '@/features/finances/types'
import { useCategories } from '@/features/admin/hooks/useCategories'

export default function RecurringPage() {
  const {
    gastosMensuales,
    isLoading,
    setGastosMensuales,
    addGastoMensual,
    updateGastoMensual: updateStore,
    removeGastoMensual,
    setLoading,
    setError,
  } = useFinancesStore()

  // Cargar categorías dinámicas del usuario
  const { expenseCategories, isLoading: categoriesLoading } = useCategories()

  // Columnas dinámicas (se regeneran cuando cambian las categorías)
  const columns: ColumnConfig<GastoMensual>[] = useMemo(() => [
    {
      key: 'activo',
      header: '',
      type: 'toggle',
      width: 'w-12',
    },
    {
      key: 'nombre_app',
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
  const defaultValues: Omit<GastoMensual, 'id' | 'created_at'> = useMemo(() => ({
    nombre_app: '',
    categoria: expenseCategories[0]?.name || 'Otros',
    cuenta: 'Lavandería',
    dia_de_cobro: 1,
    monto: 0,
    activo: true,
  }), [expenseCategories])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchGastosMensuales()
      setGastosMensuales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [setGastosMensuales, setLoading, setError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = async (input: Omit<GastoMensual, 'id' | 'created_at'>) => {
    const newItem = await createGastoMensual(input as GastoMensualInput)
    addGastoMensual(newItem)
  }

  const handleUpdate = async (id: string, updates: Partial<GastoMensual>) => {
    const updated = await updateGastoMensual(id, updates)
    updateStore(id, updated)
  }

  const handleDelete = async (id: string) => {
    await deleteGastoMensual(id)
    removeGastoMensual(id)
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
            <h1 className="text-2xl font-bold text-gray-800">Gastos Mensuales</h1>
            <p className="text-gray-500">Suscripciones y pagos recurrentes</p>
          </div>
        </div>

        {/* Tabla Editable */}
        <EditableTable
          title="Gastos Mensuales"
          subtitle="Click en cualquier celda para editar"
          items={gastosMensuales}
          columns={columns}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isLoading={isLoading || categoriesLoading}
          defaultValues={defaultValues}
          getTotal={(items) => items.filter(i => i.activo).reduce((sum, i) => sum + i.monto, 0)}
          totalLabel="Total activo"
        />
      </div>
    </div>
  )
}
