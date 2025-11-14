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

    const prompt = "Extract all text from this image. Return only the text content, nothing else. If there is no text, return an empty string."

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an OCR (Optical Character Recognition) system. Extract all visible text from images accurately.'
        },
        {
          role: 'user',
          // The SDK expects `content` to be a string for chat messages.
          // Combine the prompt and the image data URL into one string so
          // TypeScript types align with the client's expectations.
          content: `${prompt}\nImage data: ${dataUrl}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })

    const text = response.choices[0]?.message?.content || ''

    return NextResponse.json({ text: text.trim() })

  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    )
  }
}