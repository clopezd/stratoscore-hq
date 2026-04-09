// ============================================================
// SyncService — Sincroniza webhooks Huli → medcare_leads
// Eventos: APPOINTMENT_CREATED, APPOINTMENT_UPDATED,
//          APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { HuliWebhookPayload } from '../lib/huli-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

function getServiceClient(): AnySupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export interface SyncResult {
  success: boolean
  action: string
  leadId?: string
  error?: string
}

export async function processHuliWebhook(payload: HuliWebhookPayload): Promise<SyncResult> {
  const supabase = getServiceClient()
  const { event, data } = payload
  const eventId = String(data.id_event)

  // 1. Loguear el webhook
  await supabase.from('medcare_huli_webhook_log').insert({
    event_type: event,
    huli_appointment_id: eventId,
    payload: payload as unknown as Record<string, unknown>,
    processed: false,
  })

  // 2. Buscar lead asociado por huli_appointment_id
  const { data: lead } = await supabase
    .from('medcare_leads')
    .select('id, estado')
    .eq('huli_appointment_id', eventId)
    .single()

  if (!lead) {
    await markWebhookProcessed(supabase, eventId, 'no_matching_lead')
    return { success: true, action: 'no_matching_lead' }
  }

  // 3. Procesar según tipo de evento
  let result: SyncResult

  switch (event) {
    case 'APPOINTMENT_CREATED':
      result = await handleCreated(supabase, lead.id, data)
      break
    case 'APPOINTMENT_UPDATED':
      result = await handleUpdated(supabase, lead.id, data)
      break
    case 'APPOINTMENT_CANCELLED':
      result = await handleCancelled(supabase, lead.id)
      break
    case 'APPOINTMENT_RESCHEDULED':
      result = await handleRescheduled(supabase, lead.id, data)
      break
    default:
      result = { success: true, action: 'ignored_event', leadId: lead.id }
  }

  await markWebhookProcessed(supabase, eventId, result.action)
  return result
}

// ── Handlers ────────────────────────────────────────────────

async function handleCreated(
  supabase: AnySupabaseClient,
  leadId: string,
  data: HuliWebhookPayload['data']
): Promise<SyncResult> {
  const { error } = await supabase
    .from('medcare_leads')
    .update({
      estado: 'cita_agendada',
      huli_appointment_status: data.status || 'BOOKED',
      fecha_cita: data.appointment_time,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  if (error) return { success: false, action: 'appointment_created', leadId, error: error.message }
  return { success: true, action: 'appointment_created', leadId }
}

async function handleUpdated(
  supabase: AnySupabaseClient,
  leadId: string,
  data: HuliWebhookPayload['data']
): Promise<SyncResult> {
  const updates: Record<string, unknown> = {
    huli_appointment_status: data.status,
    updated_at: new Date().toISOString(),
  }

  if (data.appointment_time) updates.fecha_cita = data.appointment_time

  // Mapear status de Huli → estado de lead
  if (data.status === 'COMPLETED') {
    updates.estado = 'completado'
  } else if (data.status === 'NOSHOW') {
    updates.estado = 'no_show'
  }

  const { error } = await supabase
    .from('medcare_leads')
    .update(updates)
    .eq('id', leadId)

  if (error) return { success: false, action: 'appointment_updated', leadId, error: error.message }
  return { success: true, action: 'appointment_updated', leadId }
}

async function handleCancelled(
  supabase: AnySupabaseClient,
  leadId: string
): Promise<SyncResult> {
  const { error } = await supabase
    .from('medcare_leads')
    .update({
      estado: 'contactado', // Re-engagement, no descartar
      huli_appointment_status: 'CANCELLED',
      notas: 'Cita cancelada en Huli',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  if (error) return { success: false, action: 'appointment_cancelled', leadId, error: error.message }
  return { success: true, action: 'appointment_cancelled', leadId }
}

async function handleRescheduled(
  supabase: AnySupabaseClient,
  leadId: string,
  data: HuliWebhookPayload['data']
): Promise<SyncResult> {
  const { error } = await supabase
    .from('medcare_leads')
    .update({
      huli_appointment_status: 'RESCHEDULED',
      fecha_cita: data.appointment_time,
      notas: 'Cita reagendada en Huli',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  if (error) return { success: false, action: 'appointment_rescheduled', leadId, error: error.message }
  return { success: true, action: 'appointment_rescheduled', leadId }
}

// ── Helpers ─────────────────────────────────────────────────

async function markWebhookProcessed(
  supabase: AnySupabaseClient,
  eventId: string,
  action: string
) {
  await supabase
    .from('medcare_huli_webhook_log')
    .update({ processed: true, error: action === 'no_matching_lead' ? action : null })
    .eq('huli_appointment_id', eventId)
    .eq('processed', false)
}
