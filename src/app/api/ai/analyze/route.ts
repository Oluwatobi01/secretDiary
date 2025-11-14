import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // Analyze emotions
    const emotionPrompt = `Analyze the emotions expressed in this journal entry. Return a JSON object with:
    {
      "emotions": ["emotion1", "emotion2", "emotion3"],
      "mood": "overall_mood",
      "emotional_pattern": "brief description of emotional pattern"
    }
    
    Consider emotions like: joy, love, pride, relief, hope, surprise, anger, fear, disgust, shame, guilt, loneliness, nostalgia, curiosity, confusion, contentment.
    
    Journal entry: ${content}`

    const emotionResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing emotions in text. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: emotionPrompt
        }
      ],
      temperature: 0.3,
    })

    // Generate tags
    const tagPrompt = `Extract relevant tags from this journal entry. Return a JSON object with:
    {
      "tags": ["tag1", "tag2", "tag3"],
      "recurring_topics": [{"topic": "topic name", "count": 1}]
    }
    
    Focus on key themes, people, activities, and concepts mentioned. Journal entry: ${content}`

    const tagResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting key topics and themes from text. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: tagPrompt
        }
      ],
      temperature: 0.3,
    })

    // Generate summary
    const summaryPrompt = `Create a brief summary (2-3 sentences) of this journal entry: ${content}`

    const summaryResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating concise summaries. Keep it to 2-3 sentences maximum.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.5,
    })

    // Detect gratitude
    const gratitudePrompt = `Count how many expressions of gratitude are in this journal entry. Look for phrases like "thankful", "grateful", "appreciate", "blessed", etc. Return JSON:
    {
      "gratitude_count": number
    }
    
    Journal entry: ${content}`

    const gratitudeResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at detecting expressions of gratitude. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: gratitudePrompt
        }
      ],
      temperature: 0.1,
    })

    // Extract goals
    const goalPrompt = `Extract any goals or intentions mentioned in this journal entry. Return JSON:
    {
      "goals": [{"goal": "goal description", "progress": 0}]
    }
    
    Look for phrases like "I want to", "I need to", "I plan to", "I will", "my goal is", etc. Journal entry: ${content}`

    const goalResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at identifying goals and intentions. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: goalPrompt
        }
      ],
      temperature: 0.2,
    })

    // Parse responses
    let emotionAnalysis, tagAnalysis, summary, gratitudeAnalysis, goalAnalysis
    
    try {
      emotionAnalysis = JSON.parse(emotionResponse.choices[0]?.message?.content || '{}')
    } catch {
      emotionAnalysis = { emotions: [], mood: 'neutral', emotional_pattern: '' }
    }

    try {
      tagAnalysis = JSON.parse(tagResponse.choices[0]?.message?.content || '{}')
    } catch {
      tagAnalysis = { tags: [], recurring_topics: [] }
    }

    summary = summaryResponse.choices[0]?.message?.content || ''

    try {
      gratitudeAnalysis = JSON.parse(gratitudeResponse.choices[0]?.message?.content || '{}')
    } catch {
      gratitudeAnalysis = { gratitude_count: 0 }
    }

    try {
      goalAnalysis = JSON.parse(goalResponse.choices[0]?.message?.content || '{}')
    } catch {
      goalAnalysis = { goals: [] }
    }

    const analysis = {
      emotions: emotionAnalysis.emotions || [],
      mood: emotionAnalysis.mood || 'neutral',
      emotional_pattern: emotionAnalysis.emotional_pattern || '',
      tags: tagAnalysis.tags || [],
      recurring_topics: tagAnalysis.recurring_topics || [],
      summary: summary,
      gratitude_count: gratitudeAnalysis.gratitude_count || 0,
      goal_progress: goalAnalysis.goals || []
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}