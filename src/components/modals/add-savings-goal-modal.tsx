'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SavingsGoal } from '@/types'

interface AddSavingsGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<SavingsGoal, 'id'>) => void
}

export function AddSavingsGoalModal({ isOpen, onClose, onSubmit }: AddSavingsGoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'emergency' as SavingsGoal['category']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.targetAmount || !formData.deadline) {
      alert('Please fill in all required fields')
      return
    }

    const newGoal: Omit<SavingsGoal, 'id'> = {
      name: formData.name,
      description: formData.description || undefined,
      targetAmount: Number(formData.targetAmount),
      currentAmount: 0,
      deadline: new Date(formData.deadline),
      category: formData.category,
      isCompleted: false,
      createdAt: new Date()
    }

    onSubmit(newGoal)
    onClose()
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: 'emergency'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Savings Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Name</label>
            <Input
              placeholder="e.g., Emergency Fund"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              placeholder="What is this savings goal for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Target Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="5000.00"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Target Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as SavingsGoal['category'] }))}
            >
              <option value="emergency">Emergency Fund</option>
              <option value="vacation">Vacation</option>
              <option value="house">House/Property</option>
              <option value="car">Car/Vehicle</option>
              <option value="education">Education</option>
              <option value="retirement">Retirement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm">
            <p><strong>Monthly savings needed:</strong></p>
            <p>
              {formData.targetAmount && formData.deadline ? (
                (() => {
                  const target = Number(formData.targetAmount)
                  const deadline = new Date(formData.deadline)
                  const now = new Date()
                  const monthsLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
                  const monthlyAmount = target / monthsLeft
                  return `$${monthlyAmount.toFixed(2)} per month for ${monthsLeft} months`
                })()
              ) : (
                'Enter target amount and deadline to calculate'
              )}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Savings Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
