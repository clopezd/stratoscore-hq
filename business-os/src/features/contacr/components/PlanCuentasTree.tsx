'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronDown, Search } from 'lucide-react'
import { useContaCRStore } from '../store'
import type { Cuenta, CuentaTipo } from '../types'

const TIPO_COLORS: Record<CuentaTipo, string> = {
  activo: 'bg-blue-500/15 text-blue-400',
  pasivo: 'bg-orange-500/15 text-orange-400',
  patrimonio: 'bg-purple-500/15 text-purple-400',
  ingreso: 'bg-emerald-500/15 text-emerald-400',
  gasto: 'bg-red-500/15 text-red-400',
  costo: 'bg-amber-500/15 text-amber-400',
}

interface TreeNode {
  cuenta: Cuenta
  children: TreeNode[]
}

export function PlanCuentasTree() {
  const { empresaActiva } = useContaCRStore()
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!empresaActiva) return
    setLoading(true)
    fetch(`/api/contacr/cuentas?empresa_id=${empresaActiva.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCuentas(data)
        // Expandir niveles 1 y 2 por defecto
        const defaultExpanded = new Set<string>()
        for (const c of data) {
          if (c.nivel <= 2) defaultExpanded.add(c.id)
        }
        setExpanded(defaultExpanded)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaActiva])

  const tree = useMemo(() => buildTree(cuentas), [cuentas])

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree
    const lower = search.toLowerCase()
    return tree.filter((node) => filterNode(node, lower))
  }, [tree, search])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(cuentas.map((c) => c.id)))
  const collapseAll = () => setExpanded(new Set())

  if (!empresaActiva) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white/30 text-sm">
        Selecciona una empresa
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Plan de Cuentas</h2>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1">
            Expandir todo
          </button>
          <button onClick={collapseAll} className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1">
            Colapsar
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código o nombre..."
          className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-white/[0.04] animate-pulse rounded" />
          ))}
        </div>
      ) : cuentas.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          Sin plan de cuentas. Crea una empresa nueva para cargar el catálogo estándar.
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px] px-4 py-2 border-b border-white/[0.06] text-[10px] text-white/30 uppercase tracking-wider">
            <span>Cuenta</span>
            <span>Tipo</span>
            <span className="text-right">Nivel</span>
          </div>
          {filteredTree.map((node) => (
            <TreeRow key={node.cuenta.id} node={node} expanded={expanded} toggle={toggle} depth={0} search={search} />
          ))}
        </div>
      )}
    </div>
  )
}

function TreeRow({ node, expanded, toggle, depth, search }: {
  node: TreeNode
  expanded: Set<string>
  toggle: (id: string) => void
  depth: number
  search: string
}) {
  const { cuenta } = node
  const isExpanded = expanded.has(cuenta.id)
  const hasChildren = node.children.length > 0
  const showChildren = isExpanded || search.trim().length > 0

  return (
    <>
      <div
        className="grid grid-cols-[1fr_100px_80px] px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-default"
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button onClick={() => toggle(cuenta.id)} className="text-white/30 hover:text-white/60 p-0.5">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-xs font-mono text-white/40 shrink-0">{cuenta.codigo}</span>
          <span className={`text-xs truncate ${cuenta.nivel <= 2 ? 'text-white/80 font-medium' : 'text-white/60'}`}>
            {cuenta.nombre}
          </span>
        </div>
        <div>
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${TIPO_COLORS[cuenta.tipo]}`}>
            {cuenta.tipo}
          </span>
        </div>
        <div className="text-right text-xs text-white/30">{cuenta.nivel}</div>
      </div>
      {showChildren && node.children.map((child) => (
        <TreeRow key={child.cuenta.id} node={child} expanded={expanded} toggle={toggle} depth={depth + 1} search={search} />
      ))}
    </>
  )
}

function buildTree(cuentas: Cuenta[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const c of cuentas) {
    map.set(c.id, { cuenta: c, children: [] })
  }

  for (const c of cuentas) {
    const node = map.get(c.id)!
    if (c.padre_id && map.has(c.padre_id)) {
      map.get(c.padre_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function filterNode(node: TreeNode, search: string): boolean {
  const match =
    node.cuenta.codigo.toLowerCase().includes(search) ||
    node.cuenta.nombre.toLowerCase().includes(search)
  if (match) return true
  return node.children.some((child) => filterNode(child, search))
}
