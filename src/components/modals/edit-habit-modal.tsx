'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Habit } from '@/types'

interface EditHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (habit: Habit) => void
  habit: Habit | null
}

export function EditHabitModal({ isOpen, onClose, onSubmit, habit }: EditHabitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health' as Habit['category'],
    frequency: 'daily' as Habit['frequency'],
    color: '#3b82f6',
    isActive: true
  })

  // Populate form when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        frequency: habit.frequency,
        color: habit.color || '#3b82f6',
        isActive: habit.isActive
      })
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!habit) return

    const updatedHabit: Habit = {
      ...habit,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      frequency: formData.frequency,
      color: formData.color,
      isActive: formData.isActive
    }

    onSubmit(updatedHabit)
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      color: '#3b82f6',
      isActive: true
    })
  }

  if (!habit) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter habit name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter habit description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Habit['category'] }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="health">Health</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="fitness">Fitness</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="social">Social</option>
                <option value="creative">Creative</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as Habit['frequency'] }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 border rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active habit
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
