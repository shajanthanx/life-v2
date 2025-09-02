'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Goal } from '@/types'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<Goal, 'id'>) => void
}

export function AddGoalModal({ isOpen, onClose, onSubmit }: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    targetValue: '',
    unit: '',
    deadline: '',
    milestones: [] as { title: string; value: string }[]
  })

  const [milestoneInput, setMilestoneInput] = useState({ title: '', value: '' })

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
    
    const newGoal: Omit<Goal, 'id'> = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      targetValue: Number(formData.targetValue),
      currentValue: 0,
      unit: formData.unit,
      deadline: new Date(formData.deadline),
      isCompleted: false,
      createdAt: new Date(),
      milestones: formData.milestones.map((milestone, index) => ({
        id: `milestone-${index}`,
        title: milestone.title,
        value: Number(milestone.value),
        isCompleted: false
      }))
    }

    onSubmit(newGoal)
    onClose()
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetValue: '',
      unit: '',
      deadline: '',
      milestones: []
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal (optional)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
            >
              <option value="personal">Personal</option>
              <option value="fitness">Fitness</option>
              <option value="learning">Learning</option>
              <option value="career">Career</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <Input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                placeholder="Enter target"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., books, kg, hours"
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

          {/* Milestones */}
          <div>
            <label className="text-sm font-medium">Milestones</label>
            <div className="space-y-2 mt-2">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{milestone.title} ({milestone.value} {formData.unit})</span>
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
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Milestone title"
                  value={milestoneInput.title}
                  onChange={(e) => setMilestoneInput(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={milestoneInput.value}
                  onChange={(e) => setMilestoneInput(prev => ({ ...prev, value: e.target.value }))}
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMilestone}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
