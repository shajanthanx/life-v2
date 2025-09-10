'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Habit, HabitRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import { startOfYear, endOfYear, eachDayOfInterval, format, isSameDay } from 'date-fns'

interface HabitHeatmapProps {
  habit: Habit
  year?: number
}

export function HabitHeatmap({ habit, year = new Date().getFullYear() }: HabitHeatmapProps) {
  const heatmapData = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

    return allDays.map(day => {
      const record = habit.records.find(r => isSameDay(r.date, day))
      const completionRate = record?.isCompleted ? 100 : 0

      return {
        date: day,
        isCompleted: record?.isCompleted || false,
        completionRate: Math.min(100, completionRate),
        hasRecord: !!record,
        notes: record?.notes
      }
    })
  }, [habit, year])

  const getIntensityClass = (isCompleted: boolean, hasRecord: boolean) => {
    if (!hasRecord) return 'bg-muted/30'
    return isCompleted ? 'bg-green-500' : 'bg-muted/50'
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Group days by weeks for proper calendar layout
  const weeks = useMemo(() => {
    const weeksArray: typeof heatmapData[][] = []
    let currentWeek: typeof heatmapData = []

    heatmapData.forEach((day, index) => {
      currentWeek.push(day)
      
      // If it's Saturday (day 6) or the last day, end the week
      if (day.date.getDay() === 6 || index === heatmapData.length - 1) {
        weeksArray.push([...currentWeek])
        currentWeek = []
      }
    })

    return weeksArray
  }, [heatmapData])

  const stats = useMemo(() => {
    const totalDays = heatmapData.filter(d => d.hasRecord).length
    const completedDays = heatmapData.filter(d => d.isCompleted).length
    const currentStreak = calculateCurrentStreak(heatmapData)
    const longestStreak = calculateLongestStreak(heatmapData)
    
    return {
      totalDays,
      completedDays,
      completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      currentStreak,
      longestStreak
    }
  }, [heatmapData])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: habit.color }}
            />
            {habit.name} - {year}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {stats.completedDays}/{stats.totalDays} days
            </Badge>
            <Badge variant="outline">
              {stats.completionRate.toFixed(1)}% complete
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.longestStreak}</div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalDays}</div>
            <div className="text-sm text-muted-foreground">Total Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.completionRate.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <span className="text-muted-foreground">No data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <span className="text-muted-foreground">Not completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>

        {/* GitHub-style Heatmap */}
        <div className="space-y-3 overflow-x-auto">
          {/* Month labels */}
          <div className="flex text-xs text-muted-foreground min-w-max">
            <div className="w-10 flex-shrink-0"></div> {/* Space for weekday labels */}
            <div className="flex" style={{ minWidth: '636px' }}>
              {Array.from({ length: 53 }, (_, weekIndex) => {
                // Calculate first day of this week
                const startOfYear = new Date(year, 0, 1)
                const startOfFirstWeek = new Date(startOfYear)
                startOfFirstWeek.setDate(startOfYear.getDate() - startOfYear.getDay())
                
                const weekStart = new Date(startOfFirstWeek)
                weekStart.setDate(startOfFirstWeek.getDate() + (weekIndex * 7))
                
                // Show month label on first week of each month
                const shouldShowMonth = weekStart.getDate() <= 7 || weekIndex === 0
                const monthName = shouldShowMonth ? monthNames[weekStart.getMonth()] : ''
                
                return (
                  <div key={weekIndex} className="w-3 text-center" style={{ marginRight: '1px' }}>
                    <span style={{ fontSize: '10px' }}>{monthName}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main heatmap grid */}
          <div className="flex min-w-max">
            {/* Weekday labels */}
            <div className="w-10 flex-shrink-0 pr-2 text-xs text-muted-foreground">
              {weekdays.map((day, index) => (
                <div key={day} className="h-3 mb-1 flex items-center justify-end">
                  <span style={{ fontSize: '9px' }}>
                    {index % 2 === 1 ? day.substring(0, 1) : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Contribution squares grid */}
            <div className="flex" style={{ gap: '1px' }}>
              {/* Generate 53 weeks */}
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: '1px' }}>
                  {/* 7 days per week */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    // Calculate the actual date for this square
                    const startOfYear = new Date(year, 0, 1)
                    const startOfFirstWeek = new Date(startOfYear)
                    startOfFirstWeek.setDate(startOfYear.getDate() - startOfYear.getDay()) // Go to Sunday of first week
                    
                    const currentDate = new Date(startOfFirstWeek)
                    currentDate.setDate(startOfFirstWeek.getDate() + (weekIndex * 7) + dayIndex)
                    
                    // Find the corresponding data point
                    const dayData = heatmapData.find(d => 
                      d.date.getFullYear() === currentDate.getFullYear() &&
                      d.date.getMonth() === currentDate.getMonth() &&
                      d.date.getDate() === currentDate.getDate()
                    )

                    // Don't show squares for dates outside the current year
                    if (currentDate.getFullYear() !== year) {
                      return <div key={dayIndex} className="w-3 h-3 bg-transparent" />
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-blue-400 ${
                          dayData 
                            ? getIntensityClass(dayData.isCompleted, dayData.hasRecord)
                            : 'bg-muted/20'
                        }`}
                        title={`${formatDate(currentDate, 'MMM dd, yyyy')}${
                          dayData?.hasRecord 
                            ? `\n${dayData.isCompleted ? 'Completed ✓' : 'Not completed'}${
                                dayData.notes ? `\nNote: ${dayData.notes}` : ''
                              }`
                            : '\nNo data'
                        }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Habit Details */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <span className="ml-2 font-medium capitalize">{habit.frequency}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 font-medium capitalize">{habit.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 font-medium">
                {habit.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateCurrentStreak(data: Array<{ date: Date; isCompleted: boolean; hasRecord: boolean }>): number {
  let streak = 0
  const today = new Date()
  
  // Sort by date descending (most recent first)
  const sortedData = data
    .filter(d => d.hasRecord && d.date <= today)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  for (const day of sortedData) {
    if (day.isCompleted) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function calculateLongestStreak(data: Array<{ date: Date; isCompleted: boolean; hasRecord: boolean }>): number {
  let maxStreak = 0
  let currentStreak = 0
  
  // Sort by date ascending
  const sortedData = data
    .filter(d => d.hasRecord)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  for (const day of sortedData) {
    if (day.isCompleted) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}
