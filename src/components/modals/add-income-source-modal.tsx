'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IncomeSource } from '@/types'

interface AddIncomeSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (source: Omit<IncomeSource, 'id'>) => void
}

export function AddIncomeSourceModal({ isOpen, onClose, onSubmit }: AddIncomeSourceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'salary' as IncomeSource['type'],
    amount: '',
    frequency: 'monthly' as IncomeSource['frequency'],
    nextPayDate: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.amount) {
      alert('Please fill in name and amount')
      return
    }

    const newSource: Omit<IncomeSource, 'id'> = {
      name: formData.name,
      type: formData.type,
      amount: Number(formData.amount),
      frequency: formData.frequency,
      nextPayDate: formData.nextPayDate ? new Date(formData.nextPayDate) : undefined,
      isActive: true,
      description: formData.description || undefined,
      createdAt: new Date()
    }

    onSubmit(newSource)
    onClose()
    setFormData({
      name: '',
      type: 'salary',
      amount: '',
      frequency: 'monthly',
      nextPayDate: '',
      description: ''
    })
  }

  const getMonthlyEquivalent = () => {
    if (!formData.amount) return 0
    const amount = Number(formData.amount)
    
    switch (formData.frequency) {
      case 'weekly':
        return amount * 4.33
      case 'yearly':
        return amount / 12
      case 'one-time':
        return 0
      default: // monthly
        return amount
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income Source</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Income Source Name</label>
            <Input
              placeholder="e.g., Main Job, Freelance Writing"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as IncomeSource['type'] }))}
            >
              <option value="salary">Salary</option>
              <option value="freelance">Freelance</option>
              <option value="business">Business</option>
              <option value="investment">Investment</option>
              <option value="rental">Rental</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="5000.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Frequency</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as IncomeSource['frequency'] }))}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          {formData.frequency !== 'one-time' && (
            <div>
              <label className="text-sm font-medium">Next Payment Date (optional)</label>
              <Input
                type="date"
                value={formData.nextPayDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextPayDate: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Additional details about this income source..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {formData.amount && formData.frequency !== 'one-time' && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Monthly equivalent:</strong> ${getMonthlyEquivalent().toFixed(2)}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Income Source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
