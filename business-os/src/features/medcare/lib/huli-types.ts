// ============================================================
// Tipos — HuliPractice API v2
// Fuente: https://api.huli.io/docs/ (spec 2.0.0)
// Auth: API Key → JWT token
// Base: /practice/v2/
// ============================================================

// ── Auth ──────────────────────────────────────────────────────

export interface HuliAuthResponse {
  response: 'OK'
  data: {
    jwt: string
  }
}

// ── Config ────────────────────────────────────────────────────

export interface HuliConfig {
  apiKey: string
  apiUrl: string            // https://api.huli.io
  idOrganization: number
  webhookSecret?: string
}

// ── Organization ──────────────────────────────────────────────

export interface HuliOrganization {
  idOrganization: string
  idOwner: string
  name: string
  status: string
  authorization?: HuliAuthorization[]
}

export interface HuliAuthorization {
  idGrantor?: string
  [key: string]: unknown
}

// ── Patient File ──────────────────────────────────────────────

export interface HuliPatientFile {
  id: string
  status: string
  idUserModifiedBy: string
  idUser: string
  idPatient: string
  patient: {
    id: string
    status: string
    source: string
    createdOn: string
    modifiedOn: string
  }
  personalData: HuliPersonalData
  contact: HuliContact
  insurance: HuliInsurance
  emergencyContact: HuliEmergencyContact
  isFromCitizenRegister: boolean
  isDemoPatient: boolean
}

export interface HuliPersonalData {
  id: string
  status: string
  firstName: string
  lastName: string
  knownAs?: string
  birthdate?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  bloodType?: string
  maritalStatus?: string
  occupation?: string
  pob?: string
  patientIds?: HuliPatientId[]
  modifiedOn?: string
}

export interface HuliPatientId {
  type?: string
  value?: string
}

export interface HuliContact {
  id: string
  status: string
  email?: string
  address?: string
  sendNotifications?: boolean
  phones?: HuliPhone[]
}

export interface HuliPhone {
  type?: string
  number?: string
}

export interface HuliInsurance {
  id: string
  status: string
  notes?: string
  affiliations?: HuliAffiliation[]
}

export interface HuliAffiliation {
  [key: string]: unknown
}

export interface HuliEmergencyContact {
  id: string
  status: string
  people?: unknown[]
}

export interface HuliPatientFileCreate {
  personalData: {
    firstName: string
    lastName: string
    knownAs?: string
    birthdate?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    bloodType?: string
    maritalStatus?: string
    occupation?: string
    pob?: string
    patientIds?: { type: string; value: string }[]
  }
  contact?: {
    email?: string
    address?: string
    sendNotifications?: boolean
    phones?: { type: string; number: string }[]
    idProvince?: number
    country?: string
  }
  insurance?: {
    notes?: string
    affiliations?: unknown[]
  }
  emergencyContact?: {
    notes?: string
    people?: unknown[]
  }
}

export interface HuliPatientFileList {
  patientFiles: HuliPatientFile[]
  total: number
  size: number
}

// ── Availability ──────────────────────────────────────────────

export interface HuliAvailabilityResponse {
  idCalendar: string
  idClinic: string
  idDoctor: string
  slotDates: HuliSlotDate[]
}

export interface HuliSlotDate {
  date?: string
  dateL10n?: string          // e.g. "jue 09, abr"
  dateL10nComp?: string      // e.g. "jueves 9 de abril"
  slots?: HuliSlot[]
}

export interface HuliSlot {
  dateTime?: string           // ISO 8601
  sourceEvent?: string
  time?: string               // e.g. "20260409T0800"
  timeL10n?: string           // e.g. "08:00 am"
  [key: string]: unknown
}

// ── Appointment ───────────────────────────────────────────────

export type HuliAppointmentStatus = 'BOOKED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW'

export interface HuliAppointment {
  idEvent: string
  idDoctor: string
  idClinic: string
  idPatientFile?: string
  idCalendar: string
  idUserModifiedBy: string
  idUserCreatedBy: string
  isConfirmedByProvider: boolean
  isConfirmedByPatient: boolean
  isFirstTimePatient: boolean
  isStatusModifiedByPatient: boolean
  isDeletedForDoctor: boolean
  statusAppointment: HuliAppointmentStatus
  statusAvailability: string
  startDate: string          // YYYY-MM-DD
  timeFrom: string           // HH:MM:SS
  endDate: string            // YYYY-MM-DD
  timeTo: string             // HH:MM:SS
  createdOn: string
  notes?: string
  color?: string
  insuranceName?: string
  insuranceNumber?: string
}

export interface HuliAppointmentCreate {
  id_doctor: number
  id_clinic: number
  id_patient_file?: number
  source_event?: number       // Availability slot ID (recommended)
  start_date: string          // YYYY-MM-DD
  time_from: string           // HH:MM:SS
  end_date?: string           // YYYY-MM-DD (auto if source_event)
  time_to?: string            // HH:MM:SS (auto if source_event)
  notes?: string
  color?: string              // Hex 6 chars sin #
  id_treatment?: number
  insurance_name?: string
  insurance_number?: string
  is_first_time_patient?: boolean
  id_tags?: number[]
}

export interface HuliAppointmentUpdate {
  notes?: string
  color?: string
  id_treatment?: number
  insurance_name?: string
  insurance_number?: string
  is_first_time_patient?: boolean
  is_deleted_for_doctor?: boolean
  id_tags?: number[]
}

export interface HuliRescheduleRequest {
  isStatusModifiedByPatient: boolean
  startDate: string           // YYYY-MM-DD
  timeFrom: string            // HH:MM:SS
  endDate?: string
  timeTo?: string
  sourceEvent?: string
}

export interface HuliAppointmentList {
  appointments: HuliAppointment[]
  total: string
  size: string
}

export interface HuliBookingTag {
  id?: number
  name?: string
  [key: string]: unknown
}

export interface HuliBookingTagList {
  tags: HuliBookingTag[]
  total: string
  size: string
}

// ── Doctor ────────────────────────────────────────────────────

export interface HuliDoctor {
  id: string
  photo?: string
  url?: string
  status: string
  idUser: string
  user: {
    id: string
    email: string
    displayName: string
    firstName: string
    lastName: string
    gender?: string
    phoneNumber?: number
    status: string
  }
  specialty?: HuliSpecialty[]
  doctorClinic?: HuliDoctorClinic[]
  professionalLicense?: unknown[]
}

export interface HuliSpecialty {
  id?: string
  name?: string
  [key: string]: unknown
}

export interface HuliDoctorClinic {
  id?: string
  idClinic?: string
  [key: string]: unknown
}

export interface HuliDoctorClinicInfo {
  id: string
  building?: string
  floor?: string
  office?: string
  phone?: { [key: string]: unknown }[]
  email?: string[]
  idClinic: string
  clinic: {
    id: string
    name: string
    latitude?: number
    longitude?: number
    address?: string
    phoneNumber?: string
    email?: string
    status: string
    type: string
    cityName?: string
  }
  status: string
  idPaymentMethods?: string[]
  insurances?: unknown[]
}

// ── Webhooks ──────────────────────────────────────────────────

export type HuliWebhookEventType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_UPDATED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'CHECKUP_CREATED'
  | 'CHECKUP_UPDATED'

export interface HuliWebhookPayload {
  id: number
  event: HuliWebhookEventType
  timestamp: string
  data: {
    id_event: number
    id_appointment?: number
    patient?: {
      id?: string
      name?: string
      [key: string]: unknown
    }
    doctor?: {
      id?: string
      name?: string
      [key: string]: unknown
    }
    appointment_time?: string
    checkup_date?: string
    status?: string
    type?: string
  }
}

// ── API Response wrapper ──────────────────────────────────────

export interface HuliApiError {
  status: number
  message: string
  code?: string
}
