'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { LoadingOverlay } from '@/components/ui/loading-spinner'
import { Plus, Calendar, Clock, AlertCircle, CheckCircle2, Filter, Edit2, Trash2 } from 'lucide-react'
import { Task } from '@/types'
import { formatDate } from '@/lib/utils'

interface TasksViewProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onAddTask: () => void
  isLoading?: boolean
}

export function TasksView({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete, onAddTask, isLoading = false }: TasksViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const now = new Date()
  
  const filteredTasks = tasks.filter(task => {
    // Status filter
    let statusMatch = true
    switch (filter) {
      case 'pending':
        statusMatch = !task.isCompleted
        break
      case 'completed':
        statusMatch = task.isCompleted
        break
      case 'overdue':
        statusMatch = !task.isCompleted && task.dueDate && new Date(task.dueDate) < now
        break
    }

    // Category filter
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter

    return statusMatch && categoryMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-700'
      case 'health':
        return 'bg-green-100 text-green-700'
      case 'errands':
        return 'bg-purple-100 text-purple-700'
      case 'personal':
        return 'bg-orange-100 text-orange-700'
      case 'finance':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const isOverdue = (task: Task) => {
    return !task.isCompleted && task.dueDate && new Date(task.dueDate) < now
  }

  const isDueToday = (task: Task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate.toDateString() === now.toDateString()
  }

  const handleTaskToggle = (task: Task) => {
    const updatedTask = {
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date() : undefined
    }
    onTaskUpdate(updatedTask)
  }

  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-muted-foreground">Organize and track your daily tasks</p>
        </div>
        <Button onClick={onAddTask} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
            { key: 'overdue', label: 'Overdue' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <LoadingOverlay isLoading={isLoading}>
        <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transition-all ${
              task.isCompleted 
                ? 'bg-green-50 border-green-200 opacity-75' 
                : isOverdue(task)
                ? 'bg-red-50 border-red-200'
                : isDueToday(task)
                ? 'bg-yellow-50 border-yellow-200'
                : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <div className="flex items-center pt-1">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => handleTaskToggle(task)}
                    className="h-5 w-5"
                  />
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 mt-2">
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 text-xs ${
                            isOverdue(task) ? 'text-red-600' : 
                            isDueToday(task) ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {isOverdue(task) ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <Calendar className="h-3 w-3" />
                            )}
                            <span>
                              {isDueToday(task) ? 'Due today' : 
                               isOverdue(task) ? `Overdue (${formatDate(new Date(task.dueDate))})` :
                               `Due ${formatDate(new Date(task.dueDate))}`}
                            </span>
                          </div>
                        )}
                        
                        {task.isRecurring && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Repeats {task.recurringPattern}</span>
                          </div>
                        )}

                        {task.completedAt && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed {formatDate(task.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getCategoryColor(task.category)}>
                        {task.category}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </Badge>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onTaskEdit(task)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(task.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </LoadingOverlay>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start by creating your first task to stay organized."
                : `No ${filter} tasks found. Try changing the filter.`}
            </p>
            <Button onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          if (showDeleteConfirm) {
            onTaskDelete(showDeleteConfirm)
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
