#!/usr/bin/env node

/**
 * Script para activar Advanced Analytics en Videndum
 * Uso: node activate-videndum-analytics.js
 */

require('dotenv').config({ path: './business-os/.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function activateVidendumAnalytics() {
  try {
    console.log('🔍 Buscando tenant de Videndum...');

    // Buscar tenant Videndum
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .ilike('name', '%videndum%')
      .limit(1);

    if (tenantError) {
      console.error('❌ Error buscando tenant:', tenantError);
      return;
    }

    if (!tenants || tenants.length === 0) {
      console.error('❌ No se encontró tenant Videndum');
      console.log('Intenta crear un tenant manualmente en Supabase o verifica el nombre');
      return;
    }

    const tenantId = tenants[0].id;
    console.log(`✅ Tenant encontrado: ${tenants[0].name} (${tenantId})`);

    // Buscar un usuario admin de ese tenant
    console.log('🔍 Buscando usuario admin...');

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('tenant_id', tenantId)
      .eq('role', 'admin')
      .limit(1);

    if (userError) {
      console.error('❌ Error buscando usuario:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No se encontró usuario admin en Videndum');
      console.log('Crea un usuario primero');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Usuario encontrado: ${users[0].email} (${userId})`);

    // Verificar si ya existe suscripción
    console.log('🔍 Verificando suscripción existente...');

    const { data: existing } = await supabase
      .from('advanced_analytics_subscriptions')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .single();

    if (existing) {
      console.log(`⚠️  Suscripción ya existe (status: ${existing.status})`);
      console.log('Actualizando a active...');

      const { error: updateError } = await supabase
        .from('advanced_analytics_subscriptions')
        .update({ status: 'active' })
        .eq('tenant_id', tenantId);

      if (updateError) {
        console.error('❌ Error actualizando:', updateError);
        return;
      }

      console.log('✅ Suscripción actualizada a active');
      return;
    }

    // Crear nueva suscripción
    console.log('📝 Creando nueva suscripción...');

    const { data: subscription, error: insertError } = await supabase
      .from('advanced_analytics_subscriptions')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        status: 'active',
        plan: 'pro',
        power_bi_report_ids: [],
      })
      .select();

    if (insertError) {
      console.error('❌ Error creando suscripción:', insertError);
      return;
    }

    console.log('✅ Suscripción creada exitosamente!');
    console.log('\n📊 Detalles:');
    console.log(`  Tenant: Videndum (${tenantId})`);
    console.log(`  Plan: Pro`);
    console.log(`  Status: Active`);
    console.log(`  Subscription ID: ${subscription[0].id}`);
    console.log('\n🚀 Accede a: http://localhost:3000/videndum/advanced-insights');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

activateVidendumAnalytics();
