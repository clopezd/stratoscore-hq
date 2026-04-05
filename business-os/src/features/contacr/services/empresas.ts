import type { Empresa, EmpresaInput } from '../types'

export async function fetchEmpresas(): Promise<Empresa[]> {
  const res = await fetch('/api/contacr/empresas')
  if (!res.ok) throw new Error('Error al cargar empresas')
  return res.json()
}

export async function createEmpresa(input: EmpresaInput): Promise<Empresa> {
  const res = await fetch('/api/contacr/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al crear empresa')
  }
  return res.json()
}
