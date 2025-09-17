'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckCircle2, XCircle, Calendar, TrendingUp, 
  Target, Flame, Clock, Plus, Users, Trophy
} from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { logHabitProgress } from '@/lib/api/habits'
import { formatDate } from '@/lib/utils'
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  isToday, isSameDay, format, addDays 
} from 'date-fns'

interface HabitsOverviewProps {
  habits: Habit[]
  onHabitUpdate: (habit: Habit) => void
  onAddHabit: () => void
}

export function HabitsOverview({ habits, onHabitUpdate, onAddHabit }: HabitsOverviewProps) {
  const [isLogging, setIsLogging] = useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(new Map())
  const { addToast } = useToast()

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Filter active habits only
  const activeHabits = useMemo(() => 
    habits.filter(habit => habit.isActive), 
    [habits]
  )

  // Today's habit status (with optimistic updates)
  const todaysStatus = useMemo(() => {
    const completed: Habit[] = []
    const pending: Habit[] = []

    activeHabits.forEach(habit => {
      // Check optimistic update first, then actual record
      const optimisticState = optimisticUpdates.get(habit.id)
      const todayRecord = habit.records.find(record => 
        isToday(record.date) && record.isCompleted
      )
      
      const isCompleted = optimisticState !== undefined ? optimisticState : (todayRecord ? true : false)
      
      if (isCompleted) {
        completed.push(habit)
      } else {
        pending.push(habit)
      }
    })

    return { completed, pending }
  }, [activeHabits, optimisticUpdates])

  // Weekly completion statistics
  const weeklyStats = useMemo(() => {
    const stats = activeHabits.map(habit => {
      const weeklyRecords = habit.records.filter(record => 
        record.date >= weekStart && 
        record.date <= weekEnd && 
        record.isCompleted
      )
      
      const expectedDays = habit.frequency === 'weekly' ? 1 : 7
      const completedDays = weeklyRecords.length
      const completionRate = (completedDays / expectedDays) * 100

      return {
        habit,
        completedDays,
        expectedDays,
        completionRate: Math.min(completionRate, 100)
      }
    })

    const overallCompletionRate = stats.length > 0 
      ? stats.reduce((sum, stat) => sum + stat.completionRate, 0) / stats.length
      : 0

    return { habits: stats, overall: overallCompletionRate }
  }, [activeHabits, weekStart, weekEnd])

  // Current streaks using consistent logic
  const currentStreaks = useMemo(() => {
    return activeHabits.map(habit => {
      let streak = 0
      
      // Sort records by date descending (most recent first)
      const sortedRecords = habit.records
        .filter(r => r.isCompleted && r.date <= today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Count consecutive days from the most recent
      for (const record of sortedRecords) {
        const recordDate = new Date(record.date)
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - streak)
        
        // Normalize to compare just dates (ignore time)
        recordDate.setHours(0, 0, 0, 0)
        expectedDate.setHours(0, 0, 0, 0)
        
        if (recordDate.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }
      
      return { habit, streak }
    }).filter(item => item.streak > 0)
      .sort((a, b) => b.streak - a.streak)
  }, [activeHabits, today])

  const handleToggleHabit = async (habit: Habit, isCompleted: boolean) => {
    if (isLogging === habit.id) return

    // Optimistic update - update UI immediately
    setOptimisticUpdates(prev => new Map(prev).set(habit.id, isCompleted))
    setIsLogging(habit.id)
    
    try {
      const { data, error } = await logHabitProgress(habit.id, {
        date: today,
        isCompleted,
        notes: isCompleted ? 'Logged from overview' : undefined
      })

      if (error) {
        // Rollback optimistic update on error
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(habit.id)
          return newMap
        })
        addToast({ 
          message: `Failed to ${isCompleted ? 'log' : 'unlog'} habit: ${error}`, 
          type: 'error' 
        })
        return
      }

      if (data) {
        // Update the actual habit records and clear optimistic update
        const updatedHabit: Habit = {
          ...habit,
          records: isCompleted 
            ? [...habit.records.filter(r => !isToday(r.date)), data]
            : habit.records.filter(r => !isToday(r.date))
        }
        
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(habit.id)
          return newMap
        })
        
        onHabitUpdate(updatedHabit)
        addToast({ 
          message: `${habit.name} ${isCompleted ? 'completed' : 'unmarked'} for today!`, 
          type: 'success' 
        })
      }
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(habit.id)
        return newMap
      })
      addToast({ 
        message: `Failed to update habit`, 
        type: 'error' 
      })
    } finally {
      setIsLogging(null)
    }
  }

  const handleCompleteAll = async () => {
    if (todaysStatus.pending.length === 0 || isLogging !== null) return

    // Optimistic updates for all pending habits
    const optimisticMap = new Map(optimisticUpdates)
    todaysStatus.pending.forEach(habit => {
      optimisticMap.set(habit.id, true)
    })
    setOptimisticUpdates(optimisticMap)

    const promises = todaysStatus.pending.map(async (habit) => {
      try {
        const { data, error } = await logHabitProgress(habit.id, {
          date: today,
          isCompleted: true,
          notes: 'Bulk completed from overview'
        })

        if (data) {
          const updatedHabit: Habit = {
            ...habit,
            records: [...habit.records.filter(r => !isToday(r.date)), data]
          }
          return { success: true, habit: updatedHabit, originalHabit: habit }
        } else {
          return { success: false, habit, originalHabit: habit, error }
        }
      } catch (error) {
        return { success: false, habit, originalHabit: habit, error }
      }
    })

    const results = await Promise.allSettled(promises)
    
    // Process results and rollback failed optimistic updates
    const successfulUpdates: Habit[] = []
    const failedHabits: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulUpdates.push(result.value.habit)
      } else {
        const habitId = todaysStatus.pending[index].id
        failedHabits.push(todaysStatus.pending[index].name)
        // Rollback optimistic update for failed habit
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(habitId)
          return newMap
        })
      }
    })

    // Update successful habits
    successfulUpdates.forEach(habit => {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(habit.id)
        return newMap
      })
      onHabitUpdate(habit)
    })

    // Show results
    if (successfulUpdates.length > 0) {
      addToast({
        message: `Completed ${successfulUpdates.length} habit${successfulUpdates.length !== 1 ? 's' : ''}!`,
        type: 'success'
      })
    }

    if (failedHabits.length > 0) {
      addToast({
        message: `Failed to complete: ${failedHabits.join(', ')}`,
        type: 'error'
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '🏃'
      case 'productivity': return '💼'
      case 'mindfulness': return '🧘'
      case 'fitness': return '💪'
      case 'learning': return '📚'
      default: return '✨'
    }
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '🌟'
    return '✨'
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {todaysStatus.completed.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {activeHabits.length} habits
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {todaysStatus.pending.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  remaining tasks
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(weeklyStats.overall)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  completion rate
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Habits */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Habits
            </CardTitle>
            <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200">
              {formatDate(today, 'EEEE, MMM d')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeHabits.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No active habits yet</h3>
              <p className="text-gray-600 mb-4 text-sm">Start building positive habits for a better life</p>
              <Button onClick={onAddHabit} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {activeHabits.map(habit => {
                const isCompleted = todaysStatus.completed.includes(habit)
                const isLoggingThis = isLogging === habit.id
                
                return (
                  <div 
                    key={habit.id}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200 hover:border-green-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => !isLoggingThis && handleToggleHabit(habit, !isCompleted)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={isCompleted}
                          disabled={isLoggingThis}
                          onCheckedChange={(checked) => 
                            handleToggleHabit(habit, checked as boolean)
                          }
                          className={`h-6 w-6 ${
                            isCompleted ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : ''
                          }`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Habit Name Row */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg flex-shrink-0">{getCategoryIcon(habit.category)}</span>
                          <h3 className={`font-semibold text-gray-900 truncate ${
                            isCompleted ? 'line-through text-gray-500' : ''
                          }`}>
                            {habit.name}
                          </h3>
                        </div>
                        
                        {/* Badges Row */}
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-medium px-2 py-1"
                            style={{ 
                              backgroundColor: `${habit.color}15`, 
                              color: habit.color,
                              borderColor: `${habit.color}30`
                            }}
                          >
                            {habit.frequency}
                          </Badge>
                          {isCompleted ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        
                        {habit.description && (
                          <p className="text-sm text-gray-600 mt-2 truncate">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className={`absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-300 ${
                      isCompleted ? 'bg-green-400 w-full' : 'bg-gray-200 w-0 group-hover:w-1/4'
                    }`} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      {activeHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              This Week's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyStats.habits.map(({ habit, completedDays, expectedDays, completionRate }) => (
              <div key={habit.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getCategoryIcon(habit.category)}</span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {completedDays}/{expectedDays}
                    </span>
                    <Badge variant="outline" className="min-w-[60px] justify-center">
                      {Math.round(completionRate)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Streaks */}
      {currentStreaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentStreaks.slice(0, 6).map(({ habit, streak }) => (
                <div 
                  key={habit.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800"
                >
                  <span className="text-2xl">{getStreakIcon(streak)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-purple-800 dark:text-purple-200">{habit.name}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {streak} day{streak !== 1 ? 's' : ''} streak
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200">
                    {streak}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
