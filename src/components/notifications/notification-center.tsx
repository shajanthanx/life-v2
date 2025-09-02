'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppState } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  Bell, 
  X, 
  Calendar, 
  Target, 
  DollarSign, 
  Heart, 
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp
} from 'lucide-react'

interface NotificationCenterProps {
  data: AppState
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: string) => void
}

type Notification = {
  id: string
  type: 'deadline' | 'budget' | 'goal' | 'habit' | 'achievement' | 'reminder'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  date: Date
  actionTab?: string
  icon: any
}

export function NotificationCenter({ data, isOpen, onClose, onNavigate }: NotificationCenterProps) {
  const notifications = useMemo(() => {
    const notifs: Notification[] = []
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Goal deadline notifications
    data.goals?.forEach(goal => {
      if (!goal.isCompleted && goal.deadline) {
        const deadline = new Date(goal.deadline)
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= 0) {
          notifs.push({
            id: `goal-overdue-${goal.id}`,
            type: 'deadline',
            title: 'Goal Overdue',
            description: `"${goal.title}" deadline has passed`,
            priority: 'high',
            date: deadline,
            actionTab: 'productivity',
            icon: Target
          })
        } else if (daysUntil <= 3) {
          notifs.push({
            id: `goal-deadline-${goal.id}`,
            type: 'deadline',
            title: 'Goal Deadline Approaching',
            description: `"${goal.title}" is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            priority: daysUntil === 1 ? 'high' : 'medium',
            date: deadline,
            actionTab: 'productivity',
            icon: Target
          })
        }
      }
    })

    // Task deadline notifications
    data.tasks?.forEach(task => {
      if (!task.isCompleted && task.dueDate) {
        const dueDate = new Date(task.dueDate)
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= 0) {
          notifs.push({
            id: `task-overdue-${task.id}`,
            type: 'deadline',
            title: 'Task Overdue',
            description: `"${task.title}" was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''} ago`,
            priority: 'high',
            date: dueDate,
            actionTab: 'productivity',
            icon: CheckCircle
          })
        } else if (daysUntil <= 2) {
          notifs.push({
            id: `task-deadline-${task.id}`,
            type: 'deadline',
            title: 'Task Due Soon',
            description: `"${task.title}" is due ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
            priority: daysUntil === 1 ? 'high' : 'medium',
            date: dueDate,
            actionTab: 'productivity',
            icon: CheckCircle
          })
        }
      }
    })

    // Budget notifications
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const monthlyBudgets = data.budgets?.filter(b => b.month === currentMonth && b.year === currentYear) || []
    
    monthlyBudgets.forEach(budget => {
      const percentage = (budget.spent / budget.allocated) * 100
      
      if (percentage >= 100) {
        notifs.push({
          id: `budget-exceeded-${budget.id}`,
          type: 'budget',
          title: 'Budget Exceeded',
          description: `${budget.category} budget exceeded by ${formatCurrency(budget.spent - budget.allocated)}`,
          priority: 'high',
          date: today,
          actionTab: 'finance',
          icon: DollarSign
        })
      } else if (percentage >= 90) {
        notifs.push({
          id: `budget-warning-${budget.id}`,
          type: 'budget',
          title: 'Budget Alert',
          description: `${budget.category} budget is ${percentage.toFixed(0)}% used`,
          priority: 'medium',
          date: today,
          actionTab: 'finance',
          icon: DollarSign
        })
      }
    })

    // Goal achievement notifications
    data.goals?.forEach(goal => {
      const progressPercentage = (goal.currentValue / goal.targetValue) * 100
      
      if (progressPercentage >= 100 && !goal.isCompleted) {
        notifs.push({
          id: `goal-achieved-${goal.id}`,
          type: 'achievement',
          title: '🎉 Goal Achieved!',
          description: `You've completed "${goal.title}"`,
          priority: 'medium',
          date: today,
          actionTab: 'productivity',
          icon: Target
        })
      } else if (progressPercentage >= 75 && progressPercentage < 90) {
        notifs.push({
          id: `goal-progress-${goal.id}`,
          type: 'goal',
          title: 'Goal Progress',
          description: `"${goal.title}" is ${progressPercentage.toFixed(0)}% complete`,
          priority: 'low',
          date: today,
          actionTab: 'productivity',
          icon: TrendingUp
        })
      }
    })

    // Habit streak notifications
    data.habits?.forEach(habit => {
      const recentRecords = habit.records.slice(0, 7)
      const streak = recentRecords.filter(r => r.isCompleted).length
      
      if (streak >= 7) {
        notifs.push({
          id: `habit-streak-${habit.id}`,
          type: 'achievement',
          title: '🔥 Habit Streak!',
          description: `${streak} day streak for "${habit.name}"`,
          priority: 'low',
          date: today,
          actionTab: 'productivity',
          icon: Heart
        })
      }
    })

    // Health reminders
    const todayHealthRecords = data.sleepRecords?.filter(record => 
      new Date(record.date).toDateString() === today.toDateString()
    ) || []
    
    if (todayHealthRecords.length === 0 && today.getHours() >= 22) {
      notifs.push({
        id: 'health-sleep-reminder',
        type: 'reminder',
        title: 'Sleep Tracking',
        description: "Don't forget to log your sleep data",
        priority: 'low',
        date: today,
        actionTab: 'health',
        icon: Heart
      })
    }

    // Gratitude reminder
    const todayGratitude = data.gratitudeEntries?.find(entry => 
      new Date(entry.date).toDateString() === today.toDateString()
    )
    
    if (!todayGratitude && today.getHours() >= 18) {
      notifs.push({
        id: 'gratitude-reminder',
        type: 'reminder',
        title: 'Daily Gratitude',
        description: 'Take a moment to reflect on what you\'re grateful for today',
        priority: 'low',
        date: today,
        actionTab: 'lifestyle',
        icon: Heart
      })
    }

    // Sort by priority and date
    return notifs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.date.getTime() - a.date.getTime()
    })
  }, [data])

  const unreadCount = notifications.filter(n => n.priority === 'high').length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'text-red-500'
      case 'budget':
        return 'text-orange-500'
      case 'achievement':
        return 'text-green-500'
      case 'goal':
        return 'text-blue-500'
      case 'habit':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionTab) {
      onNavigate(notification.actionTab)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <Card className="w-full max-w-md mx-4 mt-16 mr-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-white/50 ${getTypeColor(notification.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
