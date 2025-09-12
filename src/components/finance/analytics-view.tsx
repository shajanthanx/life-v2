'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Category, Transaction, SavingsGoal, PredefinedExpense } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Lightbulb,
  Calendar,
  Percent,
  Plus
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
  savingsGoals: SavingsGoal[]
  predefinedExpenses: PredefinedExpense[]
}

interface InsightItem {
  type: 'warning' | 'success' | 'info' | 'tip'
  title: string
  description: string
  value?: string
  action?: string
}

const COLORS = ['#17BEBB', '#C41E3D', '#2667FF', '#D62246', '#3B6064', '#17BEBB', '#C41E3D', '#2667FF']

export function AnalyticsView({ 
  transactions, 
  categories, 
  savingsGoals, 
  predefinedExpenses 
}: AnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M')
  const [analysisType, setAnalysisType] = useState<'overview' | 'categories' | 'trends' | 'insights'>('overview')

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

    return { expenseData, incomeData }
  }, [filteredTransactions, categories, metrics])

  // Trend analysis - dynamic based on time range
  const trendData = useMemo(() => {
    const now = new Date()
    const data = []

    if (timeRange === '1M') {
      // For 1 month: show daily net income for last 30 days
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

  // Insights engine
  const insights = useMemo((): InsightItem[] => {
    const insights: InsightItem[] = []

    // Savings rate analysis
    if (metrics.savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings Rate',
        description: `You're saving ${metrics.savingsRate.toFixed(1)}% of your income. Keep up the great work!`,
        value: `${metrics.savingsRate.toFixed(1)}%`
      })
    } else if (metrics.savingsRate < 5) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        description: `You're only saving ${metrics.savingsRate.toFixed(1)}% of your income. Consider reducing expenses or increasing income.`,
        value: `${metrics.savingsRate.toFixed(1)}%`,
        action: 'Review your budget'
      })
    }

    // Category spending analysis
    const topExpenseCategory = categoryAnalysis.expenseData[0]
    if (topExpenseCategory && (topExpenseCategory.value / metrics.totalExpenses) > 0.4) {
      insights.push({
        type: 'warning',
        title: 'High Category Spending',
        description: `${topExpenseCategory.name} accounts for ${topExpenseCategory.percentage}% of your expenses. Consider if this is sustainable.`,
        value: formatCurrency(topExpenseCategory.value),
        action: 'Review spending patterns'
      })
    }

    // Income diversification
    const incomeSourceCount = categoryAnalysis.incomeData.length
    if (incomeSourceCount === 1) {
      insights.push({
        type: 'tip',
        title: 'Income Diversification',
        description: 'Consider developing additional income streams to reduce financial risk.',
        action: 'Explore side income'
      })
    } else if (incomeSourceCount >= 3) {
      insights.push({
        type: 'success',
        title: 'Diversified Income',
        description: `Great job maintaining ${incomeSourceCount} income sources. This provides good financial stability.`
      })
    }

    // Monthly trend analysis
    if (monthlyTrends.length >= 2) {
      const recentMonths = monthlyTrends.slice(-2)
      const [prevMonth, currentMonth] = recentMonths
      
      const expenseChange = ((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100
      if (expenseChange > 20) {
        insights.push({
          type: 'warning',
          title: 'Spending Spike',
          description: `Your expenses increased by ${expenseChange.toFixed(1)}% this month compared to last month.`,
          value: `+${expenseChange.toFixed(1)}%`,
          action: 'Review recent purchases'
        })
      } else if (expenseChange < -10) {
        insights.push({
          type: 'success',
          title: 'Great Cost Control',
          description: `You reduced expenses by ${Math.abs(expenseChange).toFixed(1)}% this month. Excellent work!`,
          value: `-${Math.abs(expenseChange).toFixed(1)}%`
        })
      }
    }

    // Savings goals analysis
    const activeSavingsGoals = savingsGoals.filter(g => !g.isCompleted)
    if (activeSavingsGoals.length === 0) {
      insights.push({
        type: 'tip',
        title: 'Set Savings Goals',
        description: 'Having specific savings targets can help you stay motivated and focused.',
        action: 'Create a savings goal'
      })
    }

    // Recurring expenses optimization
    const activeRecurringExpenses = predefinedExpenses.filter(e => e.isActive)
    const totalRecurringMonthly = activeRecurringExpenses
      .filter(e => e.frequency === 'monthly')
      .reduce((sum, e) => sum + e.amount, 0)
    
    if (totalRecurringMonthly > metrics.avgMonthlyExpenses * 0.5) {
      insights.push({
        type: 'info',
        title: 'High Recurring Expenses',
        description: `Recurring expenses account for ${formatCurrency(totalRecurringMonthly)} monthly. Review subscriptions regularly.`,
        value: formatCurrency(totalRecurringMonthly),
        action: 'Audit subscriptions'
      })
    }

    return insights
  }, [metrics, categoryAnalysis, monthlyTrends, savingsGoals, predefinedExpenses])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'tip': return Lightbulb
      default: return DollarSign
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-4 border-l-[#C41E3D] border border-gray-200'
      case 'success': return 'border-l-4 border-l-[#17BEBB] border border-gray-200'
      case 'tip': return 'border-l-4 border-l-[#2667FF] border border-gray-200'
      default: return 'border-l-4 border-l-[#3B6064] border border-gray-200'
    }
  }

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
          { key: 'categories', label: 'Categories', icon: PieChart },
          { key: 'trends', label: 'Trends', icon: TrendingUp },
          { key: 'insights', label: 'Insights', icon: Lightbulb }
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
          <div className="grid gap-4 md:grid-cols-4">
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

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {timeRange === '1M' ? 'Daily Cash Flow' : 'Income vs Expenses Trend'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {timeRange === '1M' ? 'Last 30 Days' : `Last ${timeRange}`}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {timeRange === '1M' 
                  ? 'Daily net income (positive = surplus, negative = deficit)'
                  : 'Compare income and expenses over time'
                }
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {timeRange === '1M' ? (
                    // Bar chart for daily view (1M)
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
                        fill={(entry) => entry.net >= 0 ? '#22c55e' : '#ef4444'}
                        name="Net Income"
                      >
                        {trendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#2667FF' : '#D62246'} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  ) : (
                    // Line chart for longer periods
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
                  )}
                </ResponsiveContainer>
              </div>
              
              {/* Chart insights */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {timeRange === '1M' ? (
                    trendData.filter(d => d.net > 0).length > trendData.filter(d => d.net < 0).length ? (
                      <span className="text-[#2667FF]">✅ You had more surplus days than deficit days this month!</span>
                    ) : (
                      <span className="text-[#D62246]">⚠️ You had more deficit days this month. Consider reviewing your spending.</span>
                    )
                  ) : (
                    trendData.length > 1 && trendData[trendData.length - 1]?.income > trendData[trendData.length - 2]?.income ? (
                      <span className="text-[#17BEBB]">📈 Your income is trending upward!</span>
                    ) : (
                      <span className="text-[#3B6064]">💡 Track your trends over time to identify patterns.</span>
                    )
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Tab */}
      {analysisType === 'categories' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
                    <div className="h-64">
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
                  <div className="flex flex-col items-center justify-center h-64 text-center">
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
                    <div className="h-64">
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
                  <div className="flex flex-col items-center justify-center h-64 text-center">
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
              <CardTitle>Income vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Net Income Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends.map(m => ({ ...m, net: m.income - m.expenses }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={3} name="Net Income" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {analysisType === 'insights' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              
              return (
                <Card key={index} className={getInsightColor(insight.type)}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        
                        <div className="flex items-center justify-between">
                          {insight.value && (
                            <Badge variant="outline" className="font-mono">
                              {insight.value}
                            </Badge>
                          )}
                          {insight.action && (
                            <Button size="sm" variant="outline">
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {insights.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No insights available yet</h3>
                <p className="text-muted-foreground">
                  Add more transactions to get personalized financial insights and recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
