import { config } from "dotenv";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY no encontrada en .env");
  process.exit(1);
}

// ─── Buscar voz colombiana de Medellín (paisa) ──────────────────────────────

interface Voice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

async function findMedellinVoice(): Promise<string> {
  if (process.env.ELEVENLABS_VOICE_ID) {
    console.log(`🎤 Usando voz configurada: ${process.env.ELEVENLABS_VOICE_ID}`);
    return process.env.ELEVENLABS_VOICE_ID;
  }

  console.log("🔍 Buscando voz colombiana de Medellín en ElevenLabs...");

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": API_KEY! },
  });

  if (!response.ok) {
    console.log("⚠️  No se pudo listar voces, usando voz por defecto");
    return "IKne3meq5aSn9XLyUdCD";
  }

  const data = (await response.json()) as { voices: Voice[] };
  const voices = data.voices || [];

  // Prioridad 1: Medellín / Paisa
  const paisa = voices.find((v) => {
    const all = (v.name + " " + JSON.stringify(v.labels || {})).toLowerCase();
    return all.includes("medell") || all.includes("paisa");
  });
  if (paisa) {
    console.log(`🇨🇴 Voz paisa encontrada: "${paisa.name}" (${paisa.voice_id})`);
    return paisa.voice_id;
  }

  // Prioridad 2: Colombiana
  const colombian = voices.find((v) => {
    const all = (v.name + " " + JSON.stringify(v.labels || {})).toLowerCase();
    return all.includes("colomb");
  });
  if (colombian) {
    console.log(`🇨🇴 Voz colombiana: "${colombian.name}" (${colombian.voice_id})`);
    return colombian.voice_id;
  }

  // Prioridad 3: Español
  const spanish = voices.find((v) => {
    const all = JSON.stringify(v.labels || {}).toLowerCase();
    return all.includes("spanish") || all.includes("español");
  });
  if (spanish) {
    console.log(`🇪🇸 Voz español: "${spanish.name}" (${spanish.voice_id})`);
    return spanish.voice_id;
  }

  console.log("⚠️  No se encontró voz regional, usando multilingual por defecto");
  return "IKne3meq5aSn9XLyUdCD";
}

// ─── 7 escenas — 30 segundos total ──────────────────────────────────────────

const scenes = [
  {
    id: "scene-01-intro",
    text: "StratosCore. Tu plataforma integral de logística e inventario para lavandería. Control total de recolección, entrega y stock, todo en tiempo real.",
  },
  {
    id: "scene-02-dashboard",
    text: "Tu panel de logística te muestra todo de un vistazo. Cuarenta y siete pedidos hoy, doce unidades en ruta, treinta y uno entregados y cuatro pendientes. Con mapa de rutas en tiempo real y seguimiento de cada orden.",
  },
  {
    id: "scene-03-features",
    text: "Funcionalidades diseñadas para optimizar tu operación. Rutas inteligentes con optimización automática. Tracking en vivo con GPS. Analíticas de rendimiento. Notificaciones automáticas al cliente. Gestión completa de pedidos y asignación inteligente de conductores.",
  },
  {
    id: "scene-04-workflow",
    text: "El flujo es muy sencillo. El cliente solicita por app, WhatsApp o la web. Se asigna un conductor para la recolección. La prenda se procesa en planta con tracking completo. Se entrega por ruta optimizada. Y el cliente recibe confirmación automática en cada paso.",
  },
  {
    id: "scene-05-inventario",
    text: "El módulo de inventario te permite controlar todos los insumos de tu operación. Detergentes, suavizantes, bolsas, perchas y etiquetas. Alertas automáticas cuando el stock está bajo o en nivel crítico, para que nunca te quedes sin lo que necesitas.",
  },
  {
    id: "scene-06-metrics",
    text: "Métricas que importan. Tiempo promedio de entrega de dos punto cuatro horas. Satisfacción del cliente de cuatro punto ocho sobre cinco. Y costo por entrega reducido en un ocho por ciento respecto al mes anterior.",
  },
  {
    id: "scene-07-outro",
    text: "Logística inteligente e inventario automatizado para tu lavandería. Optimiza tu operación con StratosCore. Visita lavandería punto stratoscore punto app.",
  },
];

// ─── Generar audios ──────────────────────────────────────────────────────────

const OUTPUT_DIR = join(process.cwd(), "public", "voiceover");

async function generateVoiceover() {
  // Limpiar audios anteriores para regenerar
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const voiceId = await findMedellinVoice();
  console.log(`\n🎬 Generando voiceover con voz: ${voiceId}\n`);

  for (const scene of scenes) {
    const outputPath = join(OUTPUT_DIR, `${scene.id}.mp3`);

    console.log(`🎙️  Generando: ${scene.id}...`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY!,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: scene.text,
          model_id: "eleven_multilingual_v2",
          language_code: "es-CO",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error en ${scene.id}: ${response.status} - ${error}`);
      process.exit(1);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outputPath, audioBuffer);
    console.log(`✅ ${scene.id} (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n🎬 ¡Voiceover completo! 7 escenas generadas.");
}

generateVoiceover();
