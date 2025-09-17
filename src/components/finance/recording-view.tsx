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
import { createTransaction, updateTransaction, deleteTransaction } from '@/lib/api/transactions'
import { getDuePredefinedExpenses, addPredefinedExpenseToTransactions } from '@/lib/api/predefined-expenses'
import { useToast } from '@/hooks/use-toast'

interface RecordingViewProps {
  transactions: Transaction[]
  categories: Category[]
  predefinedExpenses: PredefinedExpense[]
  onUpdateTransactions: (transactions: Transaction[]) => void
  onNavigateToTransactions?: () => void
}

interface QuickEntryFormData {
  type: 'income' | 'expense'
  amount: string
  categoryId: string
  description: string
  date: string
}

interface EditTransactionData extends QuickEntryFormData {
  id: string
}

export function RecordingView({ 
  transactions, 
  categories, 
  predefinedExpenses,
  onUpdateTransactions,
  onNavigateToTransactions
}: RecordingViewProps) {
  const { addToast } = useToast()
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
  
  // Edit transaction state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<EditTransactionData | null>(null)
  
  // Delete confirmation state
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null)
  

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
        addToast({
          message: `Failed to create transaction: ${error}`,
          type: 'error'
        })
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
        addToast({
          message: `${data.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(data.amount)} added successfully`,
          type: 'success'
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

  const handleEditTransaction = (transaction: Transaction) => {
    setEditData({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId || '', // Handle undefined categoryId
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0]
    })
    setIsEditOpen(true)
  }

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData || !editData.amount || !editData.categoryId) return

    setIsLoading(true)
    try {
      // Call the API to update the transaction
      const { data, error } = await updateTransaction(editData.id, {
        type: editData.type,
        amount: Number(editData.amount),
        categoryId: editData.categoryId,
        description: editData.description,
        date: new Date(editData.date),
        isRecurring: false
      })

      if (error) {
        console.error('Error updating transaction:', error)
        addToast({
          message: `Failed to update transaction: ${error}`,
          type: 'error'
        })
        return
      }

      if (data) {
        // Update the transaction in the local state
        const updatedTransactions = transactions.map(t => 
          t.id === editData.id 
            ? {
                ...t,
                type: editData.type,
                amount: Number(editData.amount),
                categoryId: editData.categoryId,
                description: editData.description,
                date: new Date(editData.date)
              }
            : t
        )
        
        onUpdateTransactions(updatedTransactions)
        setIsEditOpen(false)
        setEditData(null)
        addToast({
          message: 'Transaction updated successfully',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setDeleteTransactionId(transactionId)
  }

  const confirmDeleteTransaction = async () => {
    if (!deleteTransactionId) return
    
    try {
      // Call the API to delete the transaction
      const { success, error } = await deleteTransaction(deleteTransactionId)
      
      if (error) {
        console.error('Error deleting transaction:', error)
        addToast({
          message: `Failed to delete transaction: ${error}`,
          type: 'error'
        })
        return
      }

      if (success) {
        // Update the local state to remove the transaction
        const updatedTransactions = transactions.filter(t => t.id !== deleteTransactionId)
        onUpdateTransactions(updatedTransactions)
        setDeleteTransactionId(null)
        addToast({
          message: 'Transaction deleted successfully',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Daily Recording</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Quick entry for income and expenses</p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#17BEBB]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Income</p>
                <p className="text-lg sm:text-2xl font-bold text-[#17BEBB] truncate">{formatCurrency(todayIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-[#C41E3D]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-[#C41E3D] truncate">{formatCurrency(todayExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${
          todayIncome - todayExpenses >= 0 
            ? 'border-l-[#2667FF]' 
            : 'border-l-[#D62246]'
        }`}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <DollarSign className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  todayIncome - todayExpenses >= 0 ? 'text-[#2667FF]' : 'text-[#D62246]'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Net Today
                </p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${
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
      <div className="grid gap-4 sm:grid-cols-2">
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
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </div>
            {recentTransactions.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80 w-full sm:w-auto"
                onClick={() => onNavigateToTransactions?.()}
              >
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
                <div key={transaction.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{transaction.description}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {category?.icon} <span className="truncate">{category?.name || transaction.category}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(transaction.date)}</span>
                        {isToday && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-[#2667FF] font-medium">
                              {formatTimeAgo(transactionDate)}
                            </span>
                          </>
                        )}
                        {transaction.isRecurring && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="outline" className="text-xs w-fit">
                              Recurring
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-[#17BEBB]' : 'text-[#C41E3D]'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    
                    {/* Quick Actions - show on mobile, hide on desktop until hover */}
                    <div className="flex space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-[#2667FF]/10"
                        onClick={() => handleEditTransaction(transaction)}
                        title="Edit transaction"
                      >
                        <Edit2 className="h-3 w-3 text-[#2667FF]" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-[#C41E3D]/10"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        title="Delete transaction"
                      >
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

      {/* Edit Transaction Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editData?.type === 'income' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
                  <span>Edit Income</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
                  <span>Edit Expense</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {editData && (
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={editData.type === 'income' ? 'default' : 'outline'}
                  onClick={() => setEditData(prev => prev ? ({ 
                    ...prev, 
                    type: 'income',
                    categoryId: incomeCategories[0]?.id || prev.categoryId
                  }) : null)}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Income</span>
                </Button>
                <Button
                  type="button"
                  variant={editData.type === 'expense' ? 'default' : 'outline'}
                  onClick={() => setEditData(prev => prev ? ({ 
                    ...prev, 
                    type: 'expense',
                    categoryId: expenseCategories[0]?.id || prev.categoryId
                  }) : null)}
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
                  value={editData.amount}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, amount: e.target.value }) : null)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={editData.categoryId}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, categoryId: e.target.value }) : null)}
                  required
                >
                  <option value="">Select category</option>
                  {(editData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder={`${editData.type === 'income' ? 'Income' : 'Expense'} description...`}
                  value={editData.description}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !editData.amount || !editData.categoryId}>
                  {isLoading ? 'Updating...' : 'Update Transaction'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-[#C41E3D]" />
              <span>Delete Transaction</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTransactionId(null)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDeleteTransaction}
              className="bg-[#C41E3D] hover:bg-[#C41E3D]/90"
            >
              Delete Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
