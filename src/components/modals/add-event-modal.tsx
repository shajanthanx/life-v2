'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Event } from '@/types'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: Omit<Event, 'id'>) => void
}

export function AddEventModal({ isOpen, onClose, onSubmit }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    attendees: [] as string[],
    budget: '',
    status: 'planning' as Event['status'],
    category: 'personal' as Event['category']
  })

  const [newAttendee, setNewAttendee] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.date) {
      alert('Please fill in event name and date')
      return
    }

    const newEvent: Omit<Event, 'id'> = {
      name: formData.name,
      description: formData.description || undefined,
      date: new Date(formData.date),
      location: formData.location || undefined,
      attendees: formData.attendees,
      budget: Number(formData.budget) || 0,
      spent: 0,
      status: formData.status,
      category: formData.category,
      createdAt: new Date()
    }

    onSubmit(newEvent)
    onClose()
    setFormData({
      name: '',
      description: '',
      date: '',
      location: '',
      attendees: [],
      budget: '',
      status: 'planning',
      category: 'personal'
    })
  }

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }))
      setNewAttendee('')
    }
  }

  const removeAttendee = (attendeeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(attendee => attendee !== attendeeToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Name</label>
            <Input
              placeholder="e.g., Birthday Party, Anniversary Dinner"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Event details and plans..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Budget</label>
              <Input
                type="number"
                step="0.01"
                placeholder="500.00"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location (optional)</label>
            <Input
              placeholder="e.g., Restaurant Name, Park, Home"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
            >
              <option value="personal">Personal</option>
              <option value="family">Family</option>
              <option value="work">Work</option>
              <option value="social">Social</option>
              <option value="celebration">Celebration</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Attendees</label>
            <div className="flex space-x-2 mt-1">
              <Input
                placeholder="Add attendee name..."
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAttendee()
                  }
                }}
              />
              <Button type="button" onClick={addAttendee} size="sm">
                Add
              </Button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.attendees.map((attendee) => (
                  <span
                    key={attendee}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary cursor-pointer"
                    onClick={() => removeAttendee(attendee)}
                  >
                    {attendee} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Plan Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
