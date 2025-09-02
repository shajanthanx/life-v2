'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Task } from '@/types'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Task) => void
  task: Task | null
}

export function EditTaskModal({ isOpen, onClose, onSubmit, task }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    isRecurring: false,
    recurringPattern: 'weekly' as Task['recurringPattern']
  })

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        isRecurring: task.isRecurring,
        recurringPattern: task.recurringPattern || 'weekly'
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!task) return

    const updatedTask: Task = {
      ...task,
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined
    }

    onSubmit(updatedTask)
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueDate: '',
      isRecurring: false,
      recurringPattern: 'weekly'
    })
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
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
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="errands">Errands</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date (optional)</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Recurring task
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="text-sm font-medium">Repeat pattern</label>
                <select
                  value={formData.recurringPattern}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value as Task['recurringPattern'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
