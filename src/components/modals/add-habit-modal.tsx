'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Habit } from '@/types'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (habit: Omit<Habit, 'id'>) => void
}

export function AddHabitModal({ isOpen, onClose, onSubmit }: AddHabitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health' as Habit['category'],
    frequency: 'daily' as Habit['frequency'],
    targetValue: '',
    hasNumericValue: false,
    unit: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a habit name')
      return
    }

    const newHabit: Omit<Habit, 'id'> = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      frequency: formData.frequency,
      targetValue: formData.hasNumericValue ? Number(formData.targetValue) || 1 : 1,
      isActive: true,
      createdAt: new Date(),
      hasNumericValue: formData.hasNumericValue,
      unit: formData.hasNumericValue ? formData.unit : undefined,
      records: []
    }

    onSubmit(newHabit)
    onClose()
    setFormData({
      name: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      targetValue: '',
      hasNumericValue: false,
      unit: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              placeholder="Additional details about this habit"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Habit['category'] }))}
            >
              <option value="health">Health</option>
              <option value="productivity">Productivity</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="fitness">Fitness</option>
              <option value="learning">Learning</option>
              <option value="social">Social</option>
              <option value="creativity">Creativity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Frequency</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as Habit['frequency'] }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasNumericValue"
              checked={formData.hasNumericValue}
              onChange={(e) => setFormData(prev => ({ ...prev, hasNumericValue: e.target.checked }))}
            />
            <label htmlFor="hasNumericValue" className="text-sm font-medium">
              Track numeric value (e.g., glasses of water, minutes exercised)
            </label>
          </div>

          {formData.hasNumericValue && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Target Value</label>
                <Input
                  type="number"
                  placeholder="8"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  placeholder="glasses, minutes, pages"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
