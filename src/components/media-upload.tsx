'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload as UploadIcon,
  X as XIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileAudio as FileAudioIcon,
  Camera as CameraIcon,
  Scan as ScanIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video' | 'audio'
  caption?: string
  ocrText?: string
  progress?: number
}

interface MediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string
}

export default function MediaUpload({
  onFilesChange,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  accept = 'image/*,video/*,audio/*'
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'audio'
    }))

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles: maxFiles - files.length
  })

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const updateCaption = (index: number, caption: string) => {
    const updatedFiles = [...files]
    updatedFiles[index].caption = caption
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const scanImage = async (index: number) => {
    setIsScanning(true)
    try {
      const file = files[index]
      if (file.type !== 'image') return

      // Placeholder for OCR scanning
      const extractedText = "Sample text extracted from image using OCR"
      
      const updatedFiles = [...files]
      updatedFiles[index].ocrText = extractedText
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
      
      toast({
        title: "OCR Complete",
        description: `Found ${extractedText.length} characters of text`
      })
    } catch (error) {
      toast({
        title: "OCR Failed",
        description: "Unable to extract text from image",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const generateCaption = async (index: number) => {
    try {
      const file = files[index]
      if (file.type !== 'image') return

      // Placeholder for AI caption generation
      const caption = "A beautiful image captured in the moment"
      updateCaption(index, caption)
      
      toast({
        title: "Caption Generated",
        description: "AI has generated a caption for your image"
      })
    } catch (error) {
      toast({
        title: "Caption Generation Failed",
        description: "Unable to generate caption",
        variant: "destructive"
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-8 w-8 text-blue-500" />
      case 'video': return <VideoIcon className="h-8 w-8 text-green-500" />
      case 'audio': return <FileAudioIcon className="h-8 w-8 text-purple-500" />
      default: return <UploadIcon className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop files here' : 'Upload media files'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop images, videos, or audio files here
            </p>
            <Button variant="outline">
              <CameraIcon className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  {getFileIcon(file.type)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>

                {file.type === 'image' && (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}

                {file.type === 'video' && (
                  <video
                    src={file.preview}
                    className="w-full h-32 object-cover rounded mb-2"
                    controls
                  />
                )}

                {file.type === 'audio' && (
                  <audio
                    src={file.preview}
                    className="w-full mb-2"
                    controls
                  />
                )}

                <div className="space-y-2">
                  <div>
                    <Label htmlFor={`caption-${index}`} className="text-xs">Caption</Label>
                    <Input
                      id={`caption-${index}`}
                      value={file.caption || ''}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      placeholder="Add a caption..."
                      className="text-sm"
                    />
                  </div>

                  {file.type === 'image' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scanImage(index)}
                        disabled={isScanning}
                        className="flex-1 text-xs"
                      >
                        <ScanIcon className="h-3 w-3 mr-1" />
                        OCR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateCaption(index)}
                        className="flex-1 text-xs"
                      >
                        AI Caption
                      </Button>
                    </div>
                  )}

                  {file.ocrText && (
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium mb-1">Extracted Text:</p>
                      <p className="text-gray-600">{file.ocrText.substring(0, 100)}...</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {file.file.name} ({Math.round(file.file.size / 1024)}KB)
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}