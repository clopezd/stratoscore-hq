import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // ============================================================================
    // 1. USUARIOS
    // ============================================================================
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, created_at');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const totalUsers = profiles?.length || 0;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsers7d = profiles?.filter(
      (p) => new Date(p.created_at) >= sevenDaysAgo
    ).length || 0;

    const newUsers30d = profiles?.filter(
      (p) => new Date(p.created_at) >= thirtyDaysAgo
    ).length || 0;

    // Distribución de roles
    const rolesMap = new Map<string, number>();
    profiles?.forEach((p) => {
      const role = p.role || 'sin_rol';
      rolesMap.set(role, (rolesMap.get(role) || 0) + 1);
    });

    const roleDistribution = Array.from(rolesMap.entries()).map(([role, count]) => ({
      role,
      count,
    }));

    // ============================================================================
    // 2. VIDENDUM (Sales Intelligence)
    // ============================================================================
    const { data: videnDumRecords } = await supabase
      .from('videndum_records')
      .select('metric_type, quantity')
      .eq('metric_type', 'revenue');

    const { data: orderIntake } = await supabase
      .from('order_intake')
      .select('quantity');

    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('quantity, probability_pct');

    const videnDumRevenue = videnDumRecords?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
    const totalOI = orderIntake?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
    const totalPipeline = opportunities?.reduce((sum, o) => sum + (o.quantity || 0), 0) || 0;
    const bookToBill = videnDumRevenue > 0 ? totalOI / videnDumRevenue : 0;

    // ============================================================================
    // 4. MOBILITY (Rehabilitación)
    // ============================================================================
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, estado, created_at');

    const { data: citas } = await supabase
      .from('citas')
      .select('id, estado, fecha_hora');

    const { data: leadsMobility } = await supabase
      .from('leads_mobility')
      .select('id, estado, fuente, created_at');

    const totalPacientes = pacientes?.length || 0;
    const totalCitas = citas?.length || 0;
    const totalLeads = leadsMobility?.length || 0;

    // Calcular ocupación aproximada
    const citasRecientes = citas?.filter((c) => {
      const citaDate = new Date(c.fecha_hora);
      return citaDate >= thirtyDaysAgo && ['confirmada', 'completada', 'en_curso'].includes(c.estado);
    }) || [];

    const sesiones30d = citasRecientes.length;
    const capacidadTotal = 30 * 30; // 30 días * 30 slots/día (3 equipos * 10 slots)
    const ocupacion = (sesiones30d / capacidadTotal) * 100;

    // ============================================================================
    // 5. MISSION CONTROL
    // ============================================================================
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, status, alerts_count, tasks_count');

    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter((c) => c.status === 'active').length || 0;
    const totalTasks = clients?.reduce((sum, c) => sum + (c.tasks_count || 0), 0) || 0;
    const totalAlerts = clients?.reduce((sum, c) => sum + (c.alerts_count || 0), 0) || 0;

    // ============================================================================
    // RESPUESTA CONSOLIDADA
    // ============================================================================
    return NextResponse.json({
      users: {
        total: totalUsers,
        new_7d: newUsers7d,
        new_30d: newUsers30d,
        roles: roleDistribution,
      },
      videndum: {
        total_revenue: videnDumRevenue,
        total_oi: totalOI,
        pipeline: totalPipeline,
        book_to_bill: bookToBill,
      },
      mobility: {
        total_pacientes: totalPacientes,
        total_citas: totalCitas,
        total_leads: totalLeads,
        ocupacion,
      },
      mission_control: {
        total_clients: totalClients,
        active_clients: activeClients,
        total_tasks: totalTasks,
        total_alerts: totalAlerts,
      },
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Error fetching analytics data' },
      { status: 500 }
    );
  }
}
