import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = image.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    const zai = await ZAI.create()

    const prompt = "Generate a descriptive caption for this image. Describe what you see in 1-2 sentences, focusing on the main subjects, setting, and mood."

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at describing images. Be descriptive but concise.'
        },
        {
          role: 'user',
          // The AI client expects string content for chat messages. Combine the
          // prompt and the image data URL into a single string so TypeScript
          // types match and the Responses/Chat API accepts the payload.
          content: `${prompt}\nImage data: ${dataUrl}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const caption = response.choices[0]?.message?.content || 'No caption generated'

    return NextResponse.json({ caption })

  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}