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

  const getIntensityClass = (completionRate: number, hasRecord: boolean) => {
    if (!hasRecord) return 'bg-muted/30'
    if (completionRate === 0) return 'bg-red-200'
    if (completionRate < 25) return 'bg-red-300'
    if (completionRate < 50) return 'bg-orange-300'
    if (completionRate < 75) return 'bg-yellow-300'
    if (completionRate < 100) return 'bg-green-300'
    return 'bg-green-500'
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
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30" title="No data" />
            <div className="w-3 h-3 rounded-sm bg-red-200" title="0%" />
            <div className="w-3 h-3 rounded-sm bg-orange-300" title="1-49%" />
            <div className="w-3 h-3 rounded-sm bg-yellow-300" title="50-74%" />
            <div className="w-3 h-3 rounded-sm bg-green-300" title="75-99%" />
            <div className="w-3 h-3 rounded-sm bg-green-500" title="100%" />
          </div>
          <span className="text-muted-foreground">More</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-2">
              <div className="w-8" /> {/* Spacer for weekday labels */}
              {monthNames.map((month, index) => (
                <div key={month} className="flex-1 text-xs text-center text-muted-foreground min-w-[40px]">
                  {month}
                </div>
              ))}
            </div>
            
            {/* Weekday labels and grid */}
            <div className="flex">
              {/* Weekday labels */}
              <div className="w-8 space-y-1">
                {weekdays.map((day, index) => (
                  <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">
                    {index % 2 === 1 && day.substring(0, 1)}
                  </div>
                ))}
              </div>
              
              {/* Grid */}
              <div className="flex-1 space-y-1">
                {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => (
                  <div key={dayOfWeek} className="flex gap-1">
                    {weeks.map((week, weekIndex) => {
                      const day = week.find(d => d.date.getDay() === dayOfWeek)
                      if (!day) {
                        return <div key={weekIndex} className="w-3 h-3 bg-muted/30 rounded-sm" />
                      }
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayOfWeek}`}
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 ${
                            getIntensityClass(day.completionRate, day.hasRecord)
                          }`}
                          title={`${formatDate(day.date, 'MMM dd, yyyy')}${
                            day.hasRecord 
                              ? `\n${day.isCompleted ? 'Completed ✓' : 'Not completed'}${
                                  day.notes ? `\nNote: ${day.notes}` : ''
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
