---
name: ai
description: Agrega features de IA a un proyecto (chat, RAG, vision, tool use, web search, agents). 11 templates listos para usar. Usa cuando el usuario pida "agrega IA", "chatbot", "RAG", "búsqueda semántica".
triggers: ai, ia, chat, chatbot, rag, vision, tools, agent, embeddings, llm, openai, claude
---

# AI — 11 Templates de inteligencia artificial

Agrega capacidades de IA a cualquier proyecto con templates listos: chat, RAG, vision, tool use, web search, agents.

## Templates disponibles

| Template | Descripción |
|----------|-------------|
| `chat-streaming` | Chat con streaming SSE (Claude/OpenAI) |
| `chat-multimodal` | Chat con imágenes y PDFs |
| `rag-pgvector` | RAG con pgvector en Supabase |
| `rag-chunks` | Chunking + embeddings + retrieval |
| `vision-ocr` | OCR con Claude Vision |
| `tool-use` | Agentes con tools (function calling) |
| `web-search` | Búsqueda web integrada (Perplexity/Brave) |
| `agent-loop` | Loop agente con memoria |
| `structured-output` | Salida JSON tipada (Zod) |
| `prompt-caching` | Caching de prompts largos |
| `batch-api` | Batch API para procesamiento masivo |

## Cuándo usar

- "Agrega un chatbot a mi web"
- "Quiero buscar en mis documentos con IA"
- "Necesito extraer datos de facturas con vision"
- "Crea un agente que use herramientas"

## Stack

- Anthropic SDK (preferido) o OpenAI SDK
- Vercel AI SDK (opcional, para UI)
- Supabase pgvector (para RAG)

## Requisitos

- `ANTHROPIC_API_KEY` o `OPENAI_API_KEY` en `.env.local`

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
