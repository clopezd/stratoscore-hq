import { config } from "dotenv";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY no encontrada en .env");
  process.exit(1);
}

// Voz en español — "Carlos" (español latino) o fallback a una multilingual
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";

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

const OUTPUT_DIR = join(process.cwd(), "public", "voiceover");

async function generateVoiceover() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const scene of scenes) {
    const outputPath = join(OUTPUT_DIR, `${scene.id}.mp3`);

    if (existsSync(outputPath)) {
      console.log(`⏭️  ${scene.id} ya existe, saltando...`);
      continue;
    }

    console.log(`🎙️  Generando: ${scene.id}...`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: scene.text,
          model_id: "eleven_multilingual_v2",
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
    console.log(`✅ ${scene.id} → ${outputPath} (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n🎬 Voiceover completo. Ahora ejecuta:");
  console.log("   npx remotion studio");
}

generateVoiceover();
