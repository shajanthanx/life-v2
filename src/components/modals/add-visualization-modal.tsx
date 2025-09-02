'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Visualization } from '@/types'

interface AddVisualizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (visualization: Omit<Visualization, 'id'>) => void
}

export function AddVisualizationModal({ isOpen, onClose, onSubmit }: AddVisualizationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Visualization['category'],
    targetDate: '',
    notes: '',
    image: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in title and description')
      return
    }

    const newVisualization: Omit<Visualization, 'id'> = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      isAchieved: false,
      progress: 0,
      createdAt: new Date(),
      notes: formData.notes || undefined,
      image: formData.image || undefined
    }

    onSubmit(newVisualization)
    onClose()
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetDate: '',
      notes: '',
      image: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Visualization</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g., Dream Home"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[80px]"
              placeholder="Describe your vision in detail. What does it look like? How does it feel? Be specific..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Visualization['category'] }))}
            >
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="relationships">Relationships</option>
              <option value="travel">Travel</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="spiritual">Spiritual</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Target Date (optional)</label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Additional Notes (optional)</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Any additional thoughts, action steps, or inspiration..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Vision Board Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 border rounded-md text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = () => {
                    setFormData(prev => ({ ...prev, image: reader.result as string }))
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Visualization preview" 
                  className="w-32 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-blue-800">
              💡 <strong>Tip:</strong> The more vivid and specific your visualization, 
              the more powerful it becomes. Include emotions, colors, sounds, and feelings!
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Visualization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
