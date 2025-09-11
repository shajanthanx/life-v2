'use client'

import { useState, useMemo } from 'react'
import { OverviewCards } from './overview-cards'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'
import { AggregatedHabitHeatmap } from '../habits/aggregated-habit-heatmap'
import { AppState } from '@/types'
import { formatDate, calculateStreak } from '@/lib/utils'

interface DashboardViewProps {
  data: AppState
  onQuickAction: (action: string) => void
}

export function DashboardView({ data, onQuickAction }: DashboardViewProps) {
  // State for heatmap
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  
  // Initialize selected habits to all habits
  useMemo(() => {
    if (data.habits.length > 0 && selectedHabits.length === 0) {
      setSelectedHabits(data.habits.map(h => h.id))
    }
  }, [data.habits, selectedHabits.length])

  // Calculate dashboard metrics
  const today = new Date()
  const todayTasks = data.tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate.toDateString() === today.toDateString()
  })
  
  const completedTasks = todayTasks.filter(task => task.isCompleted).length
  const totalTasks = todayTasks.length

  // Calculate goals progress
  const goalsProgress = data.goals.length > 0 
    ? data.goals.reduce((acc, goal) => acc + (goal.currentValue / goal.targetValue) * 100, 0) / data.goals.length
    : 0

  // Calculate habit streaks
  const habitStreaks = data.habits.map(habit => {
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
    
    return {
      name: habit.name,
      streak,
      color: habit.color
    }
  }).sort((a, b) => b.streak - a.streak)

  // Calculate health score (based on sleep, exercise, habits)
  const recentSleep = data.sleepRecords.slice(0, 7)
  const avgSleep = recentSleep.reduce((acc, sleep) => acc + sleep.hoursSlept, 0) / Math.max(recentSleep.length, 1)
  const avgSleepQuality = recentSleep.reduce((acc, sleep) => acc + sleep.quality, 0) / Math.max(recentSleep.length, 1)
  
  const recentHabits = data.habits.filter(h => h.category === 'health' || h.category === 'fitness')
  const habitCompletionRate = recentHabits.length > 0 
    ? recentHabits.reduce((acc, habit) => {
        const recentRecords = habit.records.slice(0, 7)
        const completionRate = recentRecords.filter(r => r.isCompleted).length / Math.max(recentRecords.length, 1)
        return acc + completionRate
      }, 0) / recentHabits.length
    : 0

  const healthScore = Math.round(
    (Math.min(avgSleep / 8, 1) * 30) + // Sleep hours (30% weight)
    (avgSleepQuality / 5 * 30) + // Sleep quality (30% weight)
    (habitCompletionRate * 40) // Habit completion (40% weight)
  )

  // Calculate financial metrics
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const currentBudgets = data.budgets.filter(b => b.month === currentMonth && b.year === currentYear)
  const totalBudget = currentBudgets.reduce((acc, budget) => acc + budget.allocated, 0)
  const budgetUsed = currentBudgets.reduce((acc, budget) => acc + budget.spent, 0)

  // Calculate savings progress
  const savingsGoals = data.savingsGoals.filter(goal => !goal.isCompleted)
  const savingsProgress = savingsGoals.length > 0 
    ? savingsGoals.reduce((acc, goal) => acc + (goal.currentAmount / goal.targetAmount) * 100, 0) / savingsGoals.length
    : 0

  // Generate recent activity
  const recentActivity = [
    ...data.tasks
      .filter(task => task.completedAt && new Date(task.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .map((task, index) => ({
        id: `task-${task.id}-${index}`,
        type: 'task' as const,
        title: task.title,
        description: `Completed ${task.category} task`,
        timestamp: task.completedAt!
      })),
    ...data.transactions
      .filter(transaction => new Date(transaction.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .slice(0, 3)
      .map((transaction, index) => ({
        id: `transaction-${transaction.id}-${index}`,
        type: 'expense' as const,
        title: transaction.description,
        description: `${transaction.type} of $${transaction.amount}`,
        timestamp: transaction.date
      })),
    ...data.journalEntries
      .filter(entry => new Date(entry.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .slice(0, 2)
      .map((entry, index) => ({
        id: `journal-${entry.id}-${index}`,
        type: 'journal' as const,
        title: entry.title || 'Journal Entry',
        description: entry.content.substring(0, 50) + '...',
        timestamp: entry.date
      }))
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">
          Welcome to your dashboard! 👋
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s your daily overview for {formatDate(today)}. You&apos;re doing great!
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards
        tasksCompleted={completedTasks}
        totalTasks={totalTasks}
        goalsProgress={goalsProgress}
        habitStreaks={habitStreaks}
        healthScore={healthScore}
        budgetUsed={budgetUsed}
        totalBudget={totalBudget}
        savingsProgress={savingsProgress}
      />

      {/* Habits Heatmap */}
      {data.habits.length > 0 && (
        <AggregatedHabitHeatmap 
          habits={data.habits}
          selectedHabits={selectedHabits}
          year={new Date().getFullYear()}
          onSelectAllHabits={() => setSelectedHabits(data.habits.map(h => h.id))}
        />
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions onAction={onQuickAction} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  )
}
