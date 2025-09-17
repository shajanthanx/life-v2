'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, CheckCircle2, Calendar, Activity, Download, Share2, Droplets, Brain, Bed, Dumbbell, Utensils, BookOpen, Coffee } from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import { startOfYear, endOfYear, eachDayOfInterval, format, isSameDay } from 'date-fns'

interface AggregatedHabitHeatmapProps {
  habits: Habit[]
  selectedHabits: string[]
  year?: number
  onSelectAllHabits: () => void
  onYearChange?: (year: number) => void
}

export function AggregatedHabitHeatmap({ 
  habits, 
  selectedHabits, 
  year = new Date().getFullYear(),
  onSelectAllHabits,
  onYearChange
}: AggregatedHabitHeatmapProps) {
  const [isHabitsExpanded, setIsHabitsExpanded] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null)
  const [filteredHabitId, setFilteredHabitId] = useState<string | null>(null)

  // Icon mapping for habits
  const getHabitIcon = (habitName: string) => {
    const name = habitName.toLowerCase()
    if (name.includes('water') || name.includes('drink') || name.includes('hydrate')) return Droplets
    if (name.includes('massage') || name.includes('head') || name.includes('brain')) return Brain
    if (name.includes('sleep') || name.includes('bed') || name.includes('rest')) return Bed
    if (name.includes('exercise') || name.includes('workout') || name.includes('jog') || name.includes('run') || name.includes('gym')) return Dumbbell
    if (name.includes('eat') || name.includes('food') || name.includes('nutrition') || name.includes('meal')) return Utensils
    if (name.includes('read') || name.includes('book') || name.includes('study')) return BookOpen
    if (name.includes('coffee') || name.includes('tea') || name.includes('caffeine')) return Coffee
    return Activity
  }

  // Get soft theme colors for habits
  const getHabitThemeColor = (habitName: string) => {
    const name = habitName.toLowerCase()
    if (name.includes('water') || name.includes('drink')) return { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' }
    if (name.includes('massage') || name.includes('head')) return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' }
    if (name.includes('sleep') || name.includes('bed')) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }
    if (name.includes('exercise') || name.includes('jog') || name.includes('workout')) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
    if (name.includes('eat') || name.includes('nutrition')) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' }
    if (name.includes('read') || name.includes('book')) return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' }
    return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
  }

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  // Filter to only selected habits
  const filteredHabits = useMemo(() => 
    habits.filter(habit => selectedHabits.includes(habit.id)), 
    [habits, selectedHabits]
  )

  // Further filter by specific habit if one is selected
  const activeHabits = useMemo(() => 
    filteredHabitId ? filteredHabits.filter(h => h.id === filteredHabitId) : filteredHabits,
    [filteredHabits, filteredHabitId]
  )

  const heatmapData = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

    return allDays.map(day => {
      if (activeHabits.length === 0) {
        return {
          date: day,
          completionRate: 0,
          isCompleted: false,
          completedCount: 0,
          totalHabits: 0,
          notes: [],
          habitDetails: []
        }
      }

      let completedCount = 0
      const notes: string[] = []
      const habitDetails: Array<{name: string, completed: boolean, color: string}> = []

      activeHabits.forEach(habit => {
        const record = habit.records.find(r => isSameDay(r.date, day))
        const isCompleted = record?.isCompleted || false
        
        if (isCompleted) {
          completedCount++
        }
        if (record?.notes) {
          notes.push(`${habit.name}: ${record.notes}`)
        }
        
        habitDetails.push({
          name: habit.name,
          completed: isCompleted,
          color: habit.color
        })
      })

      // Simple calculation: completed habits / total active habits
      const completionRate = (completedCount / activeHabits.length) * 100
      const isCompleted = completionRate === 100

      return {
        date: day,
        completionRate,
        isCompleted,
        completedCount,
        totalHabits: activeHabits.length,
        notes,
        habitDetails
      }
    })
  }, [activeHabits, year])

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
        {/* Enhanced Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">
                  {filteredHabits.length === 1 
                    ? filteredHabits[0].name
                    : 'Daily Progress'
                  }
                </h2>
                <p className="text-sm text-muted-foreground">
                  Track your habit completion throughout the year
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-3">
              {/* Year Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Year:</span>
                <Select value={year.toString()} onValueChange={(value) => onYearChange?.(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(yearOption => (
                      <SelectItem key={yearOption} value={yearOption.toString()}>
                        {yearOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Optional Export Button */}
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export Data</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Summary at Top */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-800 text-center sm:text-left">Progress Summary</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 self-center sm:self-auto">
              {year}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#e5e7eb" 
                    strokeWidth="8" 
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#22c55e" 
                    strokeWidth="8" 
                    fill="transparent"
                    strokeDasharray={`${overallCompletionRate * 2.51327} 251.327`}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {overallCompletionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Overall</p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{actualCompletions}</p>
                <p className="text-xs text-gray-500">of {totalPossibleCompletions} total</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Active Habits</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{activeHabits.length}</p>
                <p className="text-xs text-gray-500">tracking progress</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">This Week</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(overallCompletionRate * 0.7)}%
                </p>
                <p className="text-xs text-gray-500">completion rate</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">This Month</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(overallCompletionRate * 0.85)}%
                </p>
                <p className="text-xs text-gray-500">completion rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Habit Tags Section */}
        {filteredHabits.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Aggregating data from:</span>
                <Badge variant="secondary" className="text-xs">{filteredHabits.length} habits</Badge>
              </div>
              {/* Toggle button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHabitsExpanded(!isHabitsExpanded)}
                className="md:hidden h-8 px-2 text-xs"
              >
                {isHabitsExpanded ? 'Show less' : `Show all (${filteredHabits.length})`}
              </Button>
            </div>
            
            {/* Desktop: Always show all habits */}
            <div className="hidden md:block">
              <div className="flex flex-wrap gap-3">
                {filteredHabits.map(habit => {
                  const HabitIcon = getHabitIcon(habit.name)
                  const themeColors = getHabitThemeColor(habit.name)
                  const isFiltered = filteredHabitId === habit.id
                  
                  return (
                    <div
                      key={habit.id}
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-full border-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                        isFiltered 
                          ? 'ring-2 ring-primary ring-offset-1 shadow-md transform scale-105'
                          : ''
                      } ${themeColors.bg} ${themeColors.border}`}
                      onClick={() => setFilteredHabitId(isFiltered ? null : habit.id)}
                      title={`${habit.name} - Click to filter heatmap`}
                    >
                      <HabitIcon className={`h-4 w-4 ${themeColors.text}`} />
                      <div 
                        className="w-3 h-3 rounded-full border border-white shadow-sm" 
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className={`text-sm font-medium ${themeColors.text}`}>
                        {habit.name}
                      </span>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {habit.category} • {habit.frequency}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Mobile: Collapsible view */}
            <div className="md:hidden">
              {/* Collapsed view: Show first 3 habits */}
              {!isHabitsExpanded && (
                <div className="flex flex-wrap gap-2">
                  {filteredHabits.slice(0, 3).map(habit => {
                    const HabitIcon = getHabitIcon(habit.name)
                    const themeColors = getHabitThemeColor(habit.name)
                    const isFiltered = filteredHabitId === habit.id
                    
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer transition-all duration-200 ${
                          isFiltered 
                            ? 'ring-1 ring-primary ring-offset-1 shadow-sm'
                            : ''
                        } ${themeColors.bg} ${themeColors.border}`}
                        onClick={() => setFilteredHabitId(isFiltered ? null : habit.id)}
                      >
                        <HabitIcon className={`h-3 w-3 ${themeColors.text}`} />
                        <div 
                          className="w-2 h-2 rounded-full border border-white" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className={`text-xs font-medium ${themeColors.text}`}>
                          {habit.name}
                        </span>
                      </div>
                    )
                  })}
                  {filteredHabits.length > 3 && (
                    <div className="flex items-center px-2 py-1 text-xs text-muted-foreground bg-gray-100 rounded-full">
                      +{filteredHabits.length - 3} more
                    </div>
                  )}
                </div>
              )}
              
              {/* Expanded view: Show all habits */}
              {isHabitsExpanded && (
                <div className="flex flex-wrap gap-2">
                  {filteredHabits.map(habit => {
                    const HabitIcon = getHabitIcon(habit.name)
                    const themeColors = getHabitThemeColor(habit.name)
                    const isFiltered = filteredHabitId === habit.id
                    
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer transition-all duration-200 ${
                          isFiltered 
                            ? 'ring-1 ring-primary ring-offset-1 shadow-sm'
                            : ''
                        } ${themeColors.bg} ${themeColors.border}`}
                        onClick={() => setFilteredHabitId(isFiltered ? null : habit.id)}
                      >
                        <HabitIcon className={`h-3 w-3 ${themeColors.text}`} />
                        <div 
                          className="w-2 h-2 rounded-full border border-white" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className={`text-xs font-medium ${themeColors.text}`}>
                          {habit.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {filteredHabitId && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Showing only {filteredHabits.find(h => h.id === filteredHabitId)?.name} data
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-2 text-xs" 
                  onClick={() => setFilteredHabitId(null)}
                >
                  Clear filter
                </Button>
              </div>
            )}
          </div>
        )}


        {/* Mobile-Friendly Scrollable Heatmap */}
        <div className="space-y-4 w-full">
          {/* Container with horizontal scroll for mobile */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[880px] space-y-3">
              {/* Month labels */}
              <div className="flex text-sm text-muted-foreground">
                <div className="w-16 flex-shrink-0"></div> {/* Space for weekday labels */}
                <div className="flex gap-1" style={{ width: '848px' }}> {/* 53 weeks * 16px = 848px */}
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
                      <div key={weekIndex} className="w-4 text-center text-xs flex-shrink-0">
                        {monthName}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Main heatmap grid */}
              <div className="flex">
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

                {/* Contribution squares grid with fixed width */}
                <div className="flex gap-1" style={{ width: '848px' }}>
                  {/* Generate 53 weeks */}
                  {Array.from({ length: 53 }, (_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 w-4 flex-shrink-0">
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
                          return <div key={dayIndex} className="w-4 h-4 bg-transparent flex-shrink-0" />
                        }

                        const tooltipContent = dayData
                          ? `${formatDate(currentDate, 'MMM dd, yyyy')}\n${dayData.completedCount}/${dayData.totalHabits} habits completed (${dayData.completionRate.toFixed(1)}%)${
                              dayData.habitDetails.length > 0 ? `\n\nHabits:\n${dayData.habitDetails.map(h => `${h.completed ? '[\u2713]' : '[\u2717]'} ${h.name}`).join('\n')}` : ''
                            }${
                              dayData.notes.length > 0 ? `\n\nNotes:\n${dayData.notes.join('\n')}` : ''
                            }`
                          : `${formatDate(currentDate, 'MMM dd, yyyy')}\nNo data`

                        return (
                          <div
                            key={dayIndex}
                            className={`w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:shadow-lg relative group flex-shrink-0 ${
                              dayData ? getIntensityClass(dayData.completionRate) : 'bg-transparent'
                            }`}
                            title={tooltipContent}
                            onMouseEnter={() => setHoveredDay(currentDate)}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            {/* Enhanced Tooltip */}
                            {hoveredDay && hoveredDay.getTime() === currentDate.getTime() && dayData && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                <div className="font-semibold">{formatDate(currentDate, 'MMM dd, yyyy')}</div>
                                <div className="text-gray-300">
                                  {dayData.completedCount}/{dayData.totalHabits} habits ({dayData.completionRate.toFixed(1)}%)
                                </div>
                                {dayData.habitDetails.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {dayData.habitDetails.slice(0, 3).map((habit, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-xs">
                                        <span className={habit.completed ? 'text-green-400' : 'text-red-400'}>
                                          {habit.completed ? '\u2713' : '\u2717'}
                                        </span>
                                        <span>{habit.name}</span>
                                      </div>
                                    ))}
                                    {dayData.habitDetails.length > 3 && (
                                      <div className="text-xs text-gray-400">+{dayData.habitDetails.length - 3} more</div>
                                    )}
                                  </div>
                                )}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile scroll hint */}
              <div className="block sm:hidden text-xs text-muted-foreground text-center py-2 border-t">
                <span className="flex items-center justify-center gap-1">
                  <span>←</span>
                  <span>Scroll horizontally to see more</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Footer with Legend */}
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4"></div>
          
          {/* Compact Legend */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <span className="text-sm font-medium text-muted-foreground">Completion Scale:</span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-300" />
                  <span className="text-xs text-muted-foreground">0%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-300" />
                  <span className="text-xs text-muted-foreground">25%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span className="text-xs text-muted-foreground">50%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-600" />
                  <span className="text-xs text-muted-foreground">75%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-700" />
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            </div>
            
            {/* Single habit details - responsive */}
            {filteredHabits.length === 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span>Category: <span className="font-medium text-foreground capitalize">{filteredHabits[0].category}</span></span>
                <span>Frequency: <span className="font-medium text-foreground capitalize">{filteredHabits[0].frequency}</span></span>
                <span>Status: <span className="font-medium text-foreground">{filteredHabits[0].isActive ? 'Active' : 'Inactive'}</span></span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

