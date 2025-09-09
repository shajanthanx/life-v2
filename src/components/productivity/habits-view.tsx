'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { LoadingOverlay } from '@/components/ui/loading-spinner'
import { LogHabitModal } from '../modals/log-habit-modal'
import { Plus, Calendar, Flame, Target, TrendingUp, CheckCircle2, Edit2, Trash2, Clock } from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { calculateStreak, formatDate } from '@/lib/utils'

interface HabitsViewProps {
  habits: Habit[]
  onHabitUpdate: (habit: Habit) => void
  onHabitEdit: (habit: Habit) => void
  onHabitDelete: (habitId: string) => void
  onAddHabit: () => void
  isLoading?: boolean
}

export function HabitsView({ habits, onHabitUpdate, onHabitEdit, onHabitDelete, onAddHabit, isLoading = false }: HabitsViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [logHabitModal, setLogHabitModal] = useState<{
    isOpen: boolean
    habit: Habit | null
    initialDate?: Date
  }>({
    isOpen: false,
    habit: null
  })

  const filteredHabits = habits.filter(habit => {
    switch (filter) {
      case 'active':
        return habit.isActive
      case 'inactive':
        return !habit.isActive
      default:
        return true
    }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health':
        return 'bg-green-100 text-green-700'
      case 'productivity':
        return 'bg-blue-100 text-blue-700'
      case 'mindfulness':
        return 'bg-purple-100 text-purple-700'
      case 'fitness':
        return 'bg-orange-100 text-orange-700'
      case 'learning':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getHabitStreak = (habit: Habit) => {
    const recentRecords = habit.records
      .filter(record => record.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let streak = 0
    const now = new Date()
    for (let i = 0; i < recentRecords.length; i++) {
      const recordDate = new Date(recentRecords[i].date)
      const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getCompletionRate = (habit: Habit, days: number = 7) => {
    const recentRecords = habit.records
      .filter(record => {
        const recordDate = new Date(record.date)
        const daysDiff = (new Date().getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= days
      })
    
    if (recentRecords.length === 0) return 0
    
    const completedRecords = recentRecords.filter(record => record.isCompleted)
    return (completedRecords.length / Math.min(recentRecords.length, days)) * 100
  }

  const getTodayRecord = (habit: Habit) => {
    const today = new Date().toDateString()
    return habit.records.find(record => 
      new Date(record.date).toDateString() === today
    )
  }

  const handleLogHabit = (habit: Habit, initialDate?: Date) => {
    setLogHabitModal({
      isOpen: true,
      habit,
      initialDate
    })
  }

  const handleLogHabitSuccess = (updatedRecord: HabitRecord) => {
    const habit = logHabitModal.habit
    if (!habit) return

    // Update the habit with the new/updated record
    const existingRecordIndex = habit.records.findIndex(
      record => formatDate(record.date, 'yyyy-MM-dd') === formatDate(updatedRecord.date, 'yyyy-MM-dd')
    )

    let updatedRecords: HabitRecord[]
    if (existingRecordIndex >= 0) {
      // Update existing record
      updatedRecords = habit.records.map((record, index) =>
        index === existingRecordIndex ? updatedRecord : record
      )
    } else {
      // Add new record
      updatedRecords = [...habit.records, updatedRecord]
    }

    const updatedHabit: Habit = {
      ...habit,
      records: updatedRecords
    }

    onHabitUpdate(updatedHabit)
  }

  const closeLogHabitModal = () => {
    setLogHabitModal({
      isOpen: false,
      habit: null
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Habits</h2>
          <p className="text-muted-foreground">Build positive routines and track your consistency</p>
        </div>
        <Button onClick={onAddHabit} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Habits' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' }
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

      {/* Habits Grid */}
      <LoadingOverlay isLoading={isLoading}>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredHabits.map((habit) => {
          const streak = getHabitStreak(habit)
          const completionRate = getCompletionRate(habit)
          const todayRecord = getTodayRecord(habit)
          const todayProgress = todayRecord?.isCompleted ? 100 : 0
          
          return (
            <Card key={habit.id} className={!habit.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span>{habit.name}</span>
                    </CardTitle>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    )}
                  </div>
                  <Badge className={getCategoryColor(habit.category)}>
                    {habit.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Today's Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Today's Status</span>
                    <span className="text-sm text-muted-foreground">
                      {todayRecord?.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <Progress value={todayProgress} style={{ color: habit.color }} />
                  {todayRecord?.isCompleted && (
                    <div className="flex items-center space-x-1 mt-1 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Completed today!</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">Streak</span>
                    </div>
                    <div className="text-2xl font-bold">{streak}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">7-Day</span>
                    </div>
                    <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">completion</div>
                  </div>
                </div>

                {/* Quick Log */}
                {habit.isActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quick Action</span>
                      {todayRecord && (
                        <Badge variant={todayRecord.isCompleted ? "default" : "secondary"}>
                          {todayRecord.isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleLogHabit(habit)}
                      className="w-full flex items-center space-x-1"
                      variant={todayRecord?.isCompleted ? "outline" : "default"}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{todayRecord?.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}</span>
                    </Button>
                  </div>
                )}

                {/* Frequency */}
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Frequency: {habit.frequency}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => onHabitEdit(habit)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Open modal for yesterday or custom date
                      const yesterday = new Date()
                      yesterday.setDate(yesterday.getDate() - 1)
                      handleLogHabit(habit, yesterday)
                    }}
                    title="Log for past dates"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Past
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(habit.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </LoadingOverlay>

      {filteredHabits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No habits found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start by creating your first habit to build positive routines."
                : `No ${filter} habits found. Try changing the filter.`}
            </p>
            <Button onClick={onAddHabit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
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
            onHabitDelete(showDeleteConfirm)
          }
        }}
        title="Delete Habit"
        description="Are you sure you want to delete this habit? This action cannot be undone and will also delete all progress records."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Log Habit Modal */}
      <LogHabitModal
        isOpen={logHabitModal.isOpen}
        onClose={closeLogHabitModal}
        habit={logHabitModal.habit}
        onSuccess={handleLogHabitSuccess}
        initialDate={logHabitModal.initialDate}
      />
    </div>
  )
}
