'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Calendar, Target, 
  BarChart3, Activity, Flame, CheckCircle2, AlertTriangle,
  Download, ArrowUp, ArrowDown, Hash, Users
} from 'lucide-react'
import { Habit, HabitRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import { HabitHeatmap } from './habit-heatmap'

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
  const [selectedRange, setSelectedRange] = useState<string>('30d')
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

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

  // Filter habits and records based on date range
  const filteredHabits = useMemo(() => {
    return habits.map(habit => ({
      ...habit,
      records: habit.records.filter(record => 
        record.date >= dateRange.startDate && record.date <= dateRange.endDate
      )
    }))
  }, [habits, dateRange])

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    const totalHabits = habits.length
    const totalPossibleCompletions = totalHabits * dateRange.days
    const totalCompleted = filteredHabits.reduce((sum, habit) => 
      sum + habit.records.filter(r => r.isCompleted).length, 0
    )
    const overallCompletionRate = totalPossibleCompletions > 0 ? (totalCompleted / totalPossibleCompletions) * 100 : 0

    // Calculate current streaks
    const habitStreaks = filteredHabits.map(habit => {
      let streak = 0
      const latestDate = dateRange.endDate
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(latestDate.getTime() - i * 24 * 60 * 60 * 1000)
        
        const record = habit.records.find(r => {
          const recordDate = new Date(r.date)
          return recordDate.toDateString() === checkDate.toDateString()
        })
        
        if (record && record.isCompleted) {
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
              <HabitHeatmap habit={selectedHabit} year={new Date().getFullYear()} />
            </CardContent>
          </Card>

          {/* Day of Week Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Day of Week Performance</CardTitle>
            </CardHeader>
            <CardContent>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits Analytics</h1>
          <p className="text-muted-foreground">Track your progress and analyze habit patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Date Range Selector */}
          <div className="flex gap-1">
            {DATE_RANGES.map(range => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          
          {/* Export Button */}
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* 📅 Overall Performance & At-a-Glance View */}
      <div className="space-y-6">
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

        {/* Overall Performance Heatmap & Status Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Completion Rate */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDate(new Date(value), 'MM/dd')}
                  />
                  <YAxis />
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habits Status */}
          <div className="space-y-4">
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
        </div>
      </div>

      {/* 📈 Trends & Performance Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Completion Rate']} />
                <Bar dataKey="completionRate" fill="#82ca9d" />
              </BarChart>
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

      {/* Yearly Heatmaps */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {habits.slice(0, 3).map(habit => (
              <div key={habit.id}>
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: habit.color }}
                  />
                  <h3 className="font-medium">{habit.name}</h3>
                </div>
                <HabitHeatmap habit={habit} year={new Date().getFullYear()} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}