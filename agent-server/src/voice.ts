import { createReadStream, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { GROQ_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from './config.js'
import { logger } from './logger.js'

// Use bundled ffmpeg binary — no system install required
if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string)

export function voiceCapabilities(): { stt: boolean; tts: boolean } {
  return {
    stt: Boolean(GROQ_API_KEY),
    tts: Boolean(ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID),
  }
}

// ─── Audio conversion ─────────────────────────────────────────────────────────

/**
 * Converts any audio file (OGA, OGG, OPUS) to MP3 using the bundled ffmpeg.
 * Returns path to the MP3 temp file. Caller is responsible for deleting it.
 */
function convertToMp3(inputPath: string): Promise<string> {
  const outputPath = join(tmpdir(), `tg-voice-${Date.now()}.mp3`)

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .audioCodec('libmp3lame')
      .audioQuality(4)
      .on('error', (err: Error) => {
        reject(new Error(`ffmpeg conversion failed: ${err.message}`))
      })
      .on('end', () => resolve(outputPath))
      .save(outputPath)
  })
}

// ─── STT — Groq Whisper ───────────────────────────────────────────────────────

/**
 * Transcribes an audio file using Groq Whisper.
 * Converts to MP3 first for maximum Groq compatibility.
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  logger.debug({ filePath }, 'starting STT transcription')

  // Convert to MP3 for reliable Groq compatibility
  let mp3Path: string | null = null
  try {
    mp3Path = await convertToMp3(filePath)
    logger.debug({ mp3Path }, 'audio converted to MP3')
  } catch (convErr) {
    throw new Error(`[STT] Audio conversion error: ${String(convErr)}`)
  }

  try {
    const form = new FormData()
    const fileBuffer = await import('fs/promises').then((fs) => fs.readFile(mp3Path!))
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' })
    form.set('file', blob, 'audio.mp3')
    form.set('model', 'whisper-large-v3')
    form.set('response_format', 'json')

    let response: Response
    try {
      response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        body: form,
      })
    } catch (networkErr) {
      throw new Error(`[STT] Network error reaching Groq API: ${String(networkErr)}`)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '(no body)')
      throw new Error(`[STT] Groq API returned ${response.status}: ${body}`)
    }

    const data = (await response.json()) as { text: string }
    logger.debug({ chars: data.text.length }, 'STT transcription complete')
    return data.text

  } finally {
    // Clean up temp MP3
    if (mp3Path && existsSync(mp3Path)) {
      try { unlinkSync(mp3Path) } catch { /* ignore */ }
    }
  }
}

// ─── TTS — ElevenLabs ─────────────────────────────────────────────────────────

/**
 * Synthesizes text to speech using ElevenLabs.
 * Returns MP3 Buffer ready to send to Telegram as a voice note.
 */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  logger.debug({ chars: text.length }, 'starting TTS synthesis')

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })
  } catch (networkErr) {
    throw new Error(`[TTS] Network error reaching ElevenLabs API: ${String(networkErr)}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)')
    throw new Error(`[TTS] ElevenLabs API returned ${response.status}: ${body}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  logger.debug({ bytes: arrayBuffer.byteLength }, 'TTS synthesis complete')
  return Buffer.from(arrayBuffer)
}
