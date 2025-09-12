'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Category, Transaction, PredefinedExpense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Helper function to format time relative to now
const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  
  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
}
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Clock, Zap, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { createTransaction } from '@/lib/api/transactions'
import { getDuePredefinedExpenses, addPredefinedExpenseToTransactions } from '@/lib/api/predefined-expenses'

interface RecordingViewProps {
  transactions: Transaction[]
  categories: Category[]
  predefinedExpenses: PredefinedExpense[]
  onUpdateTransactions: (transactions: Transaction[]) => void
}

interface QuickEntryFormData {
  type: 'income' | 'expense'
  amount: string
  categoryId: string
  description: string
  date: string
}

export function RecordingView({ 
  transactions, 
  categories, 
  predefinedExpenses,
  onUpdateTransactions 
}: RecordingViewProps) {
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false)
  const [formData, setFormData] = useState<QuickEntryFormData>({
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dueExpenses, setDueExpenses] = useState<PredefinedExpense[]>([])

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter(t => 
    t.date.toISOString().split('T')[0] === today
  )
  
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Get recent transactions (last 10)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  // Get due predefined expenses
  const activeDueExpenses = predefinedExpenses.filter(expense => {
    if (!expense.isActive || !expense.nextDue) return false
    return new Date(expense.nextDue) <= new Date()
  })

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  const handleOpenQuickEntry = (type: 'income' | 'expense') => {
    const relevantCategories = type === 'expense' ? expenseCategories : incomeCategories
    setFormData({
      type,
      amount: '',
      categoryId: relevantCategories[0]?.id || '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsQuickEntryOpen(true)
  }

  const handleSubmitQuickEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.categoryId) return

    setIsLoading(true)
    try {
      const { data, error } = await createTransaction({
        type: formData.type,
        amount: Number(formData.amount),
        categoryId: formData.categoryId,
        description: formData.description || `${formData.type === 'income' ? 'Income' : 'Expense'} entry`,
        date: new Date(formData.date),
        isRecurring: false
      })

      if (error) {
        console.error('Error creating transaction:', error)
        return
      }

      if (data) {
        onUpdateTransactions([data, ...transactions])
        setIsQuickEntryOpen(false)
        setFormData({
          type: 'expense',
          amount: '',
          categoryId: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPredefinedExpense = async (expense: PredefinedExpense) => {
    try {
      const { success, error } = await addPredefinedExpenseToTransactions(expense.id)
      if (error) {
        console.error('Error adding predefined expense:', error)
        return
      }

      if (success) {
        // Create a transaction object to add to the list
        const newTransaction: Transaction = {
          id: Date.now().toString(), // Temporary ID
          type: 'expense',
          amount: expense.amount,
          categoryId: expense.categoryId,
          description: expense.name,
          date: new Date(),
          isRecurring: true,
          recurringPattern: expense.frequency === 'weekly' ? 'weekly' : 'monthly'
        }
        
        onUpdateTransactions([newTransaction, ...transactions])
      }
    } catch (error) {
      console.error('Error adding predefined expense:', error)
    }
  }

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown
  }

  const getTransactionColor = (type: string) => {
    return type === 'income' 
      ? 'text-[#17BEBB] bg-gray-50' 
      : 'text-[#C41E3D] bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Daily Recording</h2>
            <p className="text-muted-foreground">Quick entry for income and expenses</p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Income</p>
                <p className="text-2xl font-bold text-[#17BEBB]">{formatCurrency(todayIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Expenses</p>
                <p className="text-2xl font-bold text-[#C41E3D]">{formatCurrency(todayExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${
          todayIncome - todayExpenses >= 0 
            ? 'border-l-[#2667FF]' 
            : 'border-l-[#D62246]'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <DollarSign className={`h-5 w-5 ${
                  todayIncome - todayExpenses >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Net Today
                </p>
                <p className={`text-2xl font-bold ${
                  todayIncome - todayExpenses >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'
                }`}>
                  {todayIncome - todayExpenses >= 0 ? '+' : '-'}{formatCurrency(Math.abs(todayIncome - todayExpenses))}
                </p>
                <p className={`text-xs font-medium uppercase ${
                  todayIncome - todayExpenses >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'
                }`}>
                  {todayIncome - todayExpenses >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Entry Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="cursor-pointer bg-[#17BEBB] hover:bg-[#17BEBB]/90 text-white border-[#17BEBB] transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]" 
          onClick={() => handleOpenQuickEntry('income')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Income</h3>
                <p className="text-white/80">Record money received</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-[#C41E3D] hover:bg-[#C41E3D]/90 text-white border-[#C41E3D] transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]" 
          onClick={() => handleOpenQuickEntry('expense')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Expense</h3>
                <p className="text-white/80">Record money spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Recurring Expenses */}
      {activeDueExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#D62246]" />
              <span>Due Recurring Expenses</span>
              <Badge variant="secondary">{activeDueExpenses.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDueExpenses.map((expense) => {
                const category = getCategory(expense.categoryId)
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <span className="text-lg">{category?.icon || '📝'}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{expense.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(expense.amount)} • {category?.name}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddPredefinedExpense(expense)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </div>
            {recentTransactions.length > 0 && (
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              const category = getCategory(transaction.categoryId)
              const transactionDate = new Date(transaction.date)
              const isToday = transactionDate.toDateString() === new Date().toDateString()
              
              return (
                <div key={transaction.id} className="group flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{category?.icon} {category?.name || transaction.category}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        {isToday && (
                          <>
                            <span>•</span>
                            <span className="text-[#2667FF] font-medium">
                              {formatTimeAgo(transactionDate)}
                            </span>
                          </>
                        )}
                        {transaction.isRecurring && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-[#17BEBB]' : 'text-[#C41E3D]'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    
                    {/* Quick Actions - only show on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#2667FF]/10">
                        <Edit2 className="h-3 w-3 text-[#2667FF]" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#C41E3D]/10">
                        <Trash2 className="h-3 w-3 text-[#C41E3D]" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking your finances by adding your first transaction</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={() => handleOpenQuickEntry('income')} className="bg-[#17BEBB] hover:bg-[#17BEBB]/90 text-white">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
                <Button onClick={() => handleOpenQuickEntry('expense')} className="bg-[#C41E3D] hover:bg-[#C41E3D]/90 text-white">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Entry Modal */}
      <Dialog open={isQuickEntryOpen} onOpenChange={setIsQuickEntryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {formData.type === 'income' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
                  <span>Add Income</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
                  <span>Add Expense</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitQuickEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'income',
                  categoryId: incomeCategories[0]?.id || ''
                }))}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Income</span>
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'expense',
                  categoryId: expenseCategories[0]?.id || ''
                }))}
                className="flex items-center space-x-2"
              >
                <TrendingDown className="h-4 w-4" />
                <span>Expense</span>
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                <option value="">Select category</option>
                {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder={`${formData.type === 'income' ? 'Income' : 'Expense'} description...`}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsQuickEntryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.amount || !formData.categoryId}>
                {isLoading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
