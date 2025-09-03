'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JournalEntry } from '@/types'
import { uploadJournalImage } from '@/lib/image-utils'
import { useToast } from '@/components/ui/use-toast'

interface AddJournalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: Omit<JournalEntry, 'id'>) => void
}

export function AddJournalModal({ isOpen, onClose, onSubmit }: AddJournalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 3 as 1 | 2 | 3 | 4 | 5,
    tags: [] as string[],
    image: ''
  })

  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      alert('Please write something in your journal')
      return
    }

    const newEntry: Omit<JournalEntry, 'id'> = {
      title: formData.title || undefined,
      content: formData.content,
      date: new Date(),
      mood: formData.mood,
      tags: formData.tags,
      image: formData.image || undefined
    }

    onSubmit(newEntry)
    onClose()
    setFormData({
      title: '',
      content: '',
      mood: 3,
      tags: [],
      image: ''
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄']
    return emojis[mood - 1] || '😐'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              placeholder="Give your entry a title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">How are you feeling? {getMoodEmoji(formData.mood)}</label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <Button
                  key={mood}
                  type="button"
                  size="sm"
                  variant={formData.mood === mood ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, mood: mood as 1 | 2 | 3 | 4 | 5 }))}
                >
                  {getMoodEmoji(mood)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Journal Entry</label>
            <textarea
              className="w-full p-3 border rounded-md text-sm min-h-[200px]"
              placeholder="What's on your mind today? Write about your thoughts, experiences, gratitude, goals, or anything else..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex space-x-2 mt-1">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Photo/Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 border rounded-md text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setUploading(true)
                  try {
                    const result = await uploadJournalImage(file)
                    if (result.error) {
                      addToast({
                        type: 'error',
                        title: 'Upload Error',
                        message: result.error
                      })
                    } else if (result.url) {
                      setFormData(prev => ({ ...prev, image: result.url! }))
                      addToast({
                        type: 'success',
                        message: 'Image uploaded successfully!'
                      })
                    }
                  } catch (error) {
                    addToast({
                      type: 'error',
                      title: 'Upload Error',
                      message: 'Failed to upload image'
                    })
                  } finally {
                    setUploading(false)
                  }
                }
              }}
              disabled={uploading}
            />
            {uploading && (
              <div className="mt-2 text-sm text-blue-600">
                Uploading image...
              </div>
            )}
            {formData.image && !uploading && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Journal entry preview" 
                  className="w-32 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
