'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SavingsGoal } from '@/types'
import { formatCurrency, formatDate, getProgressPercentage } from '@/lib/utils'
import { Target, Plus, Calendar, TrendingUp, Trophy, DollarSign } from 'lucide-react'

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[]
  onAddGoal: () => void
  onUpdateGoal: (goal: SavingsGoal) => void
}

export function SavingsGoals({ savingsGoals, onAddGoal, onUpdateGoal }: SavingsGoalsProps) {
  const activeGoals = savingsGoals.filter(goal => !goal.isCompleted)
  const completedGoals = savingsGoals.filter(goal => goal.isCompleted)
  
  const totalTargetAmount = activeGoals.reduce((acc, goal) => acc + goal.targetAmount, 0)
  const totalCurrentAmount = activeGoals.reduce((acc, goal) => acc + goal.currentAmount, 0)
  const overallProgress = totalTargetAmount > 0 ? getProgressPercentage(totalCurrentAmount, totalTargetAmount) : 0

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: 'Overdue', color: 'text-red-500', bgColor: 'bg-red-50' }
    if (days === 0) return { text: 'Due today', color: 'text-orange-500', bgColor: 'bg-orange-50' }
    if (days <= 30) return { text: `${days} days left`, color: 'text-orange-500', bgColor: 'bg-orange-50' }
    if (days <= 90) return { text: `${days} days left`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { text: `${days} days left`, color: 'text-green-600', bgColor: 'bg-green-50' }
  }

  const calculateMonthlyTarget = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount
    const now = new Date()
    const deadline = new Date(goal.deadline)
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    return remaining / monthsRemaining
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <span>Savings Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrentAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalTargetAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Target</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallProgress.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>

          {totalTargetAmount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Savings Progress</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(totalCurrentAmount)} / {formatCurrency(totalTargetAmount)}
                </span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Savings Goals</CardTitle>
          <Button onClick={onAddGoal}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount)
              const remaining = goal.targetAmount - goal.currentAmount
              const timeRemaining = getTimeRemaining(new Date(goal.deadline))
              const monthlyTarget = calculateMonthlyTarget(goal)
              
              return (
                <Card key={goal.id} className={timeRemaining.bgColor}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {formatCurrency(goal.targetAmount)} by {formatDate(new Date(goal.deadline))}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={timeRemaining.color}>
                          {timeRemaining.text}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {progress.toFixed(1)}% complete • {formatCurrency(remaining)} remaining
                        </p>
                      </div>

                      {/* Monthly Target */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Monthly target to reach goal
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-800">
                          {formatCurrency(monthlyTarget)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const amount = prompt('How much would you like to add to this goal?')
                            if (amount && !isNaN(Number(amount))) {
                              const updatedGoal = {
                                ...goal,
                                currentAmount: goal.currentAmount + Number(amount)
                              }
                              if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
                                updatedGoal.isCompleted = true
                              }
                              onUpdateGoal(updatedGoal)
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Money
                        </Button>
                        
                        {progress >= 100 && (
                          <Button
                            size="sm"
                            onClick={() => onUpdateGoal({ ...goal, isCompleted: true })}
                          >
                            <Trophy className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {activeGoals.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No active savings goals</p>
              <Button onClick={onAddGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Savings Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span>Completed Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed • Target: {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(goal.currentAmount)}
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      Achieved!
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🎯 Set SMART Goals</h4>
              <p className="text-sm text-blue-700">
                Make your savings goals Specific, Measurable, Achievable, Relevant, and Time-bound.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔄 Automate Savings</h4>
              <p className="text-sm text-green-700">
                Set up automatic transfers to your savings account to make progress effortless.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📊 Track Progress</h4>
              <p className="text-sm text-purple-700">
                Regular monitoring helps you stay motivated and adjust your strategy when needed.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">🏆 Celebrate Milestones</h4>
              <p className="text-sm text-orange-700">
                Reward yourself when you reach savings milestones to maintain motivation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
