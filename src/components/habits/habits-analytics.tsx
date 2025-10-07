'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Calendar, Target, 
  BarChart3, Activity, Flame, CheckCircle2, AlertTriangle,
  Download, ArrowUp, ArrowDown, Hash, Users, Eye, Filter, XCircle
} from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import { AggregatedHabitHeatmap } from './aggregated-habit-heatmap'

interface HabitsAnalyticsProps {
  habits: Habit[]
}

interface DateRange {
  label: string
  days: number
  value: string
}

const DATE_RANGES: DateRange[] = [
  { label: '7 Days', days: 7, value: '7d' },
  { label: '30 Days', days: 30, value: '30d' },
  { label: '90 Days', days: 90, value: '90d' },
  { label: '1 Year', days: 365, value: '1y' }
]

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
]

export function HabitsAnalytics({ habits }: HabitsAnalyticsProps) {
  const [selectedRange, setSelectedRange] = useState<string>('7d')
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'trends' | 'heatmaps'>('overview')
  const [heatmapYear, setHeatmapYear] = useState<number>(new Date().getFullYear())
  
  // Weekly chart navigation state
  const [weeksToShow, setWeeksToShow] = useState<number>(10)
  const [weekOffset, setWeekOffset] = useState<number>(0) // 0 = current week, positive = weeks ago
  
  // Filter panel state
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false)

  // Initialize selected habits from localStorage or default to all
  useEffect(() => {
    const savedSelection = localStorage.getItem('habits-analytics-selected')
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter to only include habits that still exist
          const validSelection = parsed.filter(id => habits.some(h => h.id === id))
          if (validSelection.length > 0) {
            setSelectedHabits(validSelection)
            return
          }
        }
      } catch (e) {
        console.error('Error parsing saved habit selection:', e)
      }
    }
    
    // Default to all habits if no valid saved selection
    if (habits.length > 0) {
      setSelectedHabits(habits.map(h => h.id))
    }
  }, [habits])

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (selectedHabits.length > 0) {
      localStorage.setItem('habits-analytics-selected', JSON.stringify(selectedHabits))
    } else {
      localStorage.removeItem('habits-analytics-selected')
    }
  }, [selectedHabits])

  // Calculate date range based on actual data
  const dateRange = useMemo(() => {
    const range = DATE_RANGES.find(r => r.value === selectedRange)
    const days = range?.days || 30
    
    // Get all record dates from all habits
    const allRecordDates = habits.flatMap(habit => 
      habit.records.map(record => new Date(record.date))
    )
    
    if (allRecordDates.length === 0) {
      // Fallback to current date if no data
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
      return { startDate, endDate, days }
    }
    
    // Find the latest date in the data
    const latestDate = new Date(Math.max(...allRecordDates.map(d => d.getTime())))
    
    // Calculate start date based on selected range from the latest data date
    const startDate = new Date(latestDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    
    return { startDate, endDate: latestDate, days }
  }, [selectedRange, habits])

  // Filter habits based on selection and date range
  const filteredHabits = useMemo(() => {
    // If no habits are selected, return empty array (no metrics)
    if (selectedHabits.length === 0) {
      return []
    }

    const habitsToAnalyze = habits.filter(habit => selectedHabits.includes(habit.id))

    return habitsToAnalyze.map(habit => ({
      ...habit,
      records: habit.records.filter(record => 
        record.date >= dateRange.startDate && record.date <= dateRange.endDate
      )
    }))
  }, [habits, dateRange, selectedHabits])

  // Toggle habit selection
  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    )
  }

  // Select all habits
  const selectAllHabits = () => {
    setSelectedHabits(habits.map(h => h.id))
  }

  // Remove all selections
  const removeAllSelections = () => {
    setSelectedHabits([])
  }

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    const totalHabits = habits.length
    const totalPossibleCompletions = totalHabits * dateRange.days
    const totalCompleted = filteredHabits.reduce((sum, habit) => 
      sum + habit.records.filter(r => r.isCompleted).length, 0
    )
    const overallCompletionRate = totalPossibleCompletions > 0 ? (totalCompleted / totalPossibleCompletions) * 100 : 0

    // Calculate current streaks using consistent logic
    const habitStreaks = filteredHabits.map(habit => {
      let streak = 0
      const today = new Date()
      
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
      
      return { habitId: habit.id, habitName: habit.name, streak, color: habit.color }
    })

    const longestActiveStreak = Math.max(...habitStreaks.map(h => h.streak), 0)
    const activeStreaks = habitStreaks.filter(h => h.streak > 0).length

    // Performance by habit
    const habitPerformance = filteredHabits.map(habit => {
      const completedRecords = habit.records.filter(r => r.isCompleted).length
      const completionRate = dateRange.days > 0 ? (completedRecords / dateRange.days) * 100 : 0
      
      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        color: habit.color,
        completionRate,
        completed: completedRecords,
        total: dateRange.days,
        currentStreak: habitStreaks.find(h => h.habitId === habit.id)?.streak || 0
      }
    }).sort((a, b) => b.completionRate - a.completionRate)

    // Habits on track vs needs attention
    const onTrack = habitPerformance.filter(h => h.completionRate >= 80)
    const needsAttention = habitPerformance.filter(h => h.completionRate < 50)

    // Category performance
    const categoryMap = new Map<string, { total: number, completed: number }>()
    filteredHabits.forEach(habit => {
      const completed = habit.records.filter(r => r.isCompleted).length
      const existing = categoryMap.get(habit.category) || { total: 0, completed: 0 }
      categoryMap.set(habit.category, {
        total: existing.total + dateRange.days,
        completed: existing.completed + completed
      })
    })

    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      completed: data.completed,
      total: data.total
    }))

    return {
      totalHabits,
      totalCompleted,
      overallCompletionRate,
      longestActiveStreak,
      activeStreaks,
      habitStreaks,
      habitPerformance,
      onTrack,
      needsAttention,
      categoryPerformance
    }
  }, [filteredHabits, dateRange, habits])

  // Daily completion trend data
  const dailyTrendData = useMemo(() => {
    const dateMap = new Map<string, { date: string, completionRate: number, completed: number, total: number }>()
    
    // Initialize all dates
    for (let d = new Date(dateRange.startDate); d <= dateRange.endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDate(d, 'yyyy-MM-dd')
      dateMap.set(dateKey, { 
        date: dateKey, 
        completionRate: 0, 
        completed: 0, 
        total: habits.length 
      })
    }

    // Populate with actual data
    filteredHabits.forEach(habit => {
      for (let d = new Date(dateRange.startDate); d <= dateRange.endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = formatDate(d, 'yyyy-MM-dd')
        const dayData = dateMap.get(dateKey)
        
        if (dayData) {
          const record = habit.records.find(r => 
            formatDate(r.date, 'yyyy-MM-dd') === dateKey
          )
          
          if (record && record.isCompleted) {
            dayData.completed++
          }
          
          dayData.completionRate = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0
        }
      }
    })

    return Array.from(dateMap.values())
  }, [filteredHabits, dateRange, habits])

  // Weekly habits completion rate for comparison chart
  const allHabitsComparisonData = useMemo(() => {
    const weekMap = new Map<string, Record<string, any>>()
    
    // Generate weeks for the chart based on navigation
    interface WeekInfo {
      start: Date
      end: Date
      key: string
      label: string
    }
    
    const weeks: WeekInfo[] = []
    
    // Calculate start date for the chart based on weekOffset and weeksToShow
    const today = new Date()
    const startOfCurrentWeek = new Date(today)
    startOfCurrentWeek.setDate(today.getDate() - today.getDay()) // Go to Sunday of current week
    
    // Calculate the start of the range we want to show
    const rangeStartWeek = new Date(startOfCurrentWeek)
    rangeStartWeek.setDate(startOfCurrentWeek.getDate() - (weekOffset * 7) - ((weeksToShow - 1) * 7))

    // Generate the specific number of weeks we want to show
    let currentWeekStart = new Date(rangeStartWeek)
    for (let i = 0; i < weeksToShow; i++) {
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekKey = formatDate(currentWeekStart, 'yyyy-MM-dd')
      const weekLabel = `${formatDate(currentWeekStart, 'MMM dd')} - ${formatDate(weekEnd, 'MMM dd')}`
      
      weeks.push({ start: new Date(currentWeekStart), end: weekEnd, key: weekKey, label: weekLabel })
      weekMap.set(weekKey, { date: weekKey, weekLabel })
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }

    // Add data for each habit - only show selected habits
    if (selectedHabits.length === 0) {
      return {
        data: [],
        habits: []
      }
    }

    const habitsToShow = habits.filter(habit => selectedHabits.includes(habit.id))

    habitsToShow.forEach((habit, index) => {
      const habitKey = habit.name.replace(/\s+/g, '')
      const habitColor = habit.color || CHART_COLORS[index % CHART_COLORS.length]
      
      weeks.forEach(week => {
        const weekData = weekMap.get(week.key)
        
        if (weekData) {
          // Count completed days in this week for this habit
          let completedDays = 0
          let totalDays = 0
          
          for (let d = new Date(week.start); d <= week.end; d.setDate(d.getDate() + 1)) {
            if (d >= dateRange.startDate && d <= dateRange.endDate) {
              totalDays++
              const record = habit.records.find(r => 
                formatDate(r.date, 'yyyy-MM-dd') === formatDate(d, 'yyyy-MM-dd')
              )
              
              if (record?.isCompleted) {
                completedDays++
              }
            }
          }
          
          // Store the actual number of days completed instead of percentage
          weekData[habitKey] = completedDays
          weekData[`${habitKey}_color`] = habitColor
        }
      })
    })

    return {
      data: Array.from(weekMap.values()),
      habits: habitsToShow.map((habit, index) => ({
        key: habit.name.replace(/\s+/g, ''),
        name: habit.name,
        color: habit.color || CHART_COLORS[index % CHART_COLORS.length]
      }))
    }
  }, [habits, selectedHabits, weeksToShow, weekOffset])

  const exportData = () => {
    const data = {
      analytics,
      dailyTrendData,
      dateRange: {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0],
        days: dateRange.days
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habits-analytics-${dateRange.startDate.toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (selectedHabit) {
    return (
      <div className="space-y-6">
        {/* Individual Habit Deep-Dive */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedHabit(null)}
            >
              ← Back to Overview
            </Button>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedHabit.color }}
              />
              <h1 className="text-2xl font-bold">{selectedHabit.name}</h1>
              <Badge variant="outline">{selectedHabit.category}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Habit-Specific Heatmap */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Annual Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <AggregatedHabitHeatmap 
                habits={[selectedHabit]}
                selectedHabits={[selectedHabit.id]}
                year={heatmapYear}
                onSelectAllHabits={() => {}}
                onYearChange={setHeatmapYear}
              />
            </CardContent>
          </Card>

          {/* Day of Week Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Day of Week Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[400px] md:min-w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { day: 'Sun', rate: 0 },
                      { day: 'Mon', rate: 0 },
                      { day: 'Tue', rate: 0 },
                      { day: 'Wed', rate: 0 },
                      { day: 'Thu', rate: 0 },
                      { day: 'Fri', rate: 0 },
                      { day: 'Sat', rate: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Bar dataKey="rate" fill={selectedHabit.color || '#8884d8'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedHabit.records
                  .slice(0, 10)
                  .map(record => (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{formatDate(record.date, 'MMM dd, yyyy')}</span>
                      <div className="flex items-center space-x-2">
                        {record.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {record.isCompleted ? 'Completed' : 'Missed'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold">Habits Analytics</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Track your progress and analyze habit patterns</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            {/* Export Button */}
            <Button variant="outline" size="sm" onClick={exportData} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left side: Date Range Selector */}
          <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
            {DATE_RANGES.map(range => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
                className="text-xs sm:text-sm"
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Right side: Compact Habit Selection */}
          <Card className="border shadow-sm w-full lg:w-96">
            <CardHeader className="pb-2 px-3 sm:px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Filter Habits</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {selectedHabits.length}/{habits.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllHabits}
                    disabled={selectedHabits.length === habits.length}
                    className="h-6 px-2 text-xs text-[#007BFF] hover:bg-[#007BFF]/10"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeAllSelections}
                    disabled={selectedHabits.length === 0}
                    className="h-6 px-2 text-xs text-[#FF4C4C] hover:bg-[#FF4C4C]/10"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    None
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="h-6 px-2 text-xs"
                  >
                    {isFilterExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isFilterExpanded && (
              <CardContent className="pt-0 px-3 sm:px-4">
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {habits.map(habit => {
                      const isExplicitlySelected = selectedHabits.includes(habit.id)
                      
                      return (
                        <div 
                          key={habit.id} 
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer 
                            transition-all duration-200 text-xs
                            ${isExplicitlySelected
                              ? 'bg-[#2D2D2D] border-[#2D2D2D] text-white shadow-sm' 
                              : 'bg-[#F0F0F0] border-[#E0E0E0] hover:bg-[#E8E8E8] text-[#333333]'
                            }
                          `}
                          onClick={() => toggleHabitSelection(habit.id)}
                        >
                          <Checkbox
                            checked={isExplicitlySelected}
                            onCheckedChange={() => toggleHabitSelection(habit.id)}
                            className={`
                              pointer-events-none h-3 w-3
                              ${isExplicitlySelected 
                                ? 'data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]' 
                                : 'border-[#999999] data-[state=unchecked]:bg-white'
                              }
                            `}
                          />
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: habit.color }}
                            />
                            <span className="truncate text-xs">
                              {habit.name}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {selectedHabits.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>Analyzing {selectedHabits.length} habits</span>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={analyticsTab} onValueChange={(value) => setAnalyticsTab(value as 'overview' | 'trends' | 'heatmaps')}>
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="heatmaps" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Heatmaps</span>
            <span className="sm:hidden">Heat</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {selectedHabits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Habits Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Please select at least one habit from the filter above to view analytics.
                </p>
                <Button onClick={selectAllHabits} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Select All Habits
                </Button>
              </CardContent>
            </Card>
          ) : (
          <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Overall Completion</p>
                    <p className="text-2xl font-bold">{analytics.overallCompletionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Longest Streak</p>
                    <p className="text-2xl font-bold">{analytics.longestActiveStreak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Total Completed</p>
                    <p className="text-2xl font-bold">{analytics.totalCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Active Habits</p>
                    <p className="text-2xl font-bold">{analytics.totalHabits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Completion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] md:min-w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      key={selectedHabits.join(',')} 
                      data={dailyTrendData} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => formatDate(new Date(value), 'MM/dd')}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Completion Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completionRate" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                        animationDuration={300}
                        animationBegin={0}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Mobile scroll hint */}
              <div className="block md:hidden text-xs text-muted-foreground text-center mt-2">
                ← Scroll horizontally to see full chart →
              </div>
            </CardContent>
          </Card>

          {/* Habits Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* On Track */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  On Track ({analytics.onTrack.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.onTrack.slice(0, 5).map(habit => (
                    <div 
                      key={habit.id} 
                      className="flex items-center justify-between p-2 rounded bg-green-50 cursor-pointer hover:bg-green-100"
                      onClick={() => setSelectedHabit(habits.find(h => h.id === habit.id) || null)}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm font-medium">{habit.name}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {habit.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                  {analytics.onTrack.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No habits above 80% yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Needs Attention ({analytics.needsAttention.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.needsAttention.slice(0, 5).map(habit => (
                    <div 
                      key={habit.id} 
                      className="flex items-center justify-between p-2 rounded bg-orange-50 cursor-pointer hover:bg-orange-100"
                      onClick={() => setSelectedHabit(habits.find(h => h.id === habit.id) || null)}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-sm font-medium">{habit.name}</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {habit.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                  {analytics.needsAttention.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All habits performing well! 🎉
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {selectedHabits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Habits Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Please select at least one habit from the filter above to view trends.
                </p>
                <Button onClick={selectAllHabits} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Select All Habits
                </Button>
              </CardContent>
            </Card>
          ) : (
          <>
          {/* Weekly Habits Completion Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Habits Completion Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compare weekly completion rates across all habits (days completed per week)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekOffset(weekOffset + weeksToShow)}
                    className="h-8"
                  >
                    ← Previous {weeksToShow} weeks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - weeksToShow))}
                    disabled={weekOffset === 0}
                    className="h-8"
                  >
                    Next {weeksToShow} weeks →
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <select
                    value={weeksToShow}
                    onChange={(e) => setWeeksToShow(Number(e.target.value))}
                    className="px-2 py-1 text-sm border rounded-md bg-background"
                  >
                    <option value={10}>10 weeks</option>
                    <option value={15}>15 weeks</option>
                    <option value={20}>20 weeks</option>
                    <option value={30}>30 weeks</option>
                    <option value={52}>1 year</option>
                  </select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {weekOffset > 0 ? `${weekOffset} weeks ago` : 'Current period'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  key={selectedHabits.join(',')} 
                  data={allHabitsComparisonData.data} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekLabel" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 7]} 
                    label={{ value: 'Days Completed', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Week: ${value}`}
                    formatter={(value, name) => [`${Number(value).toFixed(1)} days`, name]}
                    wrapperStyle={{ zIndex: 9999 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) {
                        return null
                      }
                      
                      // Calculate completed and not completed counts
                      const totalHabits = payload.length
                      const completedHabits = payload.filter(entry => Number(entry.value) > 0).length
                      const notCompletedHabits = totalHabits - completedHabits
                      
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-w-xs z-[9999] relative">
                          <p className="font-semibold text-sm mb-2 text-gray-900">{`Week: ${label}`}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                              <span className="font-medium text-gray-700">Completed:</span>
                              <span className="text-gray-600 font-semibold">{completedHabits}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-700">Not Completed:</span>
                              <span className="text-gray-600 font-semibold">{notCompletedHabits}</span>
                            </div>
                            <div className="pt-1 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-gray-700">Total Habits:</span>
                                <span className="text-gray-600 font-semibold">{totalHabits}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Legend />
                  {allHabitsComparisonData.habits.map((habit) => (
                    <Line
                      key={habit.key}
                      type="monotone"
                      dataKey={habit.key}
                      stroke={habit.color}
                      strokeWidth={2}
                      name={habit.name}
                      connectNulls={false}
                      dot={{ r: 4, strokeWidth: 2, stroke: habit.color }}
                      animationDuration={300}
                      animationBegin={0}
                      isAnimationActive={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Radar view of completion rates across categories
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart 
                  key={selectedHabits.join(',')} 
                  data={analytics.categoryPerformance} 
                  margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                >
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      className="text-sm font-medium"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Completion Rate"
                      dataKey="completionRate"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#8884d8" }}
                      animationDuration={300}
                      animationBegin={0}
                      isAnimationActive={true}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Completion Rate']}
                      labelFormatter={(value) => `Category: ${value}`}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Habit Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Habit Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {analytics.habitPerformance.map((habit, index) => (
                    <div 
                      key={habit.id} 
                      className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedHabit(habits.find(h => h.id === habit.id) || null)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <div>
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">{habit.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{habit.completionRate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">
                          {habit.currentStreak} day streak
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </TabsContent>

        {/* Heatmaps Tab */}
        <TabsContent value="heatmaps" className="space-y-4">
          <AggregatedHabitHeatmap 
            habits={habits}
            selectedHabits={selectedHabits}
            year={heatmapYear}
            onSelectAllHabits={selectAllHabits}
            onYearChange={setHeatmapYear}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}