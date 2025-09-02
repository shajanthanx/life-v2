'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BadHabit } from '@/types'

interface AddBadHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (badHabit: Omit<BadHabit, 'id'>) => void
}

export function AddBadHabitModal({ isOpen, onClose, onSubmit }: AddBadHabitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health' as BadHabit['category'],
    costPerInstance: '',
    healthImpact: 'medium' as BadHabit['healthImpact'],
    targetReduction: '',
    unit: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a habit name')
      return
    }

    const newBadHabit: Omit<BadHabit, 'id'> = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      costPerInstance: Number(formData.costPerInstance) || 0,
      healthImpact: formData.healthImpact,
      targetReduction: Number(formData.targetReduction) || 0,
      unit: formData.unit || undefined,
      isActive: true,
      createdAt: new Date(),
      records: []
    }

    onSubmit(newBadHabit)
    onClose()
    setFormData({
      name: '',
      description: '',
      category: 'health',
      costPerInstance: '',
      healthImpact: 'medium',
      targetReduction: '',
      unit: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Track Bad Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              placeholder="e.g., Smoking, Eating Junk Food, Social Media"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Describe what you want to reduce or eliminate..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as BadHabit['category'] }))}
            >
              <option value="health">Health</option>
              <option value="financial">Financial</option>
              <option value="productivity">Productivity</option>
              <option value="social">Social</option>
              <option value="digital">Digital/Screen Time</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Health Impact</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.healthImpact}
              onChange={(e) => setFormData(prev => ({ ...prev, healthImpact: e.target.value as BadHabit['healthImpact'] }))}
            >
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
              <option value="severe">Severe Impact</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Cost Per Instance</label>
              <Input
                type="number"
                step="0.01"
                placeholder="5.00"
                value={formData.costPerInstance}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerInstance: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Cost each time you engage in this habit</p>
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                placeholder="cigarettes, hours, times"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Target Reduction Goal</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.targetReduction}
              onChange={(e) => setFormData(prev => ({ ...prev, targetReduction: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target amount per day/week (0 = complete elimination)
            </p>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <p className="text-orange-800">
              <strong>💪 Remember:</strong> Tracking bad habits helps you become aware of patterns 
              and gradually reduce them. Small reductions add up to big changes!
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Start Tracking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
