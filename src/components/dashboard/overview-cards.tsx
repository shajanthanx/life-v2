'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Target, 
  Activity, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame
} from 'lucide-react'
import { formatCurrency, getProgressPercentage } from '@/lib/utils'

interface OverviewCardsProps {
  tasksCompleted: number
  totalTasks: number
  goalsProgress: number
  habitStreaks: { name: string; streak: number; color: string }[]
  healthScore: number
  budgetUsed: number
  totalBudget: number
  savingsProgress: number
}

export function OverviewCards({
  tasksCompleted,
  totalTasks,
  goalsProgress,
  habitStreaks,
  healthScore,
  budgetUsed,
  totalBudget,
  savingsProgress
}: OverviewCardsProps) {
  const taskCompletionRate = getProgressPercentage(tasksCompleted, totalTasks)
  const budgetUsageRate = getProgressPercentage(budgetUsed, totalBudget)
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tasks Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksCompleted}/{totalTasks}</div>
          <Progress value={taskCompletionRate} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {taskCompletionRate.toFixed(0)}% completed
          </p>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{goalsProgress.toFixed(0)}%</div>
          <Progress value={goalsProgress} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Average completion across all goals
          </p>
        </CardContent>
      </Card>

      {/* Health Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{healthScore}/100</div>
            {healthScore >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Progress value={healthScore} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Based on sleep, exercise, and habits
          </p>
        </CardContent>
      </Card>

      {/* Financial Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget This Month</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(budgetUsed)}</div>
          <Progress 
            value={budgetUsageRate} 
            className={`mt-3 ${budgetUsageRate > 90 ? 'bg-red-100' : ''}`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {budgetUsageRate.toFixed(0)}% of {formatCurrency(totalBudget)} budget
          </p>
        </CardContent>
      </Card>

      {/* Habit Streaks */}
      <Card className="sm:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Current Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habitStreaks.slice(0, 3).map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge 
                  style={{ backgroundColor: habit.color }}
                  className="text-white"
                >
                  {habit.streak}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Progress */}
      <Card className="sm:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Savings Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Emergency Fund</span>
                <span className="text-sm text-muted-foreground">{savingsProgress.toFixed(0)}%</span>
              </div>
              <Progress value={savingsProgress} />
            </div>
            <div className="text-sm text-muted-foreground">
              You're doing great! Keep building your financial security.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
