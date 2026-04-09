import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { FoodAnalysisSchema } from '@/features/fitsync/types'

const SYSTEM_PROMPT = `Eres un nutricionista experto con conocimiento profundo de comida latinoamericana, americana y global.

Analiza la foto de comida y estima con precisión:
- Cada ingrediente/componente visible
- Porciones en gramos (sé conservador, mejor subestimar que sobreestimar)
- Macronutrientes: calorías, proteína, carbohidratos, grasa, fibra

Reglas:
- Incluye aceites, salsas y aderezos que puedas inferir por el brillo o apariencia
- Si ves un plato típico latinoamericano (gallo pinto, casado, pupusas, arepas, etc.), identifícalo correctamente
- Considera métodos de cocción visibles (frito vs horneado afecta calorías)
- La confianza debe ser honesta: 0.9+ solo si el plato es claramente visible y reconocible
- Sugiere brevemente cómo mejorar nutricionalmente el plato si aplica`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    const mealType = formData.get('meal_type') as string | null

    if (!imageFile) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    const base64Image = imageBuffer.toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'

    const timeContext = mealType
      ? `El usuario indica que es: ${mealType}`
      : `Hora actual: ${new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`

    const { object } = await generateObject({
      model: openrouter(MODELS.fast),
      schema: FoodAnalysisSchema,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`,
            },
            {
              type: 'text',
              text: `Analiza esta comida. ${timeContext}. Retorna el análisis nutricional completo.`,
            },
          ],
        },
      ],
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[FitSync] Food analysis error:', error)
    return NextResponse.json(
      { error: 'Food analysis failed' },
      { status: 500 },
    )
  }
}
