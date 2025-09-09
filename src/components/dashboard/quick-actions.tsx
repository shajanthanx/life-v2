'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock, BookOpen, DollarSign, Target, Heart } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const { enabledModules, isLoading } = useSettings()

  const allActions = [
    {
      id: 'add-task',
      label: 'Add Task',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Create a new task',
      module: 'tasks'
    },
    {
      id: 'log-habit',
      label: 'Log Habit',
      icon: Clock,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Update habit progress',
      module: 'habits'
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: DollarSign,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Record new expense',
      module: 'finance'
    },
    {
      id: 'journal-entry',
      label: 'Journal',
      icon: BookOpen,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Write a journal entry',
      module: 'lifestyle'
    },
    {
      id: 'set-goal',
      label: 'New Goal',
      icon: Target,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Set a new goal',
      module: 'goals'
    },
    {
      id: 'health-log',
      label: 'Health Log',
      icon: Heart,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Record health metrics',
      module: 'health'
    }
  ]

  // Filter actions based on enabled modules
  const actions = enabledModules.length === 0 
    ? allActions // Show all if no settings found
    : allActions.filter(action => 
        !action.module || enabledModules.includes(action.module)
      )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="text-sm text-muted-foreground">Loading actions...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
                onClick={() => onAction(action.id)}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{action.description}</div>
                </div>
              </Button>
            )
          })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
