'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Budget, Transaction } from '@/types'
import { formatCurrency, getProgressPercentage } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface BudgetOverviewProps {
  budgets: Budget[]
  transactions: Transaction[]
}

export function BudgetOverview({ budgets, transactions }: BudgetOverviewProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear)
  
  const totalAllocated = currentBudgets.reduce((acc, budget) => acc + budget.allocated, 0)
  const totalSpent = currentBudgets.reduce((acc, budget) => acc + budget.spent, 0)
  const totalRemaining = totalAllocated - totalSpent
  const overallProgress = getProgressPercentage(totalSpent, totalAllocated)

  const getBudgetStatus = (budget: Budget) => {
    const progress = getProgressPercentage(budget.spent, budget.allocated)
    if (progress >= 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
    if (progress >= 90) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' }
    if (progress >= 75) return { status: 'caution', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' }
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return AlertTriangle
      case 'warning':
      case 'caution':
        return TrendingUp
      default:
        return CheckCircle
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{monthNames[currentMonth]} {currentYear} Budget Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Allocated</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAllocated)}</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {overallProgress.toFixed(1)}% of budget
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${totalRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm text-muted-foreground mb-1">Remaining</div>
              <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalRemaining))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalRemaining >= 0 ? 'under budget' : 'over budget'}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Budget Progress</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}
              </span>
            </div>
            <Progress value={overallProgress} className={overallProgress > 100 ? 'bg-red-100' : ''} />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBudgets.map((budget) => {
              const progress = getProgressPercentage(budget.spent, budget.allocated)
              const status = getBudgetStatus(budget)
              const StatusIcon = getStatusIcon(status.status)
              const remaining = budget.allocated - budget.spent

              return (
                <Card key={budget.id} className={status.bgColor}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        <div>
                          <h4 className="font-medium">{budget.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.allocated)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`${status.color} border-current`}
                        >
                          {progress.toFixed(0)}%
                        </Badge>
                        <div className={`text-sm font-medium mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`} left
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={progress} 
                      className={progress > 100 ? 'bg-red-100' : ''} 
                    />
                    
                    {progress >= 90 && (
                      <div className={`mt-2 text-xs ${status.color}`}>
                        {progress >= 100 
                          ? '⚠️ Budget exceeded! Consider reducing spending in this category.'
                          : '⚠️ Approaching budget limit. Monitor spending closely.'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {currentBudgets.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No budgets set for this month</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create budgets to track your spending by category
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Smart Budgeting</h4>
              <p className="text-sm text-blue-700">
                Follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings and debt repayment.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📊 Track Progress</h4>
              <p className="text-sm text-green-700">
                Review your budget weekly to stay on track and make adjustments as needed.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">🎯 Set Realistic Goals</h4>
              <p className="text-sm text-purple-700">
                Base your budget on actual spending patterns, not just ideal numbers.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">🚨 Emergency Buffer</h4>
              <p className="text-sm text-orange-700">
                Keep 5-10% of your budget unallocated for unexpected expenses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
