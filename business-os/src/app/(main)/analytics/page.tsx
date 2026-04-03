'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  ShoppingBag,
  Briefcase,
  Hospital,
  Target,
  DollarSign,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Colores de marca StratosCore
const COLORS = {
  purple: '#8C27F1',
  orange: '#f69f02',
  green: '#2ECC71',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  red: '#ef4444',
};

const CHART_COLORS = [COLORS.purple, COLORS.cyan, COLORS.orange, COLORS.green, COLORS.blue];

interface AnalyticsData {
  users: {
    total: number;
    new_7d: number;
    new_30d: number;
    roles: Array<{ role: string; count: number }>;
  };
  videndum: {
    total_revenue: number;
    total_oi: number;
    pipeline: number;
    book_to_bill: number;
  };
  mobility: {
    total_pacientes: number;
    total_citas: number;
    total_leads: number;
    ocupacion: number;
  };
  mission_control: {
    total_clients: number;
    active_clients: number;
    total_tasks: number;
    total_alerts: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Error fetching analytics');
      const analytics = await response.json();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Error: {error || 'No hay datos disponibles'}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Análisis completo de datos de StratosCore HQ
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Usuarios Totales */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Usuarios Totales</p>
                <p className="text-3xl font-bold text-white">{data.users.total}</p>
                <p className="text-green-400 text-sm mt-1">
                  +{data.users.new_30d} últimos 30 días
                </p>
              </div>
              <Users className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          {/* Revenue Videndum */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Revenue Videndum</p>
                <p className="text-3xl font-bold text-white">
                  ${data.videndum.total_revenue.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Book-to-Bill: {data.videndum.book_to_bill.toFixed(2)}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          {/* Pacientes Mobility */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pacientes Mobility</p>
                <p className="text-3xl font-bold text-white">{data.mobility.total_pacientes}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Ocupación: {data.mobility.ocupacion.toFixed(1)}%
                </p>
              </div>
              <Hospital className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          {/* Pipeline Videndum */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pipeline Videndum</p>
                <p className="text-3xl font-bold text-white">
                  ${data.videndum.pipeline.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm mt-1">Opportunities</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Mission Control */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Clientes Activos</p>
                <p className="text-3xl font-bold text-white">
                  {data.mission_control.active_clients}/{data.mission_control.total_clients}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {data.mission_control.total_tasks} tareas, {data.mission_control.total_alerts} alertas
                </p>
              </div>
              <Target className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de Roles */}
          {data.users.roles.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Distribución de Usuarios por Rol
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.users.roles}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.role}: ${entry.count}`}
                  >
                    {data.users.roles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Métricas de Videndum */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Videndum - Revenue vs Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Revenue', value: data.videndum.total_revenue },
                  { name: 'Order Intake', value: data.videndum.total_oi },
                  { name: 'Pipeline', value: data.videndum.pipeline },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill={COLORS.purple} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas de Mobility */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Mobility - Funnel de Conversión
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Leads', value: data.mobility.total_leads },
                  { name: 'Pacientes', value: data.mobility.total_pacientes },
                  { name: 'Citas', value: data.mobility.total_citas },
                ]}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill={COLORS.cyan} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4">💡 Insights Clave</h3>
          <div className="space-y-3">
            {data.users.new_30d > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">{data.users.new_30d} nuevos usuarios</span> en los últimos 30 días
                  ({((data.users.new_30d / data.users.total) * 100).toFixed(1)}% del total)
                </p>
              </div>
            )}
            {data.videndum.book_to_bill < 1 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Videndum:</span> Book-to-Bill ratio de{' '}
                  {data.videndum.book_to_bill.toFixed(2)} - requiere atención (debería ser &gt; 1)
                </p>
              </div>
            )}
            {data.mobility.ocupacion < 50 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Mobility:</span> Ocupación del{' '}
                  {data.mobility.ocupacion.toFixed(1)}% - gran oportunidad de crecimiento (objetivo: 80%)
                </p>
              </div>
            )}
            {data.mission_control.total_alerts > 5 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Mission Control:</span>{' '}
                  {data.mission_control.total_alerts} alertas pendientes - revisar prioridades
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
