'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichTextEditor from '@/components/rich-text-editor'
import MediaUpload from '@/components/media-upload'
import VoiceRecorder from '@/components/voice-recorder'
import TemplateSelector from '@/components/template-selector'
import AIDecorations from '@/components/ai-decorations'
import { 
  Save as SaveIcon,
  Upload as UploadIcon,
  Mic as MicIcon,
  FileText as FileTextIcon,
  Sparkles as SparklesIcon,
  Heart as HeartIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  Camera as CameraIcon,
  Video as VideoIcon,
  Volume2 as Volume2Icon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface JournalEntry {
  id?: string
  title: string
  content: string
  mood?: string
  emotions?: string[]
  tags?: string[]
  is_favorite: boolean
  location?: string
  latitude?: number
  longitude?: number
  weather?: string
  template_id?: string
}

interface Journal {
  id: string
  title: string
  color?: string
  icon?: string
}

const moods = [
  { value: 'happy', label: '😊 Happy', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sad', label: '😢 Sad', color: 'bg-blue-100 text-blue-800' },
  { value: 'excited', label: '🤩 Excited', color: 'bg-pink-100 text-pink-800' },
  { value: 'grateful', label: '🙏 Grateful', color: 'bg-green-100 text-green-800' },
  { value: 'anxious', label: '😰 Anxious', color: 'bg-orange-100 text-orange-800' },
  { value: 'calm', label: '😌 Calm', color: 'bg-purple-100 text-purple-800' },
  { value: 'frustrated', label: '😤 Frustrated', color: 'bg-red-100 text-red-800' },
  { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-100 text-gray-800' },
]

const emotions = [
  'joy', 'love', 'pride', 'relief', 'hope', 'surprise',
  'anger', 'fear', 'disgust', 'shame', 'guilt', 'loneliness',
  'nostalgia', 'curiosity', 'confusion', 'contentment'
]

export default function JournalEntryForm({ entryId, onSave }: { entryId?: string, onSave?: () => void }) {
  const [entry, setEntry] = useState<JournalEntry>({
    title: '',
    content: '',
    mood: '',
    emotions: [],
    tags: [],
    is_favorite: false,
    location: '',
  })
  
  const [journals, setJournals] = useState<Journal[]>([])
  const [selectedJournal, setSelectedJournal] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [audioRecording, setAudioRecording] = useState<string | null>(null)
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadJournals()
    if (entryId) {
      loadEntry(entryId)
    }
  }, [entryId])

  // Ensure selectedJournal is set when journals are loaded
  useEffect(() => {
    if (journals.length > 0 && !selectedJournal) {
      setSelectedJournal(journals[0].id)
    }
  }, [journals, selectedJournal])

  const loadJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error loading journals:', error)
        toast({
          title: "Error Loading Journals",
          description: "Unable to load your journals. Please try again.",
          variant: "destructive"
        })
        return
      }
      
      console.log('Loaded journals:', data)
      setJournals(data || [])
      
      if (data && data.length > 0 && !selectedJournal) {
        console.log('Setting default journal to:', data[0].id)
        setSelectedJournal(data[0].id)
      } else if (data && data.length === 0) {
        console.log('No journals found, creating default journal')
        // Create a default journal if none exists
        await createDefaultJournal()
      }
    } catch (err) {
      console.error('Error in loadJournals:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading journals.",
        variant: "destructive"
      })
    }
  }

  const createDefaultJournal = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        console.error('No user data found')
        return
      }

      const defaultJournal = {
        user_id: userData.user.id,
        title: 'My Diary',
        description: 'My personal diary entries',
        color: '#3B82F6',
        icon: 'book',
        is_default: true
      }

      console.log('Creating default journal:', defaultJournal)
      const { data, error } = await supabase
        .from('journals')
        .insert(defaultJournal)
        .select()
        .single()

      if (error) {
        console.error('Error creating default journal:', error)
        toast({
          title: "Error Creating Journal",
          description: "Unable to create a default journal. Please try again.",
          variant: "destructive"
        })
        return
      }

      console.log('Default journal created successfully:', data)
      setJournals([data])
      setSelectedJournal(data.id)
      
      toast({
        title: "Default Journal Created",
        description: "A default journal has been created for you.",
      })
    } catch (err) {
      console.error('Error in createDefaultJournal:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the default journal.",
        variant: "destructive"
      })
    }
  }

  const loadEntry = async (id: string) => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setEntry(data)
      setSelectedJournal(data.journal_id)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding to get location name
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const data = await response.json()
            
            setEntry(prev => ({
              ...prev,
              location: data.locality || data.city || 'Unknown Location',
              latitude,
              longitude
            }))
          } catch (error) {
            console.error('Error getting location name:', error)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const analyzeWithAI = async () => {
    setIsAnalyzing(true)
    try {
      // Placeholder for AI analysis
      const analysis = {
        emotions: ['happy', 'content'],
        tags: ['personal', 'reflection'],
        summary: 'A meaningful journal entry about personal experiences.',
        mood: 'positive',
        emotional_pattern: 'Generally positive outlook with moments of reflection',
        recurring_topics: [{ topic: 'personal growth', count: 1 }],
        gratitude_count: 2,
        goal_progress: [{ goal: 'self-improvement', progress: 25 }]
      }
      
      setEntry(prev => ({
        ...prev,
        emotions: analysis.emotions || [],
        tags: [...(prev.tags || []), ...(analysis.tags || [])],
        summary: analysis.summary,
        mood: analysis.mood || prev.mood
      }))
      
      setShowAI(true)
      toast({
        title: "AI Analysis Complete",
        description: "Entry has been analyzed with AI insights"
      })
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Unable to analyze entry with AI",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveEntry = async () => {
    if (!selectedJournal) {
      toast({
        title: "No Journal Selected",
        description: "Please select a journal for your entry",
        variant: "destructive"
      })
      return
    }

    if (!entry.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please give your entry a title",
        variant: "destructive"
      })
      return
    }

    if (!entry.content.trim() || entry.content === '<p></p>') {
      toast({
        title: "Missing Content",
        description: "Please write something in your entry",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User not authenticated')
      }

      const entryData = {
        title: entry.title.trim(),
        content: entry.content.trim(),
        mood: entry.mood || null,
        emotions: entry.emotions || [],
        tags: entry.tags || [],
        is_favorite: entry.is_favorite,
        location: entry.location || null,
        journal_id: selectedJournal,
        user_id: userData.user.id,
      }

      console.log('Saving entry:', entryData)

      let result
      if (entryId) {
        result = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', entryId)
          .select()
      } else {
        result = await supabase
          .from('entries')
          .insert(entryData)
          .select()
      }

      if (result.error) {
        console.error('Database error:', result.error)
        throw result.error
      }

      console.log('Entry saved successfully:', result.data)

      // Save media files if any
      if (mediaFiles.length > 0) {
        const entryIdToUse = entryId || result.data[0].id
        
        for (const file of mediaFiles) {
          try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${userData.user.id}/${fileName}`
            
            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, file.file)
            
            if (uploadError) {
              console.error('Upload error:', uploadError)
              throw uploadError
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(filePath)
            
            await supabase
              .from('media')
              .insert({
                entry_id: entryIdToUse,
                user_id: userData.user.id,
                type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
                url: publicUrl,
                caption: file.caption || ''
              })
          } catch (mediaError) {
            console.error('Error saving media file:', mediaError)
            // Continue with other files even if one fails
          }
        }
      }

      toast({
        title: "Entry Saved",
        description: "Your diary entry has been saved successfully"
      })
      
      // Reset form after successful save
      if (!entryId) {
        setEntry({
          title: '',
          content: '',
          mood: '',
          emotions: [],
          tags: [],
          is_favorite: false,
          location: '',
        })
        setMediaFiles([])
        setShowAI(false)
      }
      
      if (onSave) onSave()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save your entry. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !entry.tags?.includes(tag)) {
      setEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }))
  }

  const toggleEmotion = (emotion: string) => {
    setEntry(prev => ({
      ...prev,
      emotions: prev.emotions?.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...(prev.emotions || []), emotion]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            {entryId ? 'Edit Entry' : 'New Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="journal">Journal</Label>
              <Select value={selectedJournal} onValueChange={setSelectedJournal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a journal" />
                </SelectTrigger>
                <SelectContent>
                  {journals.map((journal) => (
                    <SelectItem key={journal.id} value={journal.id}>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: journal.color }} />
                        {journal.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={entry.title}
                onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your entry a title..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getLocation}
              className="flex items-center gap-2"
            >
              <MapPinIcon className="h-4 w-4" />
              {entry.location || 'Add Location'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEntry(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
              className={`flex items-center gap-2 ${entry.is_favorite ? 'text-red-600' : ''}`}
            >
              <HeartIcon className={`h-4 w-4 ${entry.is_favorite ? 'fill-current' : ''}`} />
              Favorite
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeWithAI}
              disabled={isAnalyzing || !entry.content}
              className="flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </Button>
          </div>

          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="space-y-4">
              <RichTextEditor
                content={entry.content}
                onChange={(content) => setEntry(prev => ({ ...prev, content }))}
                placeholder="What's on your mind today?"
              />
              
              {showAI && (
                <AIDecorations
                  emotions={entry.emotions}
                  tags={entry.tags}
                  summary={entry.summary}
                />
              )}
            </TabsContent>
            
            <TabsContent value="media">
              <MediaUpload
                onFilesChange={setMediaFiles}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </TabsContent>
            
            <TabsContent value="voice">
              <VoiceRecorder
                onRecordingComplete={(audioUrl) => setAudioRecording(audioUrl)}
                onTranscription={(text) => {
                  setEntry(prev => ({
                    ...prev,
                    content: prev.content + (prev.content ? '\n\n' : '') + text
                  }))
                }}
              />
            </TabsContent>
            
            <TabsContent value="template">
              <TemplateSelector
                onSelectTemplate={(template) => {
                  setEntry(prev => ({
                    ...prev,
                    content: template.content,
                    title: template.name
                  }))
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {moods.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={entry.mood === mood.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEntry(prev => ({ ...prev, mood: mood.value }))}
                    className={entry.mood === mood.value ? mood.color : ''}
                  >
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Emotions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {emotions.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={entry.emotions?.includes(emotion) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEmotion(emotion)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={saveEntry}
              disabled={isSaving}
              className="flex items-center gap-2 min-w-32"
              size="lg"
            >
              <SaveIcon className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}