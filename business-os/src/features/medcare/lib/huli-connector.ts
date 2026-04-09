// ============================================================
// HuliConnector — Funciones de negocio para HuliPractice API v2
// Paths reales: /practice/v2/...
// ============================================================

import { HuliClient } from './huli-client'
import type {
  HuliAppointment,
  HuliAppointmentCreate,
  HuliAppointmentList,
  HuliAppointmentStatus,
  HuliAppointmentUpdate,
  HuliAvailabilityResponse,
  HuliBookingTagList,
  HuliConfig,
  HuliDoctor,
  HuliDoctorClinicInfo,
  HuliOrganization,
  HuliPatientFile,
  HuliPatientFileCreate,
  HuliPatientFileList,
  HuliRescheduleRequest,
} from './huli-types'

let _instance: HuliConnector | null = null

export class HuliConnector {
  private client: HuliClient
  private config: HuliConfig

  constructor(config: HuliConfig) {
    this.config = config
    this.client = new HuliClient(config)
  }

  // ── Singleton ─────────────────────────────────────────────

  static getInstance(): HuliConnector {
    if (!_instance) {
      const config = getHuliConfigFromEnv()
      _instance = new HuliConnector(config)
    }
    return _instance
  }

  static resetInstance(): void {
    _instance = null
  }

  // ── Organization ──────────────────────────────────────────

  async getOrganization(expand?: 'AUTHORIZATION'): Promise<HuliOrganization> {
    const params: Record<string, string> = {}
    if (expand) params.expand = expand
    return this.client.get<HuliOrganization>('/practice/v2/organization', params)
  }

  // ── Patient Files ─────────────────────────────────────────

  async searchPatients(query: string, limit = 20, offset = 0): Promise<HuliPatientFileList> {
    return this.client.get<HuliPatientFileList>('/practice/v2/patient-file', {
      query,
      limit: String(limit),
      offset: String(offset),
    })
  }

  async getPatientFile(patientFileId: string): Promise<HuliPatientFile> {
    return this.client.get<HuliPatientFile>(`/practice/v2/patient-file/${patientFileId}`)
  }

  async createPatientFile(data: HuliPatientFileCreate): Promise<HuliPatientFile> {
    return this.client.post<HuliPatientFile>('/practice/v2/patient-file', data)
  }

  /**
   * Busca paciente por teléfono o nombre. Si no existe, lo crea.
   */
  async findOrCreatePatient(
    nombre: string,
    telefono: string,
    email?: string
  ): Promise<HuliPatientFile> {
    // Buscar por teléfono
    try {
      const byPhone = await this.searchPatients(telefono, 5)
      if (byPhone.patientFiles && byPhone.patientFiles.length > 0) {
        return byPhone.patientFiles[0]
      }
    } catch { /* no match, continue */ }

    // Buscar por nombre
    try {
      const byName = await this.searchPatients(nombre, 5)
      if (byName.patientFiles && byName.patientFiles.length > 0) {
        return byName.patientFiles[0]
      }
    } catch { /* no match, continue */ }

    // Crear nuevo
    const [firstName, ...lastParts] = nombre.split(' ')
    const lastName = lastParts.join(' ') || firstName

    return this.createPatientFile({
      personalData: {
        firstName,
        lastName,
      },
      contact: {
        email,
        sendNotifications: true,
        phones: [{ type: 'MOBILE', number: telefono }],
        idProvince: 733,
        country: 'CR',
      },
    })
  }

  // ── Availability ──────────────────────────────────────────

  /**
   * Obtener slots disponibles para un doctor en una clínica.
   * @param doctorId - ID del doctor en Huli
   * @param clinicId - ID de la clínica en Huli
   * @param from - Fecha inicio ISO 8601 (e.g. 2025-07-01T00:00:00Z)
   * @param to - Fecha fin ISO 8601 (e.g. 2025-07-06T23:59:59Z)
   */
  async getAvailability(
    doctorId: string,
    clinicId: string,
    from: string,
    to: string
  ): Promise<HuliAvailabilityResponse> {
    return this.client.get<HuliAvailabilityResponse>(
      `/practice/v2/availability/doctor/${doctorId}/clinic/${clinicId}`,
      { from, to }
    )
  }

  // ── Appointments ──────────────────────────────────────────

  async createAppointment(data: HuliAppointmentCreate): Promise<HuliAppointment> {
    return this.client.post<HuliAppointment>('/practice/v2/appointment', data)
  }

  async getAppointment(eventId: string): Promise<HuliAppointment> {
    return this.client.get<HuliAppointment>(`/practice/v2/appointment/${eventId}`)
  }

  async updateAppointment(eventId: string, data: HuliAppointmentUpdate): Promise<HuliAppointment> {
    return this.client.put<HuliAppointment>(`/practice/v2/appointment/${eventId}`, data)
  }

  async cancelAppointment(eventId: string, byPatient: boolean): Promise<HuliAppointment> {
    return this.client.put<HuliAppointment>(
      `/practice/v2/appointment/${eventId}/cancel`,
      { is_status_modified_by_patient: byPatient }
    )
  }

  async confirmAppointment(eventId: string): Promise<HuliAppointment> {
    return this.client.put<HuliAppointment>(
      `/practice/v2/appointment/${eventId}/patient-confirm`
    )
  }

