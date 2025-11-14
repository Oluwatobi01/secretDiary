'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import JournalEntryForm from '@/components/journal-entry-form'
import Auth from '@/components/auth'
import { 
  Book as BookIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Calendar as CalendarIcon,
  Map as MapIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  PenTool as PenToolIcon,
  Mic as MicIcon,
  Camera as CameraIcon,
  Brain as BrainIcon,
  LogOut as LogOutIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'

interface Entry {
  id: string
  title: string
  content: string
  mood?: string
  emotions?: string[]
  tags?: string[]
  is_favorite: boolean
  location?: string
  created_at: string
  journal: {
    title: string
    color?: string
  }
}

interface Journal {
  id: string
  title: string
  color?: string
  icon?: string
  entry_count?: number
}

export default function SecretDiaryApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('write')
  const [entries, setEntries] = useState<Entry[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJournal, setSelectedJournal] = useState<string>('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setIsAuthenticated(true)
      loadData()
    } else {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setEntries([])
    setJournals([])
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  const loadData = async () => {
    try {
      // Load journals
      const { data: journalsData, error: journalsError } = await supabase
        .from('journals')
        .select(`
          *,
          entries(count)
        `)
        .order('created_at', { ascending: true })
      
      if (journalsData) {
        setJournals(journalsData.map(j => ({
          ...j,
          entry_count: j.entries?.[0]?.count || 0
        })))
      }

      // Load entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select(`
          *,
          journal:journals(title, color)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (entriesData) {
        setEntries(entriesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Support both shapes: `entry.journal` may be a string id or an object with `id`.
    const matchesJournal =
      selectedJournal === 'all' ||
      (typeof (entry as any).journal === 'string'
        ? (entry as any).journal === selectedJournal
        : (entry as any).journal?.id === selectedJournal)
    const matchesFavorites = !showFavorites || entry.is_favorite
    
    return matchesSearch && matchesJournal && matchesFavorites
  })

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      grateful: '🙏',
      anxious: '😰',
      calm: '😌',
      frustrated: '😤',
      neutral: '😐'
    }
    return moodEmojis[mood || ''] || '📝'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      })
    }
  }

  if (!mounted) return null

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => {
      setIsAuthenticated(true)
      loadData()
    }} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <BookIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Secret Diary</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <PenToolIcon className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <BookIcon className="h-4 w-4" />
              Entries
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BrainIcon className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="journals" className="flex items-center gap-2">
              <BookIcon className="h-4 w-4" />
              Journals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-6">
            <JournalEntryForm onSave={loadData} />
          </TabsContent>

          <TabsContent value="entries" className="mt-6">
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <select
                      value={selectedJournal}
                      onChange={(e) => setSelectedJournal(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Journals</option>
                      {journals.map((journal) => (
                        <option key={journal.id} value={journal.id}>
                          {journal.title}
                        </option>
                      ))}
                    </select>
                    
                    <Button
                      variant={showFavorites ? "default" : "outline"}
                      onClick={() => setShowFavorites(!showFavorites)}
                      className="flex items-center gap-2"
                    >
                      <HeartIcon className="h-4 w-4" />
                      Favorites
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Entries List */}
              <div className="grid gap-4">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                            {entry.is_favorite && <HeartIcon className="h-5 w-5 text-red-500 fill-current" />}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{formatDate(entry.created_at)}</span>
                            {entry.location && (
                              <span className="flex items-center gap-1">
                                📍 {entry.location}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {entry.journal.title}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className="text-sm text-gray-600 mb-3 line-clamp-3"
                        dangerouslySetInnerHTML={{ 
                          __html: entry.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
                        }}
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        {entry.emotions?.slice(0, 3).map((emotion, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                        {entry.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEntries.length === 0 && (
                <Card className="text-center">
                  <CardContent className="p-12">
                    <BookIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || selectedJournal !== 'all' || showFavorites
                        ? 'Try adjusting your filters or search query'
                        : 'Start writing your first entry to see it here'}
                    </p>
                    <Button 
                      onClick={() => setActiveTab('write')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Write First Entry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                <p className="text-muted-foreground mb-4">
                  Visual calendar with entry previews coming soon
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📅 View entries by date</p>
                  <p>📍 See location-based entries</p>
                  <p>📊 Track writing patterns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <BrainIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Weekly and monthly emotional patterns coming soon
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>🧠 Emotion tracking</p>
                  <p>📈 Mood trends</p>
                  <p>🎯 Goal progress</p>
                  <p>🙏 Gratitude patterns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journals" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Journals</h2>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Journal
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {journals.map((journal) => (
                  <Card key={journal.id} className="hover:shadow-md transition-all duration-200 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: journal.color }}
                        />
                        <h3 className="text-lg font-semibold">{journal.title}</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {journal.entry_count || 0} {journal.entry_count === 1 ? 'entry' : 'entries'}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedJournal(journal.id)
                            setActiveTab('entries')
                          }}
                        >
                          View Entries
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowSettings(true)}
                        >
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {journals.length === 0 && (
                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="p-12 text-center">
                      <BookIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No journals yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Your first journal will be created automatically when you write your first entry.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Export Data</span>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Clear Cache</span>
                <Button variant="outline" size="sm">
                  Clear
                </Button>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}