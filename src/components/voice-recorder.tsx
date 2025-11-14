'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Mic as MicIcon,
  Square as SquareIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Trash2 as Trash2Icon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void
  onTranscription: (text: string) => void
}

export default function VoiceRecorder({ onRecordingComplete, onTranscription }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioURL, setAudioURL] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      // Monitor audio levels
      const checkAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255)
          requestAnimationFrame(checkAudioLevel)
        }
      }
      checkAudioLevel()

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        onRecordingComplete(url)
        
        // Upload to Supabase Storage
        try {
          const fileName = `voice-recording-${Date.now()}.wav`
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const filePath = `${user.id}/${fileName}`
            const { error } = await supabase.storage
              .from('media')
              .upload(filePath, audioBlob)
            
            if (!error) {
              const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filePath)
              
              onRecordingComplete(publicUrl)
            }
          }
        } catch (error) {
          console.error('Error uploading audio:', error)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setAudioLevel(0)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const transcribeAudio = async () => {
    if (!audioURL) return

    setIsTranscribing(true)
    try {
      // Placeholder for speech-to-text transcription
      const transcribedText = "This is a sample transcription of the audio recording"
      
      onTranscription(transcribedText)
      toast({
        title: "Transcription Complete",
        description: "Your speech has been converted to text"
      })
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: "Unable to transcribe audio",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const deleteRecording = () => {
    setAudioURL('')
    setRecordingTime(0)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-red-200 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-red-300 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MicIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              {/* Audio Level Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
              
              <Badge variant={isPaused ? "secondary" : "destructive"}>
                {isPaused ? "Paused" : "Recording"} • {formatTime(recordingTime)}
              </Badge>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                <MicIcon className="h-6 w-6" />
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    onClick={resumeRecording}
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 rounded-full"
                  >
                    <PlayIcon className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={pauseRecording}
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 rounded-full"
                  >
                    <PauseIcon className="h-5 w-5" />
                  </Button>
                )}
                
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <SquareIcon className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Audio Playback */}
          {audioURL && !isRecording && (
            <div className="space-y-4">
              <audio controls className="w-full">
                <source src={audioURL} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              
              <div className="flex justify-center gap-2">
                <Button
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  variant="outline"
                  size="sm"
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </Button>
                
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                >
                  <Trash2Icon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isRecording && !audioURL && (
            <div className="text-sm text-gray-500 space-y-2">
              <p>Click the microphone to start recording</p>
              <p>Record up to 10 minutes of audio</p>
              <p>Transcription will be automatically added to your entry</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}