'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter, CheckCircle2 } from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import { startOfYear, endOfYear, eachDayOfInterval, format, isSameDay } from 'date-fns'

interface AggregatedHabitHeatmapProps {
  habits: Habit[]
  selectedHabits: string[]
  year?: number
  onSelectAllHabits: () => void
}

export function AggregatedHabitHeatmap({ 
  habits, 
  selectedHabits, 
  year = new Date().getFullYear(),
  onSelectAllHabits
}: AggregatedHabitHeatmapProps) {
  // Filter to only selected habits
  const filteredHabits = useMemo(() => 
    habits.filter(habit => selectedHabits.includes(habit.id)), 
    [habits, selectedHabits]
  )

  const heatmapData = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

    return allDays.map(day => {
      if (filteredHabits.length === 0) {
        return {
          date: day,
          completionRate: 0,
          isCompleted: false,
          completedCount: 0,
          totalHabits: 0,
          notes: []
        }
      }

      let completedCount = 0
      const notes: string[] = []

      filteredHabits.forEach(habit => {
        const record = habit.records.find(r => isSameDay(r.date, day))
        if (record?.isCompleted) {
          completedCount++
        }
        if (record?.notes) {
          notes.push(`${habit.name}: ${record.notes}`)
        }
      })

      // Simple calculation: completed habits / total selected habits
      const completionRate = (completedCount / filteredHabits.length) * 100
      const isCompleted = completionRate === 100

      return {
        date: day,
        completionRate,
        isCompleted,
        completedCount,
        totalHabits: filteredHabits.length,
        notes
      }
    })
  }, [filteredHabits, year])

  const getIntensityClass = (completionRate: number) => {
    if (completionRate === 0) return 'bg-gray-300' // Neutral grey for 0% completion
    if (completionRate === 100) return 'bg-green-700' // Dark saturated green for 100%
    
    // Gradient of green shades for 1-99% completion
    if (completionRate < 20) return 'bg-green-200'
    if (completionRate < 40) return 'bg-green-300'
    if (completionRate < 60) return 'bg-green-400'
    if (completionRate < 80) return 'bg-green-500'
    return 'bg-green-600' // 80-99%
  }

  // Calculate simple stats for the header
  const totalPossibleCompletions = heatmapData.reduce((sum, d) => sum + d.totalHabits, 0)
  const actualCompletions = heatmapData.reduce((sum, d) => sum + d.completedCount, 0)
  const overallCompletionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Empty state when no habits are selected
  if (selectedHabits.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Filter className="h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">No Habits Selected</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Select one or more habits from the filter above to view the aggregated completion heatmap.
          </p>
          <Button onClick={onSelectAllHabits} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Select All Habits
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {filteredHabits.length === 1 
              ? `${filteredHabits[0].name} - ${year}`
              : `Daily Progress - ${year}`
            }
          </h2>
        </div>

        {/* Aggregating data from section moved to top */}
        {filteredHabits.length > 1 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Aggregating data from:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filteredHabits.map(habit => (
                <Badge key={habit.id} variant="outline" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: habit.color }}
                  />
                  {habit.name}
                </Badge>
              ))}
            </div>
          </div>
        )}


        {/* Full-width Responsive Heatmap */}
        <div className="space-y-4 w-full">
          {/* Month labels */}
          <div className="flex text-sm text-muted-foreground w-full">
            <div className="w-16 flex-shrink-0"></div> {/* Space for weekday labels */}
            <div className="flex-1 grid grid-cols-53 gap-1">
              {Array.from({ length: 53 }, (_, weekIndex) => {
                // Calculate first day of this week
                const startOfYear = new Date(year, 0, 1)
                const startOfFirstWeek = new Date(startOfYear)
                startOfFirstWeek.setDate(startOfYear.getDate() - startOfYear.getDay())
                
                const weekStart = new Date(startOfFirstWeek)
                weekStart.setDate(startOfFirstWeek.getDate() + (weekIndex * 7))
                
                // Show month label on first week of each month, but only if it's within the current year
                const shouldShowMonth = (weekStart.getDate() <= 7 || weekIndex === 0) && weekStart.getFullYear() === year
                const monthName = shouldShowMonth ? monthNames[weekStart.getMonth()] : ''
                
                return (
                  <div key={weekIndex} className="text-center text-xs">
                    {monthName}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main heatmap grid */}
          <div className="flex w-full">
            {/* Weekday labels */}
            <div className="w-16 flex-shrink-0 pr-3 text-xs text-muted-foreground">
              {weekdays.map((day, index) => (
                <div key={day} className="h-4 mb-1 flex items-center justify-end">
                  <span className="text-xs">
                    {index % 2 === 1 ? day.substring(0, 3) : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Contribution squares grid */}
            <div className="flex-1 grid grid-cols-53 gap-1">
              {/* Generate 53 weeks */}
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
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
                      return <div key={dayIndex} className="w-4 h-4 bg-transparent" />
                    }

                    const tooltipContent = dayData
                      ? `${formatDate(currentDate, 'MMM dd, yyyy')}\n${dayData.completedCount}/${dayData.totalHabits} habits completed (${dayData.completionRate.toFixed(1)}%)${
                          dayData.notes.length > 0 ? `\n\nNotes:\n${dayData.notes.join('\n')}` : ''
                        }`
                      : `${formatDate(currentDate, 'MMM dd, yyyy')}\nNo data`

                    return (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 ${
                          dayData ? getIntensityClass(dayData.completionRate) : 'bg-transparent'
                        }`}
                        title={tooltipContent}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Legend and Statistics */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            {/* Legend on the left */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-gray-300" />
                <span className="text-muted-foreground">0%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-200" />
                <span className="text-muted-foreground">1-20%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-400" />
                <span className="text-muted-foreground">21-60%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-600" />
                <span className="text-muted-foreground">61-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-700" />
                <span className="text-muted-foreground">100%</span>
              </div>
            </div>

            {/* Completion Statistics on the right */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total completions:</span>
                <Badge variant="outline">
                  {actualCompletions}/{totalPossibleCompletions}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Overall completion:</span>
                <Badge variant="outline">
                  {overallCompletionRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Single habit details */}
          {filteredHabits.length === 1 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Frequency:</span>
                <span className="ml-2 font-medium capitalize">{filteredHabits[0].frequency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 font-medium capitalize">{filteredHabits[0].category}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium">
                  {filteredHabits[0].isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

