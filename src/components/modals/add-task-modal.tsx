'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Task } from '@/types'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id'>) => void
}

export function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    isRecurring: false,
    recurringPattern: 'daily' as Task['recurringPattern']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTask: Omit<Task, 'id'> = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      isCompleted: false,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
      createdAt: new Date()
    }

    onSubmit(newTask)
    onClose()
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueDate: '',
      isRecurring: false,
      recurringPattern: 'daily'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
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
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="errands">Errands</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm font-medium">Recurring task</label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={formData.recurringPattern}
                onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value as Task['recurringPattern'] }))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
