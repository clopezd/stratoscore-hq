/**
 * POST /api/bidhunter/documents/[id]/extract
 *
 * Triggers LLM extraction on a document that has raw_text.
 * If no raw_text, downloads from storage and extracts first.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractFromPdf, extractFromPdfChunked } from '@/features/bidhunter/agents/pdf-extractor'
import { isTextSufficient, processOCR } from '@/features/bidhunter/agents/ocr-processor'
import {
  downloadDocument,
  extractText,
  updateExtractionStatus,
  saveExtractedData,
} from '@/features/bidhunter/services/pdfService'
import type { OpportunityDocument, DocumentType, ExtractionMethod } from '@/features/bidhunter/types'

export const runtime = 'nodejs'
export const maxDuration = 300 // PDF extraction can take a while

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params

  try {
    const supabase = getAdmin()

    // Get document record
    const { data: doc, error } = await supabase
      .from('bh_opportunity_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = doc as OpportunityDocument

    // Mark as processing
    await updateExtractionStatus(documentId, 'processing')

    const isTextOnly = document.file_path.startsWith('text-only/')
    let rawText = document.raw_text
    let extractionMethod: ExtractionMethod = 'text'
    let pdfBuffer: Buffer | null = null

    // Step 1: Try to get text from existing data or pdf-parse
    if (isTextSufficient(rawText)) {
      console.log(`[PDF Extract] Using existing text for ${document.filename} (${rawText!.length} chars)`)
    } else if (!isTextOnly) {
      console.log(`[PDF Extract] Downloading ${document.filename} (${((document.file_size || 0) / 1024 / 1024).toFixed(1)}MB)`)
      pdfBuffer = await downloadDocument(document.file_path)

      try {
        const extractPromise = extractText(pdfBuffer)
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('pdf-parse timeout (60s)')), 60_000),
        )
        const { text, pages } = await Promise.race([extractPromise, timeoutPromise])
        rawText = text
        await updateExtractionStatus(documentId, 'processing', undefined, text, pages)
        console.log(`[PDF Extract] Text extracted: ${text.length} chars, ${pages} pages`)
      } catch (parseErr) {
        console.warn(`[PDF Extract] pdf-parse failed for ${document.filename}:`, (parseErr as Error).message)
      }
    } else {
      throw new Error('No text available for this document. Re-upload the PDF.')
    }

    // Step 2: If text is insufficient, try OCR
    if (!isTextSufficient(rawText) && !isTextOnly) {
      if (!pdfBuffer) {
        pdfBuffer = await downloadDocument(document.file_path)
      }

      console.log(`[PDF Extract] Text insufficient (${rawText?.length ?? 0} chars). Trying OCR...`)
      try {
        const ocrResult = await processOCR(pdfBuffer)

        if (isTextSufficient(ocrResult.text)) {
          // OCR succeeded — use OCR text
          const hadSomeText = isTextSufficient(rawText) // won't be true here, but for clarity
          rawText = hadSomeText ? `${rawText}\n\n--- OCR TEXT ---\n\n${ocrResult.text}` : ocrResult.text
          extractionMethod = hadSomeText ? 'ocr+text' : 'ocr'
          await updateExtractionStatus(documentId, 'processing', undefined, rawText, ocrResult.total_pages)

          // Save OCR metadata
          await supabase.from('bh_opportunity_documents').update({
            ocr_processed: true,
            ocr_confidence: ocrResult.avg_confidence,
            ocr_language: ocrResult.language,
            extraction_method: extractionMethod,
          }).eq('id', documentId)

          console.log(`[PDF Extract] OCR success: ${ocrResult.text.length} chars, ${ocrResult.avg_confidence.toFixed(1)}% confidence`)
        } else {
          console.warn(`[PDF Extract] OCR produced insufficient text (${ocrResult.text.length} chars)`)
        }
      } catch (ocrErr) {
        console.warn(`[PDF Extract] OCR failed:`, (ocrErr as Error).message)
      }
    }

    // Step 3: If still no text, fail — no vision mode (too expensive)
    let extracted
    if (!isTextSufficient(rawText)) {
      throw new Error('No extractable text from this PDF. Text extraction and OCR both failed. Try uploading a text-based PDF.')
    }

    // Use chunked extraction for large texts (>200k chars)
    const CHUNK_THRESHOLD = 200_000
    if (rawText!.length > CHUNK_THRESHOLD) {
      extracted = await extractFromPdfChunked(rawText!, document.document_type as DocumentType)
    } else {
      extracted = await extractFromPdf(rawText!, document.document_type as DocumentType)
    }

    // Update extraction method
    await supabase.from('bh_opportunity_documents').update({
      extraction_method: extractionMethod,
    }).eq('id', documentId)

    // Delete previous extraction for this document (re-extraction)
    await supabase.from('bh_extracted_data').delete().eq('document_id', documentId)

    // Save extracted data
    const savedData = await saveExtractedData({
      opportunity_id: document.opportunity_id,
      document_id: documentId,
      ...extracted,
    })

    // Mark as completed
    await updateExtractionStatus(documentId, 'completed')

    // Log action
    await supabase.from('bh_pipeline_log').insert({
      action: 'pdf_extracted',
      details: {
        document_id: documentId,
        opportunity_id: document.opportunity_id,
        filename: document.filename,
        confidence: extracted.confidence_score,
        painting_sqft: extracted.total_painting_sqft,
        extraction_method: extractionMethod,
      },
    })

    return NextResponse.json({
      ok: true,
      document_id: documentId,
      extraction_method: extractionMethod,
      extracted_data: savedData,
    })
  } catch (err) {
    // Mark as failed
    await updateExtractionStatus(documentId, 'failed', (err as Error).message)
    console.error('PDF extraction error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
