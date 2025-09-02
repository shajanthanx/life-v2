'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Goal } from '@/types'

interface EditGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Goal) => void
  goal: Goal | null
}

export function EditGoalModal({ isOpen, onClose, onSubmit, goal }: EditGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    targetValue: '',
    currentValue: '',
    unit: '',
    deadline: '',
    milestones: [] as { title: string; value: string }[]
  })

  const [milestoneInput, setMilestoneInput] = useState({ title: '', value: '' })

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        targetValue: goal.targetValue.toString(),
        currentValue: goal.currentValue.toString(),
        unit: goal.unit,
        deadline: goal.deadline.toISOString().split('T')[0],
        milestones: goal.milestones.map(m => ({
          title: m.title,
          value: m.value.toString()
        }))
      })
    }
  }, [goal])

  const handleAddMilestone = () => {
    if (milestoneInput.title && milestoneInput.value) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestoneInput]
      }))
      setMilestoneInput({ title: '', value: '' })
    }
  }

  const handleRemoveMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!goal) return

    const updatedGoal: Goal = {
      ...goal,
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      targetValue: Number(formData.targetValue),
      currentValue: Number(formData.currentValue),
      unit: formData.unit,
      deadline: new Date(formData.deadline),
      milestones: formData.milestones.map((milestone, index) => ({
        id: goal.milestones[index]?.id || `milestone-${index}`,
        title: milestone.title,
        value: Number(milestone.value),
        isCompleted: goal.milestones[index]?.isCompleted || false,
        completedAt: goal.milestones[index]?.completedAt
      }))
    }

    onSubmit(updatedGoal)
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetValue: '',
      currentValue: '',
      unit: '',
      deadline: '',
      milestones: []
    })
    setMilestoneInput({ title: '', value: '' })
  }

  if (!goal) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="personal">Personal</option>
                <option value="fitness">Fitness</option>
                <option value="learning">Learning</option>
                <option value="career">Career</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter goal description (optional)"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <Input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                placeholder="100"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <Input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="books, lbs, hours"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              required
            />
          </div>

          {/* Milestones Section */}
          <div>
            <label className="text-sm font-medium">Milestones</label>
            
            {/* Add Milestone */}
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="Milestone title"
                value={milestoneInput.title}
                onChange={(e) => setMilestoneInput(prev => ({ ...prev, title: e.target.value }))}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Value"
                value={milestoneInput.value}
                onChange={(e) => setMilestoneInput(prev => ({ ...prev, value: e.target.value }))}
                className="w-24"
              />
              <Button type="button" onClick={handleAddMilestone} size="sm">
                Add
              </Button>
            </div>

            {/* Existing Milestones */}
            {formData.milestones.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {milestone.title} - {milestone.value} {formData.unit}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
