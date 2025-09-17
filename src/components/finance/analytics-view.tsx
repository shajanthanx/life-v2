'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Category, Transaction, SavingsGoal, PredefinedExpense, UserAccount } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getUserSavingsGoals } from '@/lib/api/savings-goals'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Percent,
  Plus,
  PiggyBank
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts'

interface AnalyticsViewProps {
  transactions: Transaction[]
  categories: Category[]
  predefinedExpenses: PredefinedExpense[]
  accounts?: UserAccount[]
}


const COLORS = ['#17BEBB', '#C41E3D', '#2667FF', '#D62246', '#3B6064', '#17BEBB', '#C41E3D', '#2667FF']

export function AnalyticsView({ 
  transactions, 
  categories, 
  predefinedExpenses,
  accounts = []
}: AnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M')
  const [analysisType, setAnalysisType] = useState<'overview' | 'trends'>('overview')
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])

  // Load savings goals from API
  useEffect(() => {
    const loadSavingsGoals = async () => {
      try {
        const { data, error } = await getUserSavingsGoals()
        if (error) {
          console.error('Error loading savings goals:', error)
        } else {
          setSavingsGoals(data)
        }
      } catch (error) {
        console.error('Error loading savings goals:', error)
      }
    }

    loadSavingsGoals()
  }, [])

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  switch (timeRange) {
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6)
      break
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  const filteredTransactions = transactions.filter(t => 
    t.date >= startDate && t.date <= endDate
  )

  // Core financial metrics with comparison to previous period
  const metrics = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income')
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

    // Monthly averages
    const monthsInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const avgMonthlyIncome = totalIncome / monthsInRange
    const avgMonthlyExpenses = totalExpenses / monthsInRange

    // Calculate previous period for comparison
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(startDate)
    const periodLength = endDate.getTime() - startDate.getTime()
    previousStartDate.setTime(startDate.getTime() - periodLength)

    const previousTransactions = transactions.filter(t => 
      t.date >= previousStartDate && t.date < startDate
    )
    
    const prevIncome = previousTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const prevExpenses = previousTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const prevNetIncome = prevIncome - prevExpenses
    const prevSavingsRate = prevIncome > 0 ? (prevNetIncome / prevIncome) * 100 : 0

    // Calculate percentage changes
    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0
    const netIncomeChange = prevNetIncome !== 0 ? ((netIncome - prevNetIncome) / Math.abs(prevNetIncome)) * 100 : 0
    const savingsRateChange = savingsRate - prevSavingsRate

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      transactionCount: filteredTransactions.length,
      comparison: {
        incomeChange,
        expenseChange,
        netIncomeChange,
        savingsRateChange,
        hasPreviousData: previousTransactions.length > 0
      }
    }
  }, [filteredTransactions, startDate, endDate, transactions])

  // Calculate savings metrics
  const savingsMetrics = useMemo(() => {
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const totalSavingsTargets = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
    const completedGoals = savingsGoals.filter(goal => goal.isCompleted).length
    const activeSavingsGoals = savingsGoals.filter(goal => !goal.isCompleted)
    const savingsProgress = totalSavingsTargets > 0 ? (totalSavings / totalSavingsTargets) * 100 : 0

    // Calculate savings by account
    const savingsByAccount = savingsGoals.reduce((acc, goal) => {
      const account = goal.account || 'other'
      acc[account] = (acc[account] || 0) + goal.currentAmount
      return acc
    }, {} as Record<string, number>)

    return {
      totalSavings,
      totalSavingsTargets,
      completedGoals,
      activeSavingsGoals: activeSavingsGoals.length,
      savingsProgress,
      savingsByAccount
    }
  }, [savingsGoals])

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = categories.find(c => c.id === t.categoryId) || { name: t.category || 'Unknown', icon: '📝', color: '#6b7280' }
        const key = category.name
        acc[key] = (acc[key] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const incomeByCategory = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        const category = categories.find(c => c.id === t.categoryId) || { name: t.category || 'Unknown', icon: '💰', color: '#22c55e' }
        const key = category.name
        acc[key] = (acc[key] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const expenseData = Object.entries(expensesByCategory)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: ((value / metrics.totalExpenses) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value)

    const incomeData = Object.entries(incomeByCategory)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: ((value / metrics.totalIncome) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.value - a.value)

    return { 
      expenseData, 
      incomeData, 
      expensesByCategory, 
      incomeByCategory 
    }
  }, [filteredTransactions, categories, metrics])

  // Trend analysis - dynamic based on time range
  const trendData = useMemo(() => {
    const now = new Date()
    const data = []

    if (timeRange === '1M') {
      // For 1 month: show daily data for last 30 days 
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dayTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate.toDateString() === date.toDateString()
        })
        
        const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        
        data.push({
          period: date.getDate().toString(),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income: dayIncome,
          expenses: dayExpenses,
          net: dayIncome - dayExpenses
        })
      }
    } else {
      // For longer periods: show monthly aggregated data
      const monthsToShow = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        
        const monthTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear()
        })
        
        const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        
        data.push({
          period: date.toLocaleDateString('en-US', { month: 'short' }),
          fullDate: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          income: monthIncome,
          expenses: monthExpenses,
          net: monthIncome - monthExpenses
        })
      }
    }

    return data
  }, [filteredTransactions, timeRange])


  // Keep monthlyTrends for backward compatibility with insights
  const monthlyTrends = trendData


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Financial Analytics</h2>
            <p className="text-muted-foreground">Insights and trends from your financial data</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {['1M', '3M', '6M', '1Y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Analysis Type Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'overview', label: 'Overview', icon: DollarSign },
          { key: 'trends', label: 'Trends', icon: TrendingUp }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={analysisType === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnalysisType(key as any)}
            className="flex items-center space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {analysisType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gray-50 rounded-full">
                      <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Income</p>
                      <p className="text-2xl font-bold text-[#17BEBB]">{formatCurrency(metrics.totalIncome)}</p>
                      {metrics.comparison.hasPreviousData && (
                        <p className={`text-xs font-medium flex items-center space-x-1 ${
                          metrics.comparison.incomeChange >= 0 ? 'text-[#17BEBB]' : 'text-[#C41E3D]'
                        }`}>
                          <span>{metrics.comparison.incomeChange >= 0 ? '↗' : '↘'}</span>
                          <span>{Math.abs(metrics.comparison.incomeChange).toFixed(1)}% vs prev period</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gray-50 rounded-full">
                      <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-[#C41E3D]">{formatCurrency(metrics.totalExpenses)}</p>
                      {metrics.comparison.hasPreviousData && (
                        <p className={`text-xs font-medium flex items-center space-x-1 ${
                          metrics.comparison.expenseChange <= 0 ? 'text-[#17BEBB]' : 'text-[#C41E3D]'
                        }`}>
                          <span>{metrics.comparison.expenseChange >= 0 ? '↗' : '↘'}</span>
                          <span>{Math.abs(metrics.comparison.expenseChange).toFixed(1)}% vs prev period</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${
              metrics.netIncome >= 0 ? 'border-l-[#2667FF]' : 'border-l-[#D62246]'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gray-50 rounded-full">
                      <DollarSign className={`h-5 w-5 ${metrics.netIncome >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Income</p>
                      <p className={`text-2xl font-bold ${metrics.netIncome >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'}`}>
                        {metrics.netIncome >= 0 ? '+' : '-'}{formatCurrency(Math.abs(metrics.netIncome))}
                      </p>
                      {metrics.comparison.hasPreviousData && (
                        <p className={`text-xs font-medium flex items-center space-x-1 ${
                          metrics.comparison.netIncomeChange >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'
                        }`}>
                          <span>{metrics.comparison.netIncomeChange >= 0 ? '↗' : '↘'}</span>
                          <span>{Math.abs(metrics.comparison.netIncomeChange).toFixed(1)}% vs prev period</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#3B6064] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gray-50 rounded-full">
                      <Percent className="h-5 w-5 text-[#3B6064]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Savings Rate</p>
                      <p className="text-2xl font-bold text-[#3B6064]">{metrics.savingsRate.toFixed(1)}%</p>
                      {metrics.comparison.hasPreviousData ? (
                        <p className={`text-xs font-medium flex items-center space-x-1 ${
                          metrics.comparison.savingsRateChange >= 0 ? 'text-[#17BEBB]' : 'text-[#C41E3D]'
                        }`}>
                          <span>{metrics.comparison.savingsRateChange >= 0 ? '↗' : '↘'}</span>
                          <span>{Math.abs(metrics.comparison.savingsRateChange).toFixed(1)}pp vs prev period</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {metrics.savingsRate >= 20 ? 'Excellent' : metrics.savingsRate >= 10 ? 'Good' : 'Needs improvement'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Overview */}
          {savingsGoals.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Savings Overview</h3>
                      <p className="text-sm text-gray-600">Track your financial goals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Overall Progress</div>
                    <div className="text-3xl font-bold text-blue-600">{savingsMetrics.savingsProgress.toFixed(1)}%</div>
                  </div>
              </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Main Metrics Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {/* Total Saved */}
                  <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        SAVED
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-green-700">{formatCurrency(savingsMetrics.totalSavings)}</div>
                      <div className="text-sm text-green-600">Total Saved</div>
                    </div>
                  </div>

                  {/* Total Targets */}
                  <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <TrendingDown className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        TARGET
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-blue-700">{formatCurrency(savingsMetrics.totalSavingsTargets)}</div>
                      <div className="text-sm text-blue-600">Total Targets</div>
                    </div>
                  </div>

                  {/* Goals Status */}
                  <div className="relative p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        GOALS
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-purple-700">{savingsMetrics.completedGoals}</div>
                      <div className="text-sm text-purple-600">Goals Completed</div>
                      <div className="text-xs text-purple-500">{savingsMetrics.activeSavingsGoals} active goals</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">Overall Progress</h4>
                    <span className="text-sm font-medium text-gray-600">
                      {formatCurrency(savingsMetrics.totalSavings)} of {formatCurrency(savingsMetrics.totalSavingsTargets)}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${Math.min(savingsMetrics.savingsProgress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {savingsMetrics.savingsProgress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Savings by Account */}
                {Object.keys(savingsMetrics.savingsByAccount).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <span>💼</span>
                      <span>Savings by Account</span>
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(savingsMetrics.savingsByAccount).map(([accountId, amount]) => {
                        const account = accounts.find(acc => acc.id === accountId)
                        const accountName = account?.name || 'Unknown Account'
                        const accountType = account?.type || 'other'
                        
                        const getAccountIcon = (type: string) => {
                          const icons = {
                            'checking': '🏦',
                            'savings': '💰', 
                            'investment': '📈',
                            'credit': '💳',
                            'cash': '💵',
                            'crypto': '₿',
                            'other': '📋'
                          }
                          return icons[type as keyof typeof icons] || '📋'
                        }

                        const getAccountColor = (type: string) => {
                          const colors = {
                            'checking': 'from-blue-50 to-blue-100 border-blue-200',
                            'savings': 'from-green-50 to-green-100 border-green-200',
                            'investment': 'from-purple-50 to-purple-100 border-purple-200',
                            'credit': 'from-red-50 to-red-100 border-red-200',
                            'cash': 'from-yellow-50 to-yellow-100 border-yellow-200',
                            'crypto': 'from-orange-50 to-orange-100 border-orange-200',
                            'other': 'from-gray-50 to-gray-100 border-gray-200'
                          }
                          return colors[type as keyof typeof colors] || 'from-gray-50 to-gray-100 border-gray-200'
                        }

                        const percentage = savingsMetrics.totalSavings > 0 ? (amount / savingsMetrics.totalSavings) * 100 : 0

                        return (
                          <div 
                            key={accountId} 
                            className={`relative p-4 bg-gradient-to-br ${getAccountColor(accountType)} rounded-xl border hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getAccountIcon(accountType)}</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm">{accountName}</h5>
                                  <span className="text-xs text-gray-500 capitalize">{accountType} Account</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</span>
                                <span className="text-xs font-medium text-gray-600">{percentage.toFixed(1)}%</span>
                              </div>
                              
                              {/* Mini progress bar */}
                              <div className="w-full bg-white/60 rounded-full h-2">
                                <div 
                                  className="h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Spending Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-[#3B6064]" />
                <span>Spending Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Top Spending Categories */}
                <div>
                  <h4 className="font-medium mb-2">Top Spending Categories</h4>
                  <div className="space-y-2">
                    {categoryAnalysis.expensesByCategory && Object.keys(categoryAnalysis.expensesByCategory).length > 0 ? (
                      Object.entries(categoryAnalysis.expensesByCategory)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([category, amount], index) => {
                          const percentage = (amount / metrics.totalExpenses) * 100
                          return (
                            <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                                <span className="text-sm font-medium">{category}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold">{formatCurrency(amount)}</span>
                                <span className="text-xs text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No expense data available</p>
                        <p className="text-xs">Add some transactions to see spending insights</p>
                      </div>
                    )}
                  </div>
              </div>
              
                {/* Spending Patterns */}
                <div>
                  <h4 className="font-medium mb-2">Spending Patterns</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Average Transaction</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(metrics.totalExpenses / Math.max(filteredTransactions.filter(t => t.type === 'expense').length, 1))}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Days with Spending</p>
                      <p className="text-lg font-bold text-green-600">
                        {Array.from(new Set(filteredTransactions.filter(t => t.type === 'expense').map(t => t.date.toDateString()))).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {metrics.savingsRate < 20 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-1">💡 Savings Recommendation</h4>
                    <p className="text-sm text-orange-700">
                      Your savings rate is {metrics.savingsRate.toFixed(1)}%. Consider increasing it to 20% for better financial health.
                      {categoryAnalysis.expensesByCategory && Object.keys(categoryAnalysis.expensesByCategory).length > 0 && (
                        <span> Try reducing spending in {Object.entries(categoryAnalysis.expensesByCategory).sort(([,a], [,b]) => b - a)[0][0]}.</span>
                  )}
                </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdowns */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
                  <span>Expense Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryAnalysis.expenseData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryAnalysis.expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryAnalysis.expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryAnalysis.expenseData.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(item.value)}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4 border-2 border-[#C41E3D]/20">
                      <TrendingDown className="h-8 w-8 text-[#C41E3D]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expenses Recorded</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                      You haven't recorded any expenses for this period. Start tracking to see your spending breakdown.
                    </p>
                    <Button className="bg-[#C41E3D] hover:bg-[#C41E3D]/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add an Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
                  <span>Income Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryAnalysis.incomeData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryAnalysis.incomeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryAnalysis.incomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryAnalysis.incomeData.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(item.value)}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4 border-2 border-[#17BEBB]/20">
                      <TrendingUp className="h-8 w-8 text-[#17BEBB]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Income Recorded</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                      You haven't recorded any income for this period. Start tracking to see your income sources.
                    </p>
                    <Button className="bg-[#17BEBB] hover:bg-[#17BEBB]/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}


      {/* Trends Tab */}
      {analysisType === 'trends' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Income vs Expenses Trend</span>
                <Badge variant="outline" className="text-xs">
                  Last {timeRange}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare income and expenses over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload
                        return item ? item.fullDate : label
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#17BEBB" 
                      strokeWidth={3} 
                      name="Income"
                      dot={{ fill: '#17BEBB', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#C41E3D" 
                      strokeWidth={3} 
                      name="Expenses"
                      dot={{ fill: '#C41E3D', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Net Income Trend</span>
                <Badge variant="outline" className="text-xs">
                  Last {timeRange}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Net income (income minus expenses) over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload
                        return item ? item.fullDate : label
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#2667FF" 
                      strokeWidth={3} 
                      name="Net Income"
                      dot={{ fill: '#2667FF', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Chart - shows daily for 1M, monthly for 3M */}
          {(timeRange === '1M' || timeRange === '3M') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{timeRange === '1M' ? 'Daily Cash Flow' : 'Monthly Cash Flow'}</span>
                  <Badge variant="outline" className="text-xs">
                    {timeRange === '1M' ? 'Last 30 Days' : 'Last 3 Months'}
                            </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {timeRange === '1M' 
                    ? 'Daily net income (positive = surplus, negative = deficit)'
                    : 'Monthly net income trends and patterns'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] md:min-w-full">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="period" 
                            tick={{ fontSize: 12 }}
                            interval={Math.floor(trendData.length / 8)} // Show every nth label to avoid clutter
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value, name) => [formatCurrency(Number(value)), name]}
                            labelFormatter={(label, payload) => {
                              const item = payload?.[0]?.payload
                              return item ? item.fullDate : label
                            }}
                          />
                          <Bar 
                            dataKey="net" 
                            name="Net Income"
                          >
                            {trendData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#2667FF' : '#D62246'} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                {/* Mobile scroll hint */}
                <div className="block md:hidden text-xs text-muted-foreground text-center mt-2">
                  ← Scroll horizontally to see full chart →
                </div>

                {/* Chart insights */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {trendData.filter(d => d.net > 0).length > trendData.filter(d => d.net < 0).length ? (
                      <span className="text-[#2667FF]">
                        ✅ You had more surplus {timeRange === '1M' ? 'days' : 'months'} than deficit {timeRange === '1M' ? 'days' : 'months'} in this period!
                      </span>
                    ) : (
                      <span className="text-[#D62246]">
                        ⚠️ You had more deficit {timeRange === '1M' ? 'days' : 'months'} than surplus {timeRange === '1M' ? 'days' : 'months'} in this period.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}
