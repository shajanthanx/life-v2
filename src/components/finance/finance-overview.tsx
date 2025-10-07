'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowRight, Plus } from 'lucide-react'
import { Transaction, SavingsGoal } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface FinanceOverviewProps {
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  onNavigateToFinance: () => void
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void
}

export function FinanceOverview({ transactions, savingsGoals, onNavigateToFinance, onAddTransaction }: FinanceOverviewProps) {
  const [quickLog, setQuickLog] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense'
  })

  // Common categories
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other']
  // Calculate total balance and current month's data
  const financialData = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Calculate total balance
    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount
    }, 0)
    
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
      totalBalance,
      income: monthIncome,
      expenses: monthExpenses,
      net: netIncome,
      savingsRate: savingsRate,
      transactionCount: monthTransactions.length
    }
  }, [transactions])

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quickLog.amount || !quickLog.description || !quickLog.category) {
      return
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      type: quickLog.type,
      amount: parseFloat(quickLog.amount),
      category: quickLog.category,
      description: quickLog.description,
      date: new Date(quickLog.date),
      isRecurring: false
    }

    onAddTransaction(newTransaction)

    // Reset form
    setQuickLog({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    })
  }

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
          {/* Financial Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              💰 Financial Summary
            </h4>
            
            <div className="grid gap-3">
              {/* Total Balance */}
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                financialData.totalBalance >= 0 
                  ? 'bg-blue-50 border-blue-100' 
                  : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <DollarSign className={`h-4 w-4 ${financialData.totalBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${financialData.totalBalance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                    Total Balance
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${financialData.totalBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {financialData.totalBalance >= 0 ? '+' : ''}{formatCurrency(financialData.totalBalance)}
                  </div>
                </div>
              </div>
              
              {/* This Month's Income */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">This Month's Income</span>
                </div>
                <span className="font-bold text-green-700">{formatCurrency(financialData.income)}</span>
              </div>
              
              {/* This Month's Expenses */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">This Month's Expenses</span>
                </div>
                <span className="font-bold text-red-700">{formatCurrency(financialData.expenses)}</span>
              </div>
            </div>
          </div>

          {/* Quick Log */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              ⚡ Quick Log
            </h4>

            <form onSubmit={handleQuickLog} className="space-y-3">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickLog(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                    quickLog.type === 'income'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setQuickLog(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                    quickLog.type === 'expense'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 mx-auto mb-1" />
                  Expense
                </button>
              </div>

              {/* Amount and Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quickLog.amount}
                      onChange={(e) => setQuickLog(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={quickLog.date}
                    onChange={(e) => setQuickLog(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                <select
                  value={quickLog.category}
                  onChange={(e) => setQuickLog(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {(quickLog.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                <Input
                  type="text"
                  placeholder="What's this for?"
                  value={quickLog.description}
                  onChange={(e) => setQuickLog(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full gap-2 ${
                  quickLog.type === 'income'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                Add {quickLog.type === 'income' ? 'Income' : 'Expense'}
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
            <span className="text-center sm:text-left">{financialData.transactionCount} transactions this month</span>
            <div className="flex justify-center sm:justify-end">
              {financialData.savingsRate >= 20 ? (
                <Badge className="bg-green-100 text-green-800 text-xs">Great Savings Rate! 🎉</Badge>
              ) : financialData.savingsRate >= 10 ? (
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

