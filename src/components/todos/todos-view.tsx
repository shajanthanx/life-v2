'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Todo, TodoChecklistItem } from '@/types'
import {
  Plus,
  GripVertical,
  ListTodo,
  Pencil,
  Trash2,
  FileText,
  Save,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TodosViewProps {
  todos: Todo[]
  onCreateTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  onDeleteTodo: (id: string) => Promise<void>
  onToggleTodo: (id: string) => Promise<void>
  onClearCompleted: () => Promise<void>
}

export function TodosView({
  todos,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
  onClearCompleted
}: TodosViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'high' | 'completed'>('all')
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<'checklist' | 'notes' | 'edit' | null>(null)

  // New todo form state
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('low')

  // Inline edit state
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('low')
  const [editDueDate, setEditDueDate] = useState('')

  // Edit state for checklist and notes sections
  const [editNotes, setEditNotes] = useState('')
  const [editChecklistItems, setEditChecklistItems] = useState<TodoChecklistItem[]>([])
  const [newChecklistItemContent, setNewChecklistItemContent] = useState('')

  const filteredTodos = todos.filter(todo => {
    switch (activeFilter) {
      case 'active':
        return !todo.isCompleted
      case 'high':
        return todo.priority === 'high' && !todo.isCompleted
      case 'completed':
        return todo.isCompleted
      default:
        return true
    }
  })

  const activeTodos = todos.filter(t => !t.isCompleted)
  const highPriorityTodos = todos.filter(t => t.priority === 'high' && !t.isCompleted)
  const completedTodos = todos.filter(t => t.isCompleted)

  const handleQuickAdd = async () => {
    if (!newTodoTitle.trim()) return

    // Use current date/time as the default deadline (same as creation date)
    const now = new Date()

    await onCreateTodo({
      title: newTodoTitle,
      priority: newTodoPriority,
      dueDate: now,
      isCompleted: false,
      position: todos.length
    })

    setNewTodoTitle('')
    setNewTodoPriority('low')
  }

  const toggleSection = (todoId: string, section: 'checklist' | 'notes' | 'edit') => {
    if (expandedTodoId === todoId && expandedSection === section) {
      // Close section
      setExpandedTodoId(null)
      setExpandedSection(null)
    } else {
      // Open section
      const todo = todos.find(t => t.id === todoId)
      if (todo) {
        if (section === 'edit') {
          setEditTitle(todo.title)
          setEditPriority(todo.priority)
          setEditDueDate(todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : '')
        } else if (section === 'notes') {
          setEditNotes(todo.notes || '')
        } else if (section === 'checklist') {
          setEditChecklistItems(todo.checklistItems || [])
          setNewChecklistItemContent('')
        }
        setExpandedTodoId(todoId)
        setExpandedSection(section)
      }
    }
  }

  const handleSave = async () => {
    if (!expandedTodoId) return

    if (expandedSection === 'edit') {
      // Save title, priority, and due date
      await onUpdateTodo(expandedTodoId, {
        title: editTitle,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate) : undefined
      })
    } else if (expandedSection === 'notes') {
      // Save notes
      await onUpdateTodo(expandedTodoId, {
        notes: editNotes || undefined
      })
    } else if (expandedSection === 'checklist') {
      // Save checklist items
      await onUpdateTodo(expandedTodoId, {
        checklistItems: editChecklistItems
      })
    }

    // Close the expanded section
    setExpandedTodoId(null)
    setExpandedSection(null)
  }

  const handleCancel = () => {
    setExpandedTodoId(null)
    setExpandedSection(null)
    setEditTitle('')
    setEditPriority('low')
    setEditDueDate('')
    setEditNotes('')
    setEditChecklistItems([])
    setNewChecklistItemContent('')
  }

  const addChecklistItem = () => {
    if (!newChecklistItemContent.trim() || !expandedTodoId) return

    const newItem: TodoChecklistItem = {
      id: `temp-${Date.now()}`,
      todoId: expandedTodoId,
      content: newChecklistItemContent,
      isCompleted: false,
      position: editChecklistItems.length,
      createdAt: new Date()
    }

    setEditChecklistItems([...editChecklistItems, newItem])
    setNewChecklistItemContent('')
  }

  const toggleChecklistItem = (itemId: string) => {
    setEditChecklistItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    )
  }

  const deleteChecklistItem = (itemId: string) => {
    setEditChecklistItems(items => items.filter(item => item.id !== itemId))
  }

  const calculateCompletion = (items: TodoChecklistItem[]) => {
    if (items.length === 0) return 0
    const completed = items.filter(item => item.isCompleted).length
    return Math.round((completed / items.length) * 100)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Todos</h2>
          <p className="text-muted-foreground">Manage your simple todo list</p>
        </div>
      </div>

      {/* Add Todo Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuickAdd()
                }
              }}
              className="flex-1"
            />
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-2 border rounded-md text-sm bg-background h-10"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button
              size="default"
              onClick={handleQuickAdd}
              className="gap-2"
              disabled={!newTodoTitle.trim()}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All ({todos.length})
        </Button>
        <Button
          variant={activeFilter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('high')}
        >
          High ({highPriorityTodos.length})
        </Button>
        <Button
          variant={activeFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('active')}
        >
          Active ({activeTodos.length})
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({completedTodos.length})
        </Button>
      </div>

      {/* Todos List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">No tasks to display</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => {
            const isExpanded = expandedTodoId === todo.id
            const checklistItems = todo.checklistItems || []
            const completion = calculateCompletion(checklistItems)

            return (
              <Card
                key={todo.id}
                className={cn(
                  "transition-all",
                  todo.isCompleted && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  {/* Main Todo Row */}
                  <div className="flex items-start gap-3 group">
                    {/* Drag Handle */}
                    <button
                      className="mt-1 opacity-0 group-hover:opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>

                    {/* Checkbox */}
                    <Checkbox
                      checked={todo.isCompleted}
                      onCheckedChange={() => onToggleTodo(todo.id)}
                      className="mt-1"
                    />

                    {/* Todo Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-medium text-base mb-1",
                          todo.isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {todo.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize", getPriorityColor(todo.priority))}
                        >
                          {todo.priority}
                        </Badge>
                        {checklistItems.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {completion}% complete
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(todo.dueDate), 'MM/dd/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSection(todo.id, 'checklist')}
                        title="Checklist"
                      >
                        <ListTodo className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSection(todo.id, 'notes')}
                        title="Notes"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSection(todo.id, 'edit')}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteTodo(todo.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Edit Section */}
                  {isExpanded && expandedSection === 'edit' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-1 block">
                            Title
                          </label>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Enter todo title"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">
                              Priority
                            </label>
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">
                              Due Date
                            </label>
                            <Input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleSave} disabled={!editTitle.trim()}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Checklist Section */}
                  {isExpanded && expandedSection === 'checklist' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add checklist item..."
                          value={newChecklistItemContent}
                          onChange={(e) => setNewChecklistItemContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addChecklistItem()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          onClick={addChecklistItem}
                          disabled={!newChecklistItemContent.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {editChecklistItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group/item">
                          <Checkbox
                            checked={item.isCompleted}
                            onCheckedChange={() => toggleChecklistItem(item.id)}
                          />
                          <span
                            className={cn(
                              'flex-1 text-sm',
                              item.isCompleted && 'line-through text-muted-foreground'
                            )}
                          >
                            {item.content}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={() => deleteChecklistItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Notes Section */}
                  {isExpanded && expandedSection === 'notes' && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <Textarea
                        placeholder="Add notes..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
