import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";

// ============ COLORES Y ESTILOS ============
const COLORS = {
  primary: "#0f172a",
  accent: "#3b82f6",
  accentLight: "#60a5fa",
  success: "#22c55e",
  warning: "#f59e0b",
  white: "#ffffff",
  gray: "#94a3b8",
  grayDark: "#334155",
  grayLight: "#f1f5f9",
  gradient1: "#0f172a",
  gradient2: "#1e293b",
};

// ============ ESCENA 1: INTRO ============
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleY = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 200 },
  });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [15, 45], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradient1} 0%, ${COLORS.gradient2} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Circles decorativos */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid rgba(59,130,246,0.1)`,
          top: -100,
          right: -100,
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `1px solid rgba(59,130,246,0.08)`,
          bottom: -50,
          left: -50,
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Logo icon */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 30,
          width: 100,
          height: 100,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 20px 60px rgba(59,130,246,0.3)",
        }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Título */}
      <div
        style={{
          transform: `translateY(${interpolate(titleY, [0, 1], [30, 0])}px)`,
          opacity: titleY,
          fontSize: 72,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: -2,
        }}
      >
        StratosCore
      </div>

      {/* Línea decorativa */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          marginTop: 16,
          marginBottom: 16,
        }}
      />

      {/* Subtítulo */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 32,
          color: COLORS.gray,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Módulo de Logística
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 22,
          color: COLORS.accentLight,
          fontFamily: "monospace",
          marginTop: 20,
          padding: "8px 24px",
          borderRadius: 8,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        lavanderia.stratoscore.app/logistica
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 2: DASHBOARD OVERVIEW ============
const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSlide = spring({ frame, fps, config: { damping: 200 } });

  const stats = [
    { label: "Pedidos Hoy", value: "47", icon: "📦", color: COLORS.accent },
    { label: "En Ruta", value: "12", icon: "🚚", color: COLORS.warning },
    { label: "Entregados", value: "31", icon: "✅", color: COLORS.success },
    { label: "Pendientes", value: "4", icon: "⏳", color: "#ef4444" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.grayLight,
        padding: 60,
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40,
          opacity: headerSlide,
          transform: `translateY(${interpolate(headerSlide, [0, 1], [-20, 0])}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.primary,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Panel de Logística
            </div>
            <div
              style={{
                fontSize: 16,
                color: COLORS.gray,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              lavanderia.stratoscore.app
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 16,
            color: COLORS.gray,
            fontFamily: "system-ui, sans-serif",
            background: COLORS.white,
            padding: "8px 20px",
            borderRadius: 8,
          }}
        >
          Marzo 31, 2026
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
        {stats.map((stat, i) => {
          const cardSpring = spring({
            frame,
            fps,
            delay: 8 + i * 6,
            config: { damping: 14 },
          });
          const countUp = Math.round(
            interpolate(frame, [12 + i * 6, 35 + i * 6], [0, parseInt(stat.value)], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          );

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: COLORS.white,
                borderRadius: 16,
                padding: 28,
                transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                borderTop: `3px solid ${stat.color}`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: COLORS.primary,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {countUp}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: COLORS.gray,
                  fontFamily: "system-ui, sans-serif",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map placeholder + sidebar */}
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        <div
          style={{
            flex: 2,
            background: COLORS.white,
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            opacity: spring({ frame, fps, delay: 30, config: { damping: 200 } }),
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: COLORS.primary,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 20,
            }}
          >
            Mapa de Rutas en Tiempo Real
          </div>
          <div
            style={{
              width: "100%",
              height: "85%",
              borderRadius: 12,
              background: `linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`h-${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${(i + 1) * 12}%`,
                  height: 1,
                  background: "rgba(59,130,246,0.1)",
                }}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`v-${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${(i + 1) * 8}%`,
                  width: 1,
                  background: "rgba(59,130,246,0.1)",
                }}
              />
            ))}
            {/* Route dots */}
            {[
              { x: 30, y: 25 },
              { x: 45, y: 40 },
              { x: 60, y: 35 },
              { x: 70, y: 55 },
              { x: 50, y: 65 },
            ].map((pos, i) => {
              const dotSpring = spring({
                frame,
                fps,
                delay: 40 + i * 5,
                config: { damping: 10 },
              });
              const pulseOpacity = interpolate(
                (frame + i * 10) % 30,
                [0, 15, 30],
                [0.3, 0.8, 0.3]
              );
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      position: "absolute",
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(59,130,246,0.2)",
                      transform: `scale(${dotSpring * 2})`,
                      opacity: pulseOpacity,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: i < 3 ? COLORS.accent : COLORS.warning,
                      transform: `scale(${dotSpring}) translate(-50%, -50%)`,
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div
          style={{
            flex: 1,
            background: COLORS.white,
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            opacity: spring({ frame, fps, delay: 35, config: { damping: 200 } }),
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: COLORS.primary,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 20,
            }}
          >
            Pedidos Recientes
          </div>
          {[
            { id: "#1247", status: "En ruta", color: COLORS.warning },
            { id: "#1246", status: "Entregado", color: COLORS.success },
            { id: "#1245", status: "Recogido", color: COLORS.accent },
            { id: "#1244", status: "Entregado", color: COLORS.success },
            { id: "#1243", status: "En ruta", color: COLORS.warning },
          ].map((order, i) => {
            const rowOpacity = interpolate(frame, [40 + i * 4, 48 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < 4 ? `1px solid ${COLORS.grayLight}` : "none",
                  opacity: rowOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.primary,
                    fontFamily: "monospace",
                  }}
                >
                  {order.id}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: order.color,
                    background: `${order.color}18`,
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {order.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 3: FEATURES ============
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    {
      icon: "🗺️",
      title: "Rutas Inteligentes",
      desc: "Optimización automática de rutas de recolección y entrega",
    },
    {
      icon: "📱",
      title: "Tracking en Vivo",
      desc: "Seguimiento GPS en tiempo real de cada pedido",
    },
    {
      icon: "📊",
      title: "Analytics",
      desc: "Métricas de rendimiento, tiempos y costos operativos",
    },
    {
      icon: "🔔",
      title: "Notificaciones",
      desc: "Alertas automáticas al cliente en cada etapa",
    },
    {
      icon: "📋",
      title: "Gestión de Pedidos",
      desc: "Control completo del ciclo: recogida → lavado → entrega",
    },
    {
      icon: "⚡",
      title: "Automatización",
      desc: "Asignación inteligente de conductores y horarios",
    },
  ];

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradient1} 0%, ${COLORS.gradient2} 100%)`,
        padding: 80,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          marginBottom: 12,
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        Funcionalidades Clave
      </div>
      <div
        style={{
          width: 80,
          height: 4,
          background: COLORS.accent,
          borderRadius: 2,
          marginBottom: 50,
          transform: `scaleX(${titleSpring})`,
          transformOrigin: "left",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
        }}
      >
        {features.map((feat, i) => {
          const cardSpring = spring({
            frame,
            fps,
            delay: 10 + i * 6,
            config: { damping: 14 },
          });
          return (
            <div
              key={i}
              style={{
                width: "calc(33.33% - 19px)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: 32,
                transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{feat.icon}</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.white,
                  fontFamily: "system-ui, sans-serif",
                  marginBottom: 8,
                }}
              >
                {feat.title}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: COLORS.gray,
                  fontFamily: "system-ui, sans-serif",
                  lineHeight: 1.5,
                }}
              >
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 4: FLUJO DE TRABAJO ============
const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { icon: "📞", label: "Cliente solicita", sub: "App / WhatsApp / Web" },
    { icon: "🧺", label: "Recolección", sub: "Conductor asignado" },
    { icon: "👕", label: "Lavado & Proceso", sub: "Tracking en planta" },
    { icon: "🚚", label: "Entrega", sub: "Ruta optimizada" },
    { icon: "✅", label: "Confirmación", sub: "Notificación al cliente" },
  ];

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.grayLight,
        padding: 80,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: COLORS.primary,
          fontFamily: "system-ui, sans-serif",
          marginBottom: 60,
          opacity: titleSpring,
        }}
      >
        Flujo de Trabajo
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {steps.map((step, i) => {
          const stepSpring = spring({
            frame,
            fps,
            delay: 10 + i * 10,
            config: { damping: 14 },
          });
          const arrowOpacity = interpolate(
            frame,
            [18 + i * 10, 25 + i * 10],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: `scale(${stepSpring})`,
                  opacity: stepSpring,
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: COLORS.white,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 42,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    border: `3px solid ${COLORS.accent}`,
                    marginBottom: 16,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: COLORS.primary,
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: COLORS.gray,
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {step.sub}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 80,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: arrowOpacity,
                    marginBottom: 40,
                  }}
                >
                  <svg width="40" height="20" viewBox="0 0 40 20">
                    <path
                      d="M0 10 L30 10 M25 4 L32 10 L25 16"
                      stroke={COLORS.accent}
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 5: OUTRO / CTA ============
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12 } });
  const textSpring = spring({ frame, fps, delay: 10, config: { damping: 200 } });
  const urlSpring = spring({ frame, fps, delay: 20, config: { damping: 200 } });
  const badgeSpring = spring({ frame, fps, delay: 30, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradient1} 0%, ${COLORS.gradient2} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          transform: `scale(${logoSpring * 1.5})`,
        }}
      />

      <div
        style={{
          transform: `scale(${logoSpring})`,
          marginBottom: 30,
          width: 120,
          height: 120,
          borderRadius: 28,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 20px 60px rgba(59,130,246,0.4)",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: textSpring,
          transform: `translateY(${interpolate(textSpring, [0, 1], [20, 0])}px)`,
          letterSpacing: -1,
        }}
      >
        Logística Inteligente
      </div>

      <div
        style={{
          fontSize: 24,
          color: COLORS.gray,
          fontFamily: "system-ui, sans-serif",
          marginTop: 12,
          opacity: textSpring,
        }}
      >
        Automatiza tu operación de lavandería
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: urlSpring,
          fontSize: 22,
          color: COLORS.accentLight,
          fontFamily: "monospace",
          padding: "12px 32px",
          borderRadius: 12,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.3)",
        }}
      >
        lavanderia.stratoscore.app/logistica
      </div>

      <div
        style={{
          marginTop: 24,
          transform: `scale(${badgeSpring})`,
          fontSize: 16,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
          padding: "10px 28px",
          borderRadius: 30,
          fontWeight: 600,
        }}
      >
        Powered by StratosCore
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 6: INVENTARIO ============
const InventarioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  const items = [
    { name: "Detergente Industrial", stock: 85, unit: "L", status: "ok" },
    { name: "Suavizante Premium", stock: 42, unit: "L", status: "ok" },
    { name: "Bolsas de Entrega", stock: 156, unit: "uds", status: "ok" },
    { name: "Perchas Lavandería", stock: 18, unit: "uds", status: "low" },
    { name: "Etiquetas RFID", stock: 230, unit: "uds", status: "ok" },
    { name: "Quitamanchas Pro", stock: 7, unit: "L", status: "critical" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.grayLight,
        padding: 60,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 40,
          opacity: titleSpring,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.success}, #4ade80)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          📦
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: COLORS.primary,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Control de Inventario
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        {[
          { label: "Total Productos", value: "124", icon: "📋", color: COLORS.accent },
          { label: "Stock Óptimo", value: "98", icon: "✅", color: COLORS.success },
          { label: "Stock Bajo", value: "18", icon: "⚠️", color: COLORS.warning },
          { label: "Crítico", value: "8", icon: "🔴", color: "#ef4444" },
        ].map((s, i) => {
          const cardSpring = spring({ frame, fps, delay: 5 + i * 5, config: { damping: 14 } });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: COLORS.white,
                borderRadius: 14,
                padding: 22,
                transform: `scale(${cardSpring})`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary, fontFamily: "system-ui, sans-serif" }}>
                {Math.round(interpolate(frame, [8 + i * 5, 30 + i * 5], [0, parseInt(s.value)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}
              </div>
              <div style={{ fontSize: 14, color: COLORS.gray, fontFamily: "system-ui, sans-serif" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Inventory table */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: 28,
          flex: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          opacity: spring({ frame, fps, delay: 25, config: { damping: 200 } }),
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.primary, fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>
          Inventario de Insumos
        </div>
        {/* Header */}
        <div style={{ display: "flex", padding: "10px 0", borderBottom: `2px solid ${COLORS.grayLight}`, marginBottom: 8 }}>
          <div style={{ flex: 3, fontSize: 14, fontWeight: 600, color: COLORS.gray, fontFamily: "system-ui, sans-serif" }}>PRODUCTO</div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: COLORS.gray, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>STOCK</div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: COLORS.gray, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>ESTADO</div>
          <div style={{ flex: 2, fontSize: 14, fontWeight: 600, color: COLORS.gray, fontFamily: "system-ui, sans-serif" }}>NIVEL</div>
        </div>
        {items.map((item, i) => {
          const rowOpacity = interpolate(frame, [30 + i * 4, 38 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barWidth = interpolate(frame, [32 + i * 4, 45 + i * 4], [0, item.stock], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barColor = item.status === "critical" ? "#ef4444" : item.status === "low" ? COLORS.warning : COLORS.success;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: i < items.length - 1 ? `1px solid ${COLORS.grayLight}` : "none", opacity: rowOpacity }}>
              <div style={{ flex: 3, fontSize: 16, fontWeight: 500, color: COLORS.primary, fontFamily: "system-ui, sans-serif" }}>{item.name}</div>
              <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: COLORS.primary, fontFamily: "monospace", textAlign: "center" }}>{item.stock} {item.unit}</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: barColor, background: `${barColor}18`, padding: "3px 10px", borderRadius: 12, fontFamily: "system-ui, sans-serif" }}>
                  {item.status === "critical" ? "Crítico" : item.status === "low" ? "Bajo" : "Óptimo"}
                </span>
              </div>
              <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: COLORS.grayLight, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(barWidth, 100)}%`, height: "100%", borderRadius: 4, background: barColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============ ESCENA 7: MÉTRICAS ============
const MetricsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  const metrics = [
    { label: "Tiempo Promedio de Entrega", value: "2.4h", change: "-12%", positive: true },
    { label: "Satisfacción del Cliente", value: "4.8/5", change: "+0.3", positive: true },
    { label: "Costo por Entrega", value: "$3.200", change: "-8%", positive: true },
    { label: "Pedidos por Conductor", value: "18/día", change: "+15%", positive: true },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.gradient1} 0%, ${COLORS.gradient2} 100%)`,
        padding: 80,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          marginBottom: 12,
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        Métricas de Rendimiento
      </div>
      <div
        style={{
          width: 80,
          height: 4,
          background: COLORS.accent,
          borderRadius: 2,
          marginBottom: 50,
          transform: `scaleX(${titleSpring})`,
          transformOrigin: "left",
        }}
      />

      <div style={{ display: "flex", gap: 28 }}>
        {metrics.map((m, i) => {
          const cardSpring = spring({ frame, fps, delay: 8 + i * 8, config: { damping: 14 } });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: 36,
                transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 16, color: COLORS.gray, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>{m.label}</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.white, fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>{m.value}</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: m.positive ? COLORS.success : "#ef4444",
                  fontFamily: "system-ui, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {m.positive ? "↑" : "↓"} {m.change}
                <span style={{ fontSize: 13, color: COLORS.gray, fontWeight: 400 }}>vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============ VOICEOVER AUDIO FILES ============
const VOICEOVER_FILES = [
  "voiceover/scene-01-intro.mp3",
  "voiceover/scene-02-dashboard.mp3",
  "voiceover/scene-03-features.mp3",
  "voiceover/scene-04-workflow.mp3",
  "voiceover/scene-05-inventario.mp3",
  "voiceover/scene-06-metrics.mp3",
  "voiceover/scene-07-outro.mp3",
];

// Helper: renders Audio only if voiceover file exists
const SceneAudio: React.FC<{ file: string }> = ({ file }) => {
  try {
    return (
      <Audio
        src={staticFile(file)}
        volume={(f) =>
          interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" })
        }
      />
    );
  } catch {
    return null;
  }
};

// ============ COMPOSICIÓN PRINCIPAL — 30s ============
export const LogisticaDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Escena 1: Intro - 4s */}
      <Sequence from={0} durationInFrames={4 * fps} premountFor={fps}>
        <IntroScene />
        <SceneAudio file={VOICEOVER_FILES[0]} />
      </Sequence>

      {/* Escena 2: Dashboard - 5s */}
      <Sequence from={4 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <DashboardScene />
        <SceneAudio file={VOICEOVER_FILES[1]} />
      </Sequence>

      {/* Escena 3: Features - 5s */}
      <Sequence from={9 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <FeaturesScene />
        <SceneAudio file={VOICEOVER_FILES[2]} />
      </Sequence>

      {/* Escena 4: Workflow - 5s */}
      <Sequence from={14 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <WorkflowScene />
        <SceneAudio file={VOICEOVER_FILES[3]} />
      </Sequence>

      {/* Escena 5: Inventario - 5s */}
      <Sequence from={19 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <InventarioScene />
        <SceneAudio file={VOICEOVER_FILES[4]} />
      </Sequence>

      {/* Escena 6: Métricas - 3s */}
      <Sequence from={24 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <MetricsScene />
        <SceneAudio file={VOICEOVER_FILES[5]} />
      </Sequence>

      {/* Escena 7: Outro - 3s */}
      <Sequence from={27 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <OutroScene />
        <SceneAudio file={VOICEOVER_FILES[6]} />
      </Sequence>
    </AbsoluteFill>
  );
};
