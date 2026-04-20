// Datos mock para preview del Dashboard Ejecutivo de RH
// Reemplazar con fuente real cuando se definan conexiones

export const hrMockData = {
  rotacion: {
    acumuladaAnio: 12.4,
    delMes: 1.8,
    porTipo: {
      despidos: 8,
      renuncias: 14,
      finContrato: 5,
      otros: 2,
    },
    porGenero: { masculino: 17, femenino: 12 },
    encuestasSalida: { tasa: 82, respondidas: 24, enviadas: 29 },
  },
  posiciones: {
    activas: 247,
    ocupadas: 231,
    vacantes: 16,
    ocupacion: 93.5,
    porGenero: { masculino: 142, femenino: 89 },
  },
  hrsExtras: {
    acumuladoAnio: { horas: 4820, gasto: 48200000 },
    delMes: { horas: 420, gasto: 4200000 },
    porVP: [
      { vp: 'Operaciones', horas: 1840 },
      { vp: 'Comercial', horas: 1120 },
      { vp: 'Logística', horas: 960 },
      { vp: 'Admin', horas: 520 },
      { vp: 'TI', horas: 380 },
    ],
    topPuestos: [
      { puesto: 'Analista Ops.', horas: 540 },
      { puesto: 'Coordinador Log.', horas: 480 },
      { puesto: 'Supervisor Com.', horas: 410 },
    ],
    porTipo: { operativas: 68, administrativas: 22, otras: 10 },
  },
  ausentismo: {
    personas: { anio: 145, mes: 23 },
    gestiones: { anio: 312, mes: 45 },
    dias: { anio: 892, mes: 134 },
    porVP: [
      { vp: 'Operaciones', pct: 42 },
      { vp: 'Logística', pct: 24 },
      { vp: 'Comercial', pct: 18 },
      { vp: 'Admin', pct: 10 },
      { vp: 'TI', pct: 6 },
    ],
    porTipo: { enfermedad: 56, personal: 24, licencia: 12, otros: 8 },
  },
  atraccion: {
    contratacionesAnio: 54,
    porTipo: { concursoInterno: 30, promocion: 25, externo: 45 },
    requerimientosEnProceso: 12,
    vacantesSinReq: 4,
    ocupacionReq: 92,
  },
} as const

export type HRData = typeof hrMockData