  async rescheduleAppointment(eventId: string, data: HuliRescheduleRequest): Promise<HuliAppointment> {
    return this.client.put<HuliAppointment>(
      `/practice/v2/appointment/${eventId}/reschedule`,
      data
    )
  }

  async markNoShow(eventId: string): Promise<HuliAppointment> {
    return this.client.put<HuliAppointment>(
      `/practice/v2/appointment/${eventId}/no-show`
    )
  }

  async listDoctorAppointments(
    doctorId: string,
    from: string,
    to: string,
    options?: {
      idClinic?: string
      status?: HuliAppointmentStatus
      limit?: number
      offset?: number
    }
  ): Promise<HuliAppointmentList> {
    const params: Record<string, string> = { from, to }
    if (options?.idClinic) params.idClinic = options.idClinic
    if (options?.status) params.status_appointment = options.status
    if (options?.limit) params.limit = String(options.limit)
    if (options?.offset) params.offset = String(options.offset)

    return this.client.get<HuliAppointmentList>(
      `/practice/v2/appointment/doctor/${doctorId}`,
      params
    )
  }

  async listPatientAppointments(
    patientFileId: string,
    options?: {
      from?: string
      to?: string
      status?: HuliAppointmentStatus
      limit?: number
      offset?: number
    }
  ): Promise<HuliAppointmentList> {
    const params: Record<string, string> = {}
    if (options?.from) params.from = options.from
    if (options?.to) params.to = options.to
    if (options?.status) params.status_appointment = options.status
    if (options?.limit) params.limit = String(options.limit)
    if (options?.offset) params.offset = String(options.offset)

    return this.client.get<HuliAppointmentList>(
      `/practice/v2/appointment/patient/${patientFileId}`,
      params
    )
  }

  async listBookingTags(limit?: number, offset?: number): Promise<HuliBookingTagList> {
    const params: Record<string, string> = {}
    if (limit) params.limit = String(limit)
    if (offset) params.offset = String(offset)
    return this.client.get<HuliBookingTagList>('/practice/v2/appointment/tags', params)
  }

  // ── Doctors ───────────────────────────────────────────────

  async getDoctor(doctorId: string): Promise<HuliDoctor> {
    return this.client.get<HuliDoctor>(`/practice/v2/doctor/${doctorId}`)
  }

  async getDoctorByUserId(userId: string): Promise<HuliDoctor> {
    return this.client.get<HuliDoctor>(`/practice/v2/doctor/user/${userId}`)
  }

  async getDoctorClinicInfo(doctorId: string, clinicId: string): Promise<HuliDoctorClinicInfo> {
    return this.client.get<HuliDoctorClinicInfo>(
      `/practice/v2/doctor/${doctorId}/clinic/${clinicId}`
    )
  }

  // ── Helpers de negocio MedCare ────────────────────────────

  /**
   * Flujo completo: buscar/crear paciente + buscar slot + crear cita.
   * Retorna la cita creada en Huli.
   */
  async agendarEstudio(params: {
    nombre: string
    telefono: string
    email?: string
    doctorId: number
    clinicId: number
    fecha: string           // YYYY-MM-DD
    hora: string            // HH:MM:SS
    notas?: string
    sourceEvent?: number    // ID del slot de disponibilidad
    isFirstTime?: boolean
    insuranceName?: string
    insuranceNumber?: string
  }): Promise<{ patient: HuliPatientFile; appointment: HuliAppointment }> {
    // 1. Buscar o crear paciente
    const patient = await this.findOrCreatePatient(
      params.nombre,
      params.telefono,
      params.email
    )

    // 2. Crear cita
    const appointmentData: HuliAppointmentCreate = {
      id_doctor: params.doctorId,
      id_clinic: params.clinicId,
      id_patient_file: Number(patient.id),
      start_date: params.fecha,
      time_from: params.hora,
      notes: params.notas,
      is_first_time_patient: params.isFirstTime ?? true,
      insurance_name: params.insuranceName,
      insurance_number: params.insuranceNumber,
    }

    // Si tenemos el slot de disponibilidad, usarlo (recomendado por Huli)
    if (params.sourceEvent) {
      appointmentData.source_event = params.sourceEvent
    }

    const appointment = await this.createAppointment(appointmentData)

    return { patient, appointment }
  }
}

// ── Config Helper ───────────────────────────────────────────

function getHuliConfigFromEnv(): HuliConfig {
  const apiKey = process.env.HULI_API_KEY
  if (!apiKey) {
    throw new Error(
      'HULI_API_KEY no configurada. ' +
      'Solicitar API Key al owner de la organización en Huli vía soporte@hulipractice.com'
    )
  }

  const idOrganization = process.env.HULI_ORGANIZATION_ID
  if (!idOrganization) {
    throw new Error(
      'HULI_ORGANIZATION_ID no configurada. ' +
      'Se proporciona junto con el API Key.'
    )
  }

  return {
    apiKey,
    apiUrl: process.env.HULI_API_URL || 'https://api.huli.io',
    idOrganization: Number(idOrganization),
    webhookSecret: process.env.HULI_WEBHOOK_SECRET,
  }
}
