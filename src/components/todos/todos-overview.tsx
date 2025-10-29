'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Todo } from '@/types'
import { CheckCircle2, Circle, Plus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TodosOverviewProps {
  todos: Todo[]
  onNavigateToTodos?: () => void
  onAddTodo?: () => void
}

export function TodosOverview({ todos, onNavigateToTodos, onAddTodo }: TodosOverviewProps) {
  const activeTodos = todos.filter(t => !t.isCompleted)
  const highPriorityTodos = activeTodos.filter(t => t.priority === 'high')
  const completedTodos = todos.filter(t => t.isCompleted)

  const completionRate = todos.length > 0
    ? Math.round((completedTodos.length / todos.length) * 100)
    : 0

  // Get top 5 active todos
  const displayTodos = activeTodos.slice(0, 5)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200'
      case 'medium':
        return 'text-orange-500 bg-orange-50 border-orange-200'
      case 'low':
        return 'text-blue-500 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Todos</CardTitle>
        <div className="flex items-center gap-2">
          {onAddTodo && (
            <Button size="sm" onClick={onAddTodo} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
          {onNavigateToTodos && (
            <Button variant="ghost" size="sm" onClick={onNavigateToTodos}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{activeTodos.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{highPriorityTodos.length}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Todo List */}
        {displayTodos.length > 0 ? (
          <div className="space-y-2 pt-2">
            {displayTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <Circle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{todo.title}</p>
                  <Badge
                    variant="outline"
                    className={cn("text-xs mt-1", getPriorityColor(todo.priority))}
                  >
                    {todo.priority}
                  </Badge>
                </div>
              </div>
            ))}
            {activeTodos.length > 5 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                +{activeTodos.length - 5} more todos
              </p>
            )}
          </div>
        ) : todos.length > 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">All todos completed!</p>
            <p className="text-xs text-muted-foreground mt-1">Great job staying on top of things</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">No todos yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first todo to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
