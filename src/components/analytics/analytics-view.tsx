'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AppState } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { TrendingUp, Target, Activity, DollarSign, Calendar, Award } from 'lucide-react'

interface AnalyticsViewProps {
  data: AppState
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Helper function to get last N days
  const getLastNDays = (n: number) => {
    const days = []
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  // Productivity Analytics
  const last30Days = getLastNDays(30)
  const last7Days = getLastNDays(7)

  const productivityData = last7Days.map(date => {
    const dateStr = date.toDateString()
    
    // Tasks completed on this date
    const tasksCompleted = data.tasks.filter(task => 
      task.completedAt && new Date(task.completedAt).toDateString() === dateStr
    ).length

    // Habits completed on this date
    const habitsCompleted = data.habits.reduce((acc, habit) => {
      const record = habit.records.find(r => 
        new Date(r.date).toDateString() === dateStr && r.isCompleted
      )
      return acc + (record ? 1 : 0)
    }, 0)

    // Goals progress made on this date (simplified)
    const goalsProgress = data.goals.filter(goal => 
      new Date(goal.createdAt).toDateString() === dateStr
    ).length * 10 // Simple metric

    return {
      date: date.getDate(),
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: tasksCompleted,
      habits: habitsCompleted,
      goals: goalsProgress,
      total: tasksCompleted + habitsCompleted + goalsProgress
    }
  })

  // Health Analytics
  const healthData = last7Days.map(date => {
    const dateStr = date.toDateString()
    
    const sleepRecord = data.sleepRecords.find(record => 
      new Date(record.date).toDateString() === dateStr
    )
    
    const exerciseRecord = data.exerciseRecords.find(record => 
      new Date(record.date).toDateString() === dateStr
    )

    return {
      date: date.getDate(),
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sleep: sleepRecord ? sleepRecord.hoursSlept : 0,
      sleepQuality: sleepRecord ? sleepRecord.quality * 2 : 0, // Scale to 10
      exercise: exerciseRecord ? exerciseRecord.duration : 0
    }
  })

  // Finance Analytics
  const financeData = last30Days.map(date => {
    const dateStr = date.toDateString()
    
    const dayTransactions = data.transactions.filter(transaction =>
      new Date(transaction.date).toDateString() === dateStr
    )
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      date: date.getDate(),
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      income,
      expenses,
      net: income - expenses
    }
  })

  // Spending by Category
  const spendingByCategory = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

  const categoryData = Object.entries(spendingByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / Object.values(spendingByCategory).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }))

  // Life Balance Radar Chart
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const tasksThisMonth = data.tasks.filter(task => {
    const taskDate = new Date(task.createdAt)
    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
  })
  
  const completedTasks = tasksThisMonth.filter(task => task.isCompleted).length
  const taskCompletionRate = tasksThisMonth.length > 0 ? (completedTasks / tasksThisMonth.length) * 100 : 0

  const avgSleep = data.sleepRecords.length > 0 
    ? (data.sleepRecords.reduce((acc, record) => acc + record.hoursSlept, 0) / data.sleepRecords.length) / 8 * 100
    : 0

  const exerciseMinutes = data.exerciseRecords.reduce((acc, record) => acc + record.duration, 0)
  const exerciseScore = Math.min((exerciseMinutes / 150) * 100, 100) // 150 minutes per week target

  const monthlyBudgets = data.budgets.filter(b => b.month === currentMonth && b.year === currentYear)
  const budgetHealth = monthlyBudgets.length > 0 
    ? 100 - (monthlyBudgets.reduce((acc, budget) => acc + (budget.spent / budget.allocated), 0) / monthlyBudgets.length * 100)
    : 0

  const goalsProgress = data.goals.length > 0
    ? data.goals.reduce((acc, goal) => acc + (goal.currentValue / goal.targetValue) * 100, 0) / data.goals.length
    : 0

  const habitsSuccess = data.habits.length > 0
    ? data.habits.reduce((acc, habit) => {
        const recentRecords = habit.records.slice(0, 7)
        const successRate = recentRecords.filter(r => r.isCompleted).length / Math.max(recentRecords.length, 1)
        return acc + successRate * 100
      }, 0) / data.habits.length
    : 0

  const lifeBalanceData = [
    { subject: 'Tasks', A: Math.round(taskCompletionRate), fullMark: 100 },
    { subject: 'Sleep', A: Math.round(avgSleep), fullMark: 100 },
    { subject: 'Exercise', A: Math.round(exerciseScore), fullMark: 100 },
    { subject: 'Budget', A: Math.round(Math.max(budgetHealth, 0)), fullMark: 100 },
    { subject: 'Goals', A: Math.round(goalsProgress), fullMark: 100 },
    { subject: 'Habits', A: Math.round(habitsSuccess), fullMark: 100 }
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

  // Key Insights
  const insights = [
    {
      type: 'success',
      title: 'Strong Habit Building',
      description: `You're maintaining ${data.habits.filter(h => h.isActive).length} active habits with an average success rate of ${Math.round(habitsSuccess)}%`,
      icon: Award
    },
    {
      type: 'warning',
      title: 'Budget Monitoring',
      description: `${monthlyBudgets.filter(b => (b.spent / b.allocated) > 0.8).length} categories are approaching budget limits`,
      icon: DollarSign
    },
    {
      type: 'info',
      title: 'Goal Progress',
      description: `${Math.round(goalsProgress)}% average progress across all active goals`,
      icon: Target
    },
    {
      type: 'success',
      title: 'Health Tracking',
      description: `Averaging ${avgSleep > 0 ? (avgSleep * 8 / 100).toFixed(1) : 0} hours of sleep and ${Math.round(exerciseMinutes / 7)} minutes of exercise per week`,
      icon: Activity
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <p className="text-muted-foreground">Comprehensive analysis of your life metrics and progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Life Balance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Life Balance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={lifeBalanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Balance"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {insights.map((insight, index) => {
                    const Icon = insight.icon
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.type === 'success' ? 'border-green-500 bg-green-50' :
                          insight.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${
                            insight.type === 'success' ? 'text-green-600' :
                            insight.type === 'warning' ? 'text-orange-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="mt-6">
          <div className="space-y-6">
            {/* Weekly Productivity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Productivity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Tasks"
                      />
                      <Area
                        type="monotone"
                        dataKey="habits"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Habits"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.goals.slice(0, 5).map((goal) => {
                    const progress = (goal.currentValue / goal.targetValue) * 100
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{goal.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="space-y-6">
            {/* Health Metrics Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sleep"
                        stroke="#8884d8"
                        name="Sleep (hours)"
                      />
                      <Line
                        type="monotone"
                        dataKey="exercise"
                        stroke="#82ca9d"
                        name="Exercise (minutes)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Quality */}
            <Card>
              <CardHeader>
                <CardTitle>Sleep Quality Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="sleepQuality" fill="#8884d8" name="Sleep Quality (1-10)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="mt-6">
          <div className="space-y-6">
            {/* Income vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#ff7c7c"
                        fill="#ff7c7c"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(category.value)} ({category.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
