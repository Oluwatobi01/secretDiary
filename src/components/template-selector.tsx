'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText as FileTextIcon,
  Plus as PlusIcon,
  Heart as HeartIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Brain as BrainIcon,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Coffee as CoffeeIcon,
  Star as StarIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Template {
  id: string
  name: string
  content: string
  category?: string
  is_public: boolean
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void
}

const defaultTemplates: Template[] = [
  {
    id: 'daily',
    name: 'Daily Reflection',
    category: 'Daily',
    is_public: true,
    content: `<h2>Daily Reflection</h2>
<h3>Today's Highlights</h3>
<ul><li></li><li></li><li></li></ul>
<h3>What I'm Grateful For</h3>
<ul><li></li><li></li><li></li></ul>
<h3>Challenges & Learnings</h3>
<p></p>
<h3>Tomorrow's Intentions</h3>
<p></p>`
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    category: 'Gratitude',
    is_public: true,
    content: `<h2>Gratitude Journal</h2>
<h3>Today I'm Grateful For...</h3>
<ol><li></li><li></li><li></li><li></li><li></li></ol>
<h3>People Who Made My Day Better</h3>
<ul><li></li><li></li></ul>
<h3>Simple Pleasures I Enjoyed</h3>
<ul><li></li><li></li></ul>`
  },
  {
    id: 'mood',
    name: 'Mood Tracker',
    category: 'Wellness',
    is_public: true,
    content: `<h2>Mood & Emotions</h2>
<h3>How I'm Feeling Today</h3>
<p><strong>Mood:</strong> </p>
<p><strong>Energy Level:</strong> </p>
<p><strong>Stress Level:</strong> </p>
<h3>What Influenced My Mood</h3>
<ul><li></li><li></li></ul>
<h3>Self-Care Activities</h3>
<ul><li></li><li></li></ul>`
  },
  {
    id: 'goals',
    name: 'Goal Progress',
    category: 'Goals',
    is_public: true,
    content: `<h2>Goal Progress Check-in</h2>
<h3>Goals I'm Working On</h3>
<ul><li><strong>Goal:</strong> <br><strong>Progress:</strong> </li><li><strong>Goal:</strong> <br><strong>Progress:</strong> </li></ul>
<h3>Wins This Week</h3>
<ul><li></li><li></li></ul>
<h3>Obstacles & Solutions</h3>
<p></p>`
  },
  {
    id: 'travel',
    name: 'Travel Diary',
    category: 'Travel',
    is_public: true,
    content: `<h2>Travel Diary</h2>
<h3>Location</h3>
<p></p>
<h3>Today's Adventures</h3>
<ul><li></li><li></li><li></li></ul>
<h3>New Experiences</h3>
<p></p>
<h3>People I Met</h3>
<p></p>
<h3>Favorite Moments</h3>
<p></p>`
  },
  {
    id: 'work',
    name: 'Work Reflection',
    category: 'Professional',
    is_public: true,
    content: `<h2>Work Reflection</h2>
<h3>Professional Wins</h3>
<ul><li></li><li></li></ul>
<h3>Challenges Faced</h3>
<p></p>
<h3>Skills I'm Developing</h3>
<ul><li></li><li></li></ul>
<h3>Career Goals Progress</h3>
<p></p>
<h3>Work-Life Balance</h3>
<p></p>`
  },
  {
    id: 'relationships',
    name: 'Relationships',
    category: 'Personal',
    is_public: true,
    content: `<h2>Relationships & Connections</h2>
<h3>Meaningful Conversations</h3>
<ul><li></li><li></li></ul>
<h3>People Who Inspired Me</h3>
<p></p>
<h3>Ways I Showed Up for Others</h3>
<ul><li></li><li></li></ul>
<h3>Relationship Goals</h3>
<p></p>`
  },
  {
    id: 'creative',
    name: 'Creative Expression',
    category: 'Creative',
    is_public: true,
    content: `<h2>Creative Expression</h2>
<h3>Creative Ideas</h3>
<ul><li></li><li></li></ul>
<h3>Projects I'm Working On</h3>
<p></p>
<h3>Inspiration I Found</h3>
<p></p>
<h3>Creative Blocks & Breakthroughs</h3>
<p></p>`
  },
  {
    id: 'wellness',
    name: 'Wellness Check-in',
    category: 'Wellness',
    is_public: true,
    content: `<h2>Wellness Check-in</h2>
<h3>Physical Health</h3>
<p><strong>Exercise:</strong> </p>
<p><strong>Nutrition:</strong> </p>
<p><strong>Sleep:</strong> </p>
<h3>Mental Health</h3>
<p><strong>Mindfulness:</strong> </p>
<p><strong>Stress Management:</strong> </p>
<h3>Emotional Wellbeing</h3>
<p></p>`
  },
  {
    id: 'learning',
    name: 'Learning & Growth',
    category: 'Personal Growth',
    is_public: true,
    content: `<h2>Learning & Growth</h2>
<h3>What I Learned Today</h3>
<ul><li></li><li></li></ul>
<h3>Books/Podcasts/Articles</h3>
<p></p>
<h3>Skills I Practiced</h3>
<ul><li></li><li></li></ul>
<h3>Mindset Shifts</h3>
<p></p>`
  }
]

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userTemplates, setUserTemplates] = useState<Template[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    loadUserTemplates()
  }, [])

  const loadUserTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (data) {
        setUserTemplates(data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const categories = ['all', ...Array.from(new Set([
    ...defaultTemplates.map(t => t.category),
    ...userTemplates.map(t => t.category)
  ].filter(Boolean)))]

  const filteredTemplates = selectedCategory === 'all' 
    ? [...defaultTemplates, ...userTemplates]
    : [...defaultTemplates, ...userTemplates].filter(t => t.category === selectedCategory)

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Daily': return <FileTextIcon className="h-4 w-4" />
      case 'Gratitude': return <HeartIcon className="h-4 w-4" />
      case 'Goals': return <TargetIcon className="h-4 w-4" />
      case 'Professional': return <BriefcaseIcon className="h-4 w-4" />
      case 'Personal': return <UsersIcon className="h-4 w-4" />
      case 'Creative': return <StarIcon className="h-4 w-4" />
      case 'Wellness': return <BrainIcon className="h-4 w-4" />
      case 'Personal Growth': return <BookOpenIcon className="h-4 w-4" />
      case 'Travel': return <CoffeeIcon className="h-4 w-4" />
      default: return <FileTextIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose a Template</h3>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex items-center gap-1"
          >
            {getCategoryIcon(category === 'all' ? undefined : category)}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  )}
                  <div 
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: template.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found in this category</p>
        </div>
      )}
    </div>
  )
}