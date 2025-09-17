'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createTransaction, updateTransaction, deleteTransaction } from '@/lib/api/transactions'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, TrendingDown, TrendingUp, Filter, Calendar, DollarSign, Edit2, Trash2, Download, CheckSquare, Square } from 'lucide-react'

interface TransactionsViewProps {
  transactions: Transaction[]
  categories: Category[]
  onUpdateTransactions: (transactions: Transaction[]) => void
}

export function TransactionsView({ transactions, categories, onUpdateTransactions }: TransactionsViewProps) {
  const { addToast } = useToast()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Transaction form state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense' as Transaction['type'],
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Bulk actions state
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

  // Handler functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.categoryId || !formData.description) return

    setIsLoading(true)
    try {
      const transactionData = {
        type: formData.type,
        amount: Number(formData.amount),
        categoryId: formData.categoryId,
        description: formData.description,
        date: new Date(formData.date),
        isRecurring: false
      }

      if (editingTransaction) {
        const { data, error } = await updateTransaction(editingTransaction.id, transactionData)
        if (error) {
          console.error('Error updating transaction:', error)
          return
        }
        if (data) {
          const updatedTransactions = transactions.map(t => t.id === editingTransaction.id ? data : t)
          onUpdateTransactions(updatedTransactions)
          setIsEditOpen(false)
          setEditingTransaction(null)
        }
      } else {
        const { data, error } = await createTransaction(transactionData)
        if (error) {
          console.error('Error creating transaction:', error)
          return
        }
        if (data) {
          onUpdateTransactions([data, ...transactions])
          setIsCreateOpen(false)
        }
      }

      setFormData({
        type: 'expense',
        amount: '',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId || '',
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0]
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (transactionId: string) => {
    try {
      const { success, error } = await deleteTransaction(transactionId)
      if (error) {
        console.error('Error deleting transaction:', error)
        addToast({
          message: `Failed to delete transaction: ${error}`,
          type: 'error'
        })
        return
      }
      if (success) {
        const updatedTransactions = transactions.filter(t => t.id !== transactionId)
        onUpdateTransactions(updatedTransactions)
        setDeleteTransactionId(null)
        addToast({
          message: 'Transaction deleted successfully',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      addToast({
        message: 'Failed to delete transaction',
        type: 'error'
      })
    }
  }

  // Bulk actions
  const handleSelectTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return

    setIsLoading(true)
    let deletedCount = 0
    const errors: string[] = []

    for (const transactionId of selectedTransactions) {
      try {
        const { success, error } = await deleteTransaction(transactionId)
        if (success) {
          deletedCount++
        } else if (error) {
          errors.push(error)
        }
      } catch (error) {
        errors.push('Network error')
      }
    }

    // Update local state
    const updatedTransactions = transactions.filter(t => !selectedTransactions.has(t.id))
    onUpdateTransactions(updatedTransactions)
    setSelectedTransactions(new Set())
    setIsSelectMode(false)
    setIsLoading(false)

    // Show result
    if (deletedCount > 0) {
      addToast({
        message: `Successfully deleted ${deletedCount} transaction${deletedCount > 1 ? 's' : ''}`,
        type: 'success'
      })
    }
    if (errors.length > 0) {
      addToast({
        message: `Failed to delete ${errors.length} transaction${errors.length > 1 ? 's' : ''}`,
        type: 'error'
      })
    }
  }

  const handleExportCSV = () => {
    const dataToExport = selectedTransactions.size > 0 
      ? filteredTransactions.filter(t => selectedTransactions.has(t.id))
      : filteredTransactions

    const csvContent = [
      // Header
      ['Date', 'Type', 'Amount', 'Category', 'Description'].join(','),
      // Data rows
      ...dataToExport.map(t => [
        formatDate(t.date),
        t.type,
        t.amount.toString(),
        categories.find(c => c.id === t.categoryId)?.name || t.category || 'Unknown',
        `"${t.description.replace(/"/g, '""')}"`  // Escape quotes
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    addToast({
      message: `Exported ${dataToExport.length} transactions to CSV`,
      type: 'success'
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filter === 'all' || transaction.type === filter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    return matchesType && matchesCategory && matchesSearch
  })

  const categoryFilters = ['all', ...Array.from(new Set(transactions.map(t => t.category).filter(Boolean)))]
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthTransactions = transactions.filter(t => {
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

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown
  }

  const getTransactionColor = (type: string) => {
    return type === 'income' 
      ? 'text-[#17BEBB] bg-gray-50 border-[#17BEBB]/30' 
      : 'text-[#C41E3D] bg-gray-50 border-[#C41E3D]/30'
  }

  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, string> = {
      'Food': '🍔',
      'Housing': '🏠',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Health': '🏥',
      'Shopping': '🛍️',
      'Utilities': '⚡',
      'Salary': '💼',
      'Business': '📊',
      'Investment': '📈',
      'Gift': '🎁',
      'Other': '📝'
    }
    return categoryIcons[category] || '💰'
  }

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Transactions</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {isSelectMode && (
                <>
                  <span className="text-sm text-muted-foreground text-center sm:text-left">
                    {selectedTransactions.size} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={selectedTransactions.size === 0 || isLoading}
                      className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSelectMode(false)
                        setSelectedTransactions(new Set())
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredTransactions.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectMode(!isSelectMode)}
                  disabled={filteredTransactions.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select
                </Button>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Select All Checkbox */}
            {isSelectMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>Select All</span>
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Type Filter */}
              <div className="flex space-x-1 sm:space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'income', label: 'Income' },
                  { key: 'expense', label: 'Expenses' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm border rounded px-2 py-1 w-full sm:w-auto min-w-[150px]"
                >
                  {categoryFilters.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.slice(0, 20).map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              
              return (
                <div key={transaction.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {isSelectMode && (
                      <button
                        onClick={() => handleSelectTransaction(transaction.id)}
                        className="flex items-center flex-shrink-0"
                      >
                        {selectedTransactions.has(transaction.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h4 className="font-medium truncate">{transaction.description}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs w-fit">
                            {getCategoryIcon(transaction.category || '')} {transaction.category || 'Uncategorized'}
                          </Badge>
                          {transaction.isRecurring && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              🔄 {transaction.recurringPattern}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    
                    {!isSelectMode && (
                      <div className="flex space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(transaction)}
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setDeleteTransactionId(transaction.id)}
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || filter !== 'all' || categoryFilter !== 'all' 
                  ? 'No transactions match your filters'
                  : 'No transactions recorded yet'
                }
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            </div>
          )}

          {filteredTransactions.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 20 of {filteredTransactions.length} transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Transaction Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
          setEditingTransaction(null)
          setFormData({
            type: 'expense',
            amount: '',
            categoryId: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
          })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                required
              >
                <option value="expense">💸 Expense</option>
                <option value="income">💰 Income</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-md"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Transaction description"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setIsEditOpen(false)
                  setEditingTransaction(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTransactionId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteTransactionId && handleDelete(deleteTransactionId)}
            >
              Delete Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
