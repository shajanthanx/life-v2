'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { Habit, HabitRecord } from '@/types'
import { logHabitProgress } from '@/lib/api/habits'
import { formatDate } from '@/lib/utils'
import { 
  Calendar, Save, RotateCcw, CheckCircle2, 
  Target, Clock, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import { eachDayOfInterval, subDays, startOfDay, endOfDay } from 'date-fns'

interface BulkHabitLoggerProps {
  habits: Habit[]
  onHabitUpdate: (habit: Habit) => void
}

export function BulkHabitLogger({ habits, onHabitUpdate }: BulkHabitLoggerProps) {
  const [dateRange, setDateRange] = useState(7) // Number of days to show
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set())
  const [showInactiveHabits, setShowInactiveHabits] = useState(false)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(new Map())
  const { addToast } = useToast()

  // Generate date range
  const dates = useMemo(() => {
    const endDate = startOfDay(selectedDate)
    const startDate = subDays(endDate, dateRange - 1)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [selectedDate, dateRange])

  // Filter habits
  const filteredHabits = useMemo(() => {
    return habits.filter(habit => showInactiveHabits || habit.isActive)
  }, [habits, showInactiveHabits])

  // Get existing record for a habit on a specific date
  const getRecord = (habit: Habit, date: Date): HabitRecord | undefined => {
    // Use consistent date formatting for comparison
    const getDateString = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return habit.records.find(record => 
      getDateString(record.date) === getDateString(date)
    )
  }

  // Check if habit is completed for a date (with optimistic updates)
  const isCompleted = (habit: Habit, date: Date): boolean => {
    const cellId = getCellId(habit.id, date)
    const optimisticState = optimisticUpdates.get(cellId)
    const record = getRecord(habit, date)
    const actualState = record?.isCompleted || false
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    
    if (optimisticState !== undefined) {
      return optimisticState
    }
    
    return actualState
  }

  // Generate cell ID for loading state
  const getCellId = (habitId: string, date: Date): string => {
    // Use consistent date formatting (local date, not UTC) 
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return `${habitId}-${dateStr}`
  }

  // Handle checkbox toggle
  const handleToggle = async (habit: Habit, date: Date, isCurrentlyCompleted: boolean) => {
    const cellId = getCellId(habit.id, date)
    
    // Debug logging
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // Optimistic update - update UI immediately
    setOptimisticUpdates(prev => new Map(prev).set(cellId, !isCurrentlyCompleted))
    setLoadingCells(prev => new Set(prev).add(cellId))

    try {
      const recordData = {
        date: date,
        isCompleted: !isCurrentlyCompleted, // Simple boolean toggle
        notes: undefined
      }

      const { data, error } = await logHabitProgress(habit.id, recordData)
      
      if (error) {
        console.error('❌ Habit toggle failed:', error)
        
        // Rollback optimistic update on error
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(cellId)
          return newMap
        })
        addToast({
          message: `Failed to log ${habit.name}: ${error}`,
          type: 'error'
        })
        return
      }

      if (data) {
        // Update the habit with the new/updated record
        const getDateString = (d: Date) => {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        const existingRecordIndex = habit.records.findIndex(
          record => getDateString(record.date) === getDateString(data.date)
        )

        let updatedRecords: HabitRecord[]
        if (existingRecordIndex >= 0) {
          // Update existing record
          updatedRecords = habit.records.map((record, index) =>
            index === existingRecordIndex ? data : record
          )
        } else {
          // Add new record
          updatedRecords = [...habit.records, data]
        }

        const updatedHabit: Habit = {
          ...habit,
          records: updatedRecords
        }

        // Clear optimistic update and update actual data
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(cellId)
          return newMap
        })

        onHabitUpdate(updatedHabit)
        
        addToast({
          message: `${habit.name} ${isCurrentlyCompleted ? 'unmarked' : 'completed'} for ${formatDate(date, 'MMM dd')}`,
          type: 'success'
        })
      }
    } catch (error) {
      console.error('❌ Habit toggle exception:', error)
      
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(cellId)
        return newMap
      })
      addToast({
        message: 'Failed to update habit progress',
        type: 'error'
      })
    } finally {
      setLoadingCells(prev => {
        const newSet = new Set(prev)
        newSet.delete(cellId)
        return newSet
      })
    }
  }

  // Navigate date range
  const navigateDates = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - dateRange)
      } else {
        newDate.setDate(newDate.getDate() + dateRange)
      }
      return newDate
    })
  }

  // Bulk complete all habits for a specific date
  const bulkCompleteDate = async (date: Date) => {
    const incompleteTasks = filteredHabits.filter(habit => !isCompleted(habit, date))
    
    if (incompleteTasks.length === 0) {
      addToast({
        message: 'All habits already completed for this date',
        type: 'info'
      })
      return
    }

    const promises = incompleteTasks.map(habit => handleToggle(habit, date, false))
    await Promise.all(promises)
  }

  // Bulk complete all instances of a specific habit
  const bulkCompleteHabit = async (habit: Habit) => {
    const incompleteDates = dates.filter(date => !isCompleted(habit, date))
    
    if (incompleteDates.length === 0) {
      addToast({
        message: `${habit.name} already completed for all visible dates`,
        type: 'info'
      })
      return
    }

    const promises = incompleteDates.map(date => handleToggle(habit, date, false))
    await Promise.all(promises)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Bulk Habit Logger
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <div className="flex gap-1">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  size="sm"
                  variant={dateRange === days ? 'default' : 'outline'}
                  onClick={() => setDateRange(days)}
                >
                  {days}d
                </Button>
              ))}
            </div>

            {/* Show Inactive Toggle */}
            <Button
              size="sm"
              variant={showInactiveHabits ? 'default' : 'outline'}
              onClick={() => setShowInactiveHabits(!showInactiveHabits)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {showInactiveHabits ? 'All' : 'Active'}
            </Button>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigateDates('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {formatDate(dates[0], 'MMM dd')} - {formatDate(dates[dates.length - 1], 'MMM dd, yyyy')}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigateDates('next')}
            disabled={dates[dates.length - 1] >= new Date()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>No {showInactiveHabits ? '' : 'active '}habits to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium min-w-[150px]">
                    Habit
                  </th>
                  {dates.map(date => {
                    const getDateString = (d: Date) => {
                      const year = d.getFullYear()
                      const month = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      return `${year}-${month}-${day}`
                    }
                    const isToday = getDateString(date) === getDateString(new Date())
                    const completedCount = filteredHabits.filter(habit => isCompleted(habit, date)).length
                    
                    return (
                      <th key={date.toISOString()} className="text-center p-2 border-b min-w-[60px]">
                        <div className="space-y-1">
                          <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : ''}`}>
                            {formatDate(date, 'MMM dd')}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                            {formatDate(date, 'EEE')}
                          </div>
                          {completedCount > 0 && (
                            <Badge variant="secondary" className="text-xs px-1">
                              {completedCount}/{filteredHabits.length}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs px-1"
                            onClick={() => bulkCompleteDate(date)}
                            title={`Complete all habits for ${formatDate(date, 'MMM dd')}`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    )
                  })}
                  <th className="text-center p-2 border-b">
                    <div className="text-xs font-medium">Actions</div>
                  </th>
                </tr>
              </thead>
              
              <tbody>
                {filteredHabits.map(habit => {
                  const completedDates = dates.filter(date => isCompleted(habit, date)).length
                  
                  return (
                    <tr key={habit.id} className="hover:bg-muted/50">
                      <td className="p-2 border-b">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: habit.color }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{habit.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {habit.frequency} habit
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {dates.map(date => {
                        const cellId = getCellId(habit.id, date)
                        const isLoading = loadingCells.has(cellId)
                        const completed = isCompleted(habit, date)
                        const record = getRecord(habit, date)
                        const isFutureDate = date > new Date()
                        
                        return (
                          <td key={date.toISOString()} className="p-2 border-b text-center">
                            <div className="flex flex-col items-center gap-1">
                              {isLoading ? (
                                <LoadingSpinner className="h-4 w-4" />
                              ) : (
                                <Checkbox
                                  checked={completed}
                                  disabled={isFutureDate}
                                  onCheckedChange={() => handleToggle(habit, date, completed)}
                                  className="h-4 w-4"
                                />
                              )}
                              
                              {/* Removed redundant "Done" text since checkbox already shows completion state */}
                            </div>
                          </td>
                        )
                      })}
                      
                      <td className="p-2 border-b text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs px-2"
                            onClick={() => bulkCompleteHabit(habit)}
                            title={`Complete ${habit.name} for all visible dates`}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            All
                          </Button>
                          
                          <div className="text-xs text-muted-foreground">
                            {completedDates}/{dates.length}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                Total: {filteredHabits.length} habits × {dates.length} days = {filteredHabits.length * dates.length} entries
              </span>
              <span>
                Completed: {filteredHabits.reduce((sum, habit) => 
                  sum + dates.filter(date => isCompleted(habit, date)).length, 0
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Quick bulk logging for catch-up and planning</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
