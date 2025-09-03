'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetOverview } from './budget-overview'
import { TransactionsView } from './transactions-view'
import { SavingsGoals } from './savings-goals'
import { AppState, SavingsGoal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react'
import { IncomeManagement } from '../income/income-management'

interface FinanceViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddTransaction?: () => void
  onAddSavingsGoal?: () => void
  onAddIncomeSource?: () => void
}

export function FinanceView({ data, onDataUpdate, onAddTransaction, onAddSavingsGoal, onAddIncomeSource }: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Calculate financial metrics
  const thisMonthTransactions = data.transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
  
  const monthlyExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
  
  const netIncome = monthlyIncome - monthlyExpenses
  
  const currentBudgets = data.budgets.filter(b => b.month === currentMonth && b.year === currentYear)
  const totalBudget = currentBudgets.reduce((acc, budget) => acc + budget.allocated, 0)
  const budgetUsed = currentBudgets.reduce((acc, budget) => acc + budget.spent, 0)
  
  const activeSavingsGoals = data.savingsGoals.filter(goal => !goal.isCompleted)
  const totalSavingsTarget = activeSavingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0)
  const totalSaved = activeSavingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0)

  const handleAddTransaction = () => {
    onAddTransaction?.()
  }

  const handleAddSavingsGoal = () => {
    onAddSavingsGoal?.()
  }

  const handleUpdateSavingsGoal = (updatedGoal: SavingsGoal) => {
    const updatedGoals = data.savingsGoals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    )
    onDataUpdate({
      ...data,
      savingsGoals: updatedGoals
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className={`h-5 w-5 ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                      <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatCurrency(Math.abs(netIncome))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {netIncome >= 0 ? 'surplus' : 'deficit'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Saved</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSaved)}</p>
                      <p className="text-xs text-muted-foreground">
                        of {formatCurrency(totalSavingsTarget)} goal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Progress This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBudgets.slice(0, 5).map((budget) => {
                    const progress = totalBudget > 0 ? (budget.spent / budget.allocated) * 100 : 0
                    const remaining = budget.allocated - budget.spent
                    
                    return (
                      <div key={budget.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{budget.category}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                            </span>
                          </div>
                          <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                progress >= 100 ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-md' : 
                                progress >= 90 ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-md' : 
                                progress >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md' :
                                progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-md' :
                                'bg-gradient-to-r from-green-400 to-green-600 shadow-md'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{progress.toFixed(0)}% used</span>
                            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`} left
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {currentBudgets.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No budgets set for this month</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {data.transactions.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Health Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">💰 Emergency Fund</h4>
                    <p className="text-sm text-blue-700">
                      Aim to save 3-6 months of expenses for unexpected situations.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">📊 50/30/20 Rule</h4>
                    <p className="text-sm text-green-700">
                      Allocate 50% for needs, 30% for wants, 20% for savings and debt.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">📈 Track Expenses</h4>
                    <p className="text-sm text-purple-700">
                      Monitor your spending patterns to identify areas for improvement.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">🎯 Set Goals</h4>
                    <p className="text-sm text-orange-700">
                      Create specific, measurable financial goals to stay motivated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="budget" className="mt-6">
          <BudgetOverview 
            budgets={data.budgets}
            transactions={data.transactions}
          />
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <TransactionsView 
            transactions={data.transactions}
            onAddTransaction={handleAddTransaction}
          />
        </TabsContent>
        
        <TabsContent value="income" className="mt-6">
          <IncomeManagement
            incomeSources={data.incomeSources}
            incomeRecords={data.incomeRecords}
            onAddIncomeSource={() => onAddIncomeSource?.()}
            onUpdateIncomeSource={(source) => {
              const updated = data.incomeSources.map(s => s.id === source.id ? source : s)
              onDataUpdate({ ...data, incomeSources: updated })
            }}
            onAddIncomeRecord={(record) => {
              const newRecord = { ...record, id: Date.now().toString() }
              onDataUpdate({
                ...data,
                incomeRecords: [newRecord, ...data.incomeRecords]
              })
            }}
          />
        </TabsContent>
        
        <TabsContent value="savings" className="mt-6">
          <SavingsGoals 
            savingsGoals={data.savingsGoals}
            onAddGoal={handleAddSavingsGoal}
            onUpdateGoal={handleUpdateSavingsGoal}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
