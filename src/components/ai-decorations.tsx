'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText as FileTextIcon,
  Heart as HeartIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Sparkles as SparklesIcon,
  Brain as BrainIcon,
  TrendingUp as TrendingUpIcon,
  Target as TargetIcon,
  Smile as SmileIcon,
  Frown as FrownIcon,
  Meh as MehIcon,
} from 'lucide-react'

interface AIDecorationsProps {
  emotions?: string[]
  tags?: string[]
  summary?: string
  insights?: {
    mood_trend?: string
    gratitude_count?: number
    goal_progress?: Array<{ goal: string, progress: number }>
    recurring_topics?: Array<{ topic: string, count: number }>
    emotional_pattern?: string
  }
}

export default function AIDecorations({
  emotions = [],
  tags = [],
  summary,
  insights
}: AIDecorationsProps) {
  const getEmotionIcon = (emotion: string) => {
    const positiveEmotions = ['joy', 'love', 'pride', 'relief', 'hope', 'surprise', 'contentment']
    const negativeEmotions = ['anger', 'fear', 'disgust', 'shame', 'guilt', 'loneliness', 'confusion']
    
    if (positiveEmotions.includes(emotion)) {
      return <SmileIcon className="h-4 w-4 text-green-600" />
    } else if (negativeEmotions.includes(emotion)) {
      return <FrownIcon className="h-4 w-4 text-red-600" />
    } else {
      return <MehIcon className="h-4 w-4 text-yellow-600" />
    }
  }

  const getEmotionColor = (emotion: string) => {
    const positiveEmotions = ['joy', 'love', 'pride', 'relief', 'hope', 'surprise', 'contentment']
    const negativeEmotions = ['anger', 'fear', 'disgust', 'shame', 'guilt', 'loneliness', 'confusion']
    
    if (positiveEmotions.includes(emotion)) {
      return 'bg-green-100 text-green-800 border-green-200'
    } else if (negativeEmotions.includes(emotion)) {
      return 'bg-red-100 text-red-800 border-red-200'
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* AI Processing Indicator */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <SparklesIcon className="h-5 w-5 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-800">AI enhancements are active</span>
      </div>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainIcon className="h-5 w-5 text-purple-600" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Emotions Analysis */}
      {emotions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HeartIcon className="h-5 w-5 text-red-600" />
              Detected Emotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`flex items-center gap-1 ${getEmotionColor(emotion)}`}
                >
                  {getEmotionIcon(emotion)}
                  {emotion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-generated Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
              Auto-generated Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && (
        <div className="space-y-4">
          {/* Mood Trend */}
          {insights.mood_trend && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-green-600" />
                  Mood Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{insights.mood_trend}</p>
              </CardContent>
            </Card>
          )}

          {/* Gratitude Highlights */}
          {insights.gratitude_count && insights.gratitude_count > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-pink-600" />
                  Gratitude Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Found {insights.gratitude_count} expression{insights.gratitude_count > 1 ? 's' : ''} of gratitude
                </p>
              </CardContent>
            </Card>
          )}

          {/* Goal Progress */}
          {insights.goal_progress && insights.goal_progress.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TargetIcon className="h-5 w-5 text-purple-600" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.goal_progress.map((goal, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{goal.goal}</span>
                        <span className="text-gray-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recurring Topics */}
          {insights.recurring_topics && insights.recurring_topics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                  Recurring Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.recurring_topics.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{topic.topic}</span>
                      <Badge variant="outline">
                        {topic.count} mention{topic.count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emotional Pattern */}
          {insights.emotional_pattern && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BrainIcon className="h-5 w-5 text-indigo-600" />
                  Emotional Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{insights.emotional_pattern}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}