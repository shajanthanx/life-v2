'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { JournalEntry } from '@/types'

interface EditJournalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: JournalEntry) => void
  entry: JournalEntry | null
}

export function EditJournalModal({ isOpen, onClose, onSubmit, entry }: EditJournalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 3 as JournalEntry['mood'],
    tags: '',
    date: ''
  })

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags.join(', '),
        date: entry.date.toISOString().split('T')[0]
      })
    }
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!entry) return

    const updatedEntry: JournalEntry = {
      ...entry,
      title: formData.title || undefined,
      content: formData.content,
      mood: formData.mood,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      date: new Date(formData.date)
    }

    onSubmit(updatedEntry)
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      title: '',
      content: '',
      mood: 3,
      tags: '',
      date: ''
    })
  }

  if (!entry) return null

  const moodEmojis = {
    1: '😢',
    2: '😕', 
    3: '😐',
    4: '😊',
    5: '😄'
  }

  const moodLabels = {
    1: 'Very Sad',
    2: 'Sad',
    3: 'Neutral', 
    4: 'Happy',
    5: 'Very Happy'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Journal Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for this entry"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write about your day, thoughts, feelings..."
              rows={8}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mood</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: mood as JournalEntry['mood'] }))}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    formData.mood === mood
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[mood as keyof typeof moodEmojis]}</div>
                  <div className="text-xs">{moodLabels[mood as keyof typeof moodLabels]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="work, personal, travel, health (comma separated)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate tags with commas
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
