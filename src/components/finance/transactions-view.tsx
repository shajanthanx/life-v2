'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, TrendingDown, TrendingUp, Filter, Calendar, DollarSign } from 'lucide-react'

interface TransactionsViewProps {
  transactions: Transaction[]
  onAddTransaction: () => void
}

export function TransactionsView({ transactions, onAddTransaction }: TransactionsViewProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filter === 'all' || transaction.type === filter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesCategory && matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(transactions.map(t => t.category)))]
  
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
      <div className="grid gap-4 md:grid-cols-3">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <Button onClick={onAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex space-x-2">
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
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.slice(0, 20).map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(transaction.category)} {transaction.category}
                        </Badge>
                        {transaction.isRecurring && (
                          <Badge variant="secondary" className="text-xs">
                            🔄 {transaction.recurringPattern}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
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
              <Button onClick={onAddTransaction}>
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
    </div>
  )
}
