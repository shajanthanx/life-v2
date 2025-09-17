'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowRight } from 'lucide-react'
import { Transaction, SavingsGoal } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface FinanceOverviewProps {
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  onNavigateToFinance: () => void
}

export function FinanceOverview({ transactions, savingsGoals, onNavigateToFinance }: FinanceOverviewProps) {
  // Calculate current month's data
  const currentMonthData = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netIncome = monthIncome - monthExpenses
    const savingsRate = monthIncome > 0 ? (netIncome / monthIncome) * 100 : 0
    
    return {
      income: monthIncome,
      expenses: monthExpenses,
      net: netIncome,
      savingsRate: savingsRate,
      transactionCount: monthTransactions.length
    }
  }, [transactions])

  // Calculate savings overview
  const savingsOverview = useMemo(() => {
    const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const totalTargets = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
    const completedGoals = savingsGoals.filter(goal => goal.isCompleted).length
    const progress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0
    
    return {
      totalSaved,
      totalTargets,
      completedGoals,
      progress,
      activeGoals: savingsGoals.length - completedGoals
    }
  }, [savingsGoals])

  const hasData = transactions.length > 0 || savingsGoals.length > 0

  if (!hasData) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Start Your Financial Journey</h3>
                <p className="text-sm text-gray-600">Track expenses, set savings goals, and build wealth</p>
              </div>
            </div>
            <Button onClick={onNavigateToFinance} className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Financial Overview</CardTitle>
              <p className="text-sm text-gray-600">This month's performance & savings progress</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onNavigateToFinance} className="gap-2 w-fit">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Month Performance */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              📊 This Month
            </h4>
            
            <div className="grid gap-3">
              {/* Income */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Income</span>
                </div>
                <span className="font-bold text-green-700">{formatCurrency(currentMonthData.income)}</span>
              </div>
              
              {/* Expenses */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Expenses</span>
                </div>
                <span className="font-bold text-red-700">{formatCurrency(currentMonthData.expenses)}</span>
              </div>
              
              {/* Net Income */}
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                currentMonthData.net >= 0 
                  ? 'bg-blue-50 border-blue-100' 
                  : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <DollarSign className={`h-4 w-4 ${currentMonthData.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${currentMonthData.net >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                    Net Income
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${currentMonthData.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {currentMonthData.net >= 0 ? '+' : ''}{formatCurrency(currentMonthData.net)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentMonthData.savingsRate.toFixed(1)}% savings rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Overview */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              🎯 Savings Goals
            </h4>
            
            {savingsGoals.length > 0 ? (
              <div className="space-y-3">
                {/* Total Progress */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Total Progress</span>
                    <span className="text-lg font-bold text-purple-700">{savingsOverview.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(savingsOverview.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-purple-600">
                    <span>{formatCurrency(savingsOverview.totalSaved)}</span>
                    <span>{formatCurrency(savingsOverview.totalTargets)}</span>
                  </div>
                </div>
                
                {/* Goal Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-lg sm:text-xl font-bold text-green-700">{savingsOverview.completedGoals}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-lg sm:text-xl font-bold text-blue-700">{savingsOverview.activeGoals}</div>
                    <div className="text-xs text-blue-600">Active</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                <PiggyBank className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">No savings goals yet</p>
                <Button variant="outline" size="sm" onClick={onNavigateToFinance}>
                  Create Goal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
            <span className="text-center sm:text-left">{currentMonthData.transactionCount} transactions this month</span>
            <div className="flex justify-center sm:justify-end">
              {currentMonthData.savingsRate >= 20 ? (
                <Badge className="bg-green-100 text-green-800 text-xs">Great Savings Rate! 🎉</Badge>
              ) : currentMonthData.savingsRate >= 10 ? (
                <Badge variant="outline" className="border-yellow-300 text-yellow-700 text-xs">Good Progress</Badge>
              ) : (
                <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">Room for Improvement</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
