'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift } from '@/types'

interface AddGiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (gift: Omit<Gift, 'id'>) => void
}

export function AddGiftModal({ isOpen, onClose, onSubmit }: AddGiftModalProps) {
  const [formData, setFormData] = useState({
    recipientName: '',
    relationship: 'family' as Gift['relationship'],
    occasion: '',
    giftIdea: '',
    budget: '',
    eventDate: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.recipientName.trim() || !formData.occasion.trim() || !formData.giftIdea.trim()) {
      alert('Please fill in recipient name, occasion, and gift idea')
      return
    }

    const newGift: Omit<Gift, 'id'> = {
      recipientName: formData.recipientName,
      relationship: formData.relationship,
      occasion: formData.occasion,
      giftIdea: formData.giftIdea,
      budget: Number(formData.budget) || 0,
      spent: 0,
      eventDate: formData.eventDate ? new Date(formData.eventDate) : new Date(),
      status: 'planning',
      createdAt: new Date(),
      notes: formData.notes || undefined
    }

    onSubmit(newGift)
    onClose()
    setFormData({
      recipientName: '',
      relationship: 'family',
      occasion: '',
      giftIdea: '',
      budget: '',
      eventDate: '',
      notes: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan a Gift</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipient Name</label>
            <Input
              placeholder="e.g., Mom, John, Sarah"
              value={formData.recipientName}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Relationship</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as Gift['relationship'] }))}
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="partner">Partner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Occasion</label>
            <Input
              placeholder="e.g., Birthday, Christmas, Anniversary"
              value={formData.occasion}
              onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gift Idea</label>
            <Input
              placeholder="e.g., Spa Day Package, New Watch, Book Set"
              value={formData.giftIdea}
              onChange={(e) => setFormData(prev => ({ ...prev, giftIdea: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Budget</label>
            <Input
              type="number"
              step="0.01"
              placeholder="100.00"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Event Date</label>
            <Input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Additional notes, preferences, or ideas..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="text-green-800">
              🎁 <strong>Tip:</strong> Consider their hobbies, recent mentions, 
              or things they've been wanting. Thoughtful gifts are often more meaningful than expensive ones!
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Plan Gift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
