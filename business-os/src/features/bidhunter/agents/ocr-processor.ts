/**
 * OCR Processor — BidHunter
 *
 * Tesseract.js wrapper for scanned PDFs.
 * Flow: PDF buffer → convert pages to images in batches → OCR each page → merge text
 *
 * Used as fallback when pdf-parse extracts insufficient text (<50 chars).
 * Handles large PDFs (50+ pages) with batched rendering to avoid OOM.
 */

import Tesseract from 'tesseract.js'
import type { OCRResult, OCRPageResult } from '../types'

const MIN_TEXT_THRESHOLD = 50
const MAX_OCR_PAGES = 80        // Hard cap on OCR pages
const RENDER_BATCH_SIZE = 10    // Render N pages at a time to limit memory
const OCR_SCALE = 1.5           // Scale for rendering (1.5x = good quality, less memory than 2x)

/**
 * Check if extracted text is sufficient (not a scanned PDF).
 * Returns true if text is usable, false if OCR is needed.
 */
export function isTextSufficient(text: string | null | undefined): boolean {
  if (!text) return false
  const cleaned = text.replace(/\s+/g, ' ').trim()
  return cleaned.length >= MIN_TEXT_THRESHOLD
}

/**
 * Render a batch of PDF pages to PNG images using pdfjs-dist + canvas.
 * Only keeps `batchSize` images in memory at a time.
 */
async function renderPageBatch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  startPage: number,
  endPage: number,
): Promise<Buffer[]> {
  const { createCanvas } = await import('canvas')
  const images: Buffer[] = []

  for (let i = startPage; i <= endPage; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: OCR_SCALE })

    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    await page.render({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvasContext: context as any,
      viewport,
    }).promise

    images.push(canvas.toBuffer('image/png'))
    page.cleanup()
  }

  return images
}

/**
 * Run OCR on a single image buffer using Tesseract.js
 */
async function ocrPage(imageBuffer: Buffer, language: string): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(imageBuffer, language, {
    logger: () => {},
  })

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  }
}

/**
 * Main OCR pipeline: PDF buffer → batched page rendering → OCR → merged text
 *
 * Memory-safe: renders pages in batches of RENDER_BATCH_SIZE, OCRs them,
 * then discards the image buffers before rendering the next batch.
 */
export async function processOCR(
  pdfBuffer: Buffer,
  language: string = 'eng',
): Promise<OCRResult> {
  const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(1)
  console.log(`[OCR] Starting OCR (${sizeMB}MB, lang=${language})`)

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(pdfBuffer)
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise
  const totalPages = doc.numPages
  const pagesToProcess = Math.min(totalPages, MAX_OCR_PAGES)

  console.log(`[OCR] PDF has ${totalPages} pages, processing ${pagesToProcess}`)

  const pages: OCRPageResult[] = []
  let totalConfidence = 0

  // Process in batches to limit memory usage
  for (let batchStart = 1; batchStart <= pagesToProcess; batchStart += RENDER_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + RENDER_BATCH_SIZE - 1, pagesToProcess)
    console.log(`[OCR] Rendering pages ${batchStart}-${batchEnd}`)

    const images = await renderPageBatch(doc, batchStart, batchEnd)

    // OCR each image in this batch
    for (let j = 0; j < images.length; j++) {
      const pageNum = batchStart + j
      const { text, confidence } = await ocrPage(images[j], language)
      pages.push({ page: pageNum, text, confidence })
      totalConfidence += confidence
    }

    // Images are now out of scope and eligible for GC
    console.log(`[OCR] Batch done: ${batchEnd}/${pagesToProcess} pages`)
  }

  await doc.destroy()

  // Merge text with page break markers (used by chunked extraction to split)
  const fullText = pages.map(p => p.text).join('\n\n--- PAGE BREAK ---\n\n')
  const avgConfidence = pages.length > 0 ? totalConfidence / pages.length : 0

  console.log(`[OCR] Complete: ${fullText.length} chars, ${avgConfidence.toFixed(1)}% confidence, ${pages.length} pages`)

  return {
    text: fullText,
    pages,
    avg_confidence: avgConfidence,
    language,
    total_pages: totalPages,
  }
}
