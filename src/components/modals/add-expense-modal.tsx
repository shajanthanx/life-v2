'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Transaction } from '@/types'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
}

export function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food' as Transaction['category'],
    type: 'expense' as Transaction['type']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category,
      type: formData.type,
      date: new Date()
    }

    onSubmit(newTransaction)
    onClose()
    setFormData({
      description: '',
      amount: '',
      category: 'food',
      type: 'expense'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="e.g., Lunch at restaurant"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Transaction['category'] }))}
            >
              <option value="food">Food & Dining</option>
              <option value="transportation">Transportation</option>
              <option value="housing">Housing</option>
              <option value="utilities">Utilities</option>
              <option value="healthcare">Healthcare</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="education">Education</option>
              <option value="personal">Personal Care</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Transaction['type'] }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add {formData.type === 'expense' ? 'Expense' : 'Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
