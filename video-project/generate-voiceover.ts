import { config } from "dotenv";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY no encontrada en .env");
  process.exit(1);
}

// ─── Paso 1: Buscar voz colombiana automáticamente ───────────────────────────

interface Voice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

async function findColombianVoice(): Promise<string> {
  // Si el usuario ya definió un voice ID, usarlo
  if (process.env.ELEVENLABS_VOICE_ID) {
    console.log(`🎤 Usando voz configurada: ${process.env.ELEVENLABS_VOICE_ID}`);
    return process.env.ELEVENLABS_VOICE_ID;
  }

  console.log("🔍 Buscando voz colombiana en ElevenLabs...");

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": API_KEY! },
  });

  if (!response.ok) {
    console.log("⚠️  No se pudo listar voces, usando voz por defecto (Carlos)");
    return "IKne3meq5aSn9XLyUdCD"; // "Carlos" - voz masculina multilingual
  }

  const data = (await response.json()) as { voices: Voice[] };
  const voices = data.voices || [];

  // Buscar voz colombiana
  const colombian = voices.find((v) => {
    const labels = JSON.stringify(v.labels || {}).toLowerCase();
    return labels.includes("colomb");
  });

  if (colombian) {
    console.log(`🇨🇴 Voz colombiana encontrada: "${colombian.name}" (${colombian.voice_id})`);
    return colombian.voice_id;
  }

  // Buscar cualquier voz en español
  const spanish = voices.find((v) => {
    const labels = JSON.stringify(v.labels || {}).toLowerCase();
    return labels.includes("spanish") || labels.includes("español");
  });

  if (spanish) {
    console.log(`🇪🇸 Voz en español encontrada: "${spanish.name}" (${spanish.voice_id})`);
    return spanish.voice_id;
  }

  // Fallback: voz multilingual que suena bien en español
  console.log("⚠️  No se encontró voz colombiana, usando voz multilingual por defecto");
  return "IKne3meq5aSn9XLyUdCD";
}

// ─── Paso 2: Escenas con narración ───────────────────────────────────────────

const scenes = [
  {
    id: "scene-01-intro",
    text: "StratosCore. Módulo de Logística para tu lavandería. Control total de recolección y entrega, en tiempo real.",
  },
  {
    id: "scene-02-dashboard",
    text: "Tu panel de logística muestra todo de un vistazo: pedidos del día, unidades en ruta, entregas completadas y pedidos pendientes. Con mapa de rutas en tiempo real y seguimiento de cada orden.",
  },
  {
    id: "scene-03-features",
    text: "Funcionalidades diseñadas para optimizar tu operación. Rutas inteligentes, tracking en vivo, analíticas de rendimiento, notificaciones automáticas, gestión completa de pedidos y asignación inteligente de conductores.",
  },
  {
    id: "scene-04-workflow",
    text: "El flujo es simple: el cliente solicita por app, WhatsApp o web. Se asigna un conductor para la recolección. La prenda se procesa en planta con tracking. Se entrega por ruta optimizada. Y el cliente recibe confirmación automática.",
  },
  {
    id: "scene-05-outro",
    text: "Logística inteligente para tu lavandería. Automatiza tu operación con StratosCore. Visita lavandería punto stratoscore punto app.",
  },
];

// ─── Paso 3: Generar audios ──────────────────────────────────────────────────

const OUTPUT_DIR = join(process.cwd(), "public", "voiceover");

async function generateVoiceover() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const voiceId = await findColombianVoice();

  console.log(`\n🎬 Generando voiceover con voz: ${voiceId}\n`);

  for (const scene of scenes) {
    const outputPath = join(OUTPUT_DIR, `${scene.id}.mp3`);

    if (existsSync(outputPath)) {
      console.log(`⏭️  ${scene.id} ya existe, saltando... (borra el archivo para regenerar)`);
      continue;
    }

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
          language_code: "es",
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
    console.log(
      `✅ ${scene.id} → ${outputPath} (${(audioBuffer.length / 1024).toFixed(1)} KB)`
    );
  }

  console.log("\n🎬 ¡Voiceover completo!");
  console.log("   Ahora renderiza el video:");
  console.log("   npm run build");
}

generateVoiceover();
