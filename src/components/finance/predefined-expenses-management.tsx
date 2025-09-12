'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Category, PredefinedExpense } from '@/types'
import { Plus, Edit2, Trash2, Calendar, DollarSign, Clock, Play, Pause, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  createPredefinedExpense, 
  updatePredefinedExpense, 
  deletePredefinedExpense,
  addPredefinedExpenseToTransactions,
  togglePredefinedExpenseStatus 
} from '@/lib/api/predefined-expenses'

interface PredefinedExpensesManagementProps {
  predefinedExpenses: PredefinedExpense[]
  categories: Category[]
  onUpdatePredefinedExpenses: (expenses: PredefinedExpense[]) => void
}

interface ExpenseFormData {
  name: string
  categoryId: string
  amount: string
  frequency: 'weekly' | 'monthly' | 'yearly'
  nextDue: string
  description: string
  autoAdd: boolean
}

export function PredefinedExpensesManagement({ 
  predefinedExpenses, 
  categories, 
  onUpdatePredefinedExpenses 
}: PredefinedExpensesManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PredefinedExpense | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    categoryId: '',
    amount: '',
    frequency: 'monthly',
    nextDue: '',
    description: '',
    autoAdd: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const activeExpenses = predefinedExpenses.filter(e => e.isActive)
  const inactiveExpenses = predefinedExpenses.filter(e => !e.isActive)

  const filteredExpenses = predefinedExpenses.filter(expense => {
    if (filter === 'active') return expense.isActive
    if (filter === 'inactive') return !expense.isActive
    return true
  })

  // Calculate totals
  const totalMonthly = activeExpenses
    .filter(e => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalYearly = activeExpenses
    .filter(e => e.frequency === 'yearly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalWeekly = activeExpenses
    .filter(e => e.frequency === 'weekly')
    .reduce((sum, e) => sum + e.amount, 0)

  const estimatedMonthly = totalMonthly + (totalYearly / 12) + (totalWeekly * 4.33)

  const handleOpenModal = (expense?: PredefinedExpense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        name: expense.name,
        categoryId: expense.categoryId,
        amount: expense.amount.toString(),
        frequency: expense.frequency,
        nextDue: expense.nextDue?.toISOString().split('T')[0] || '',
        description: expense.description || '',
        autoAdd: expense.autoAdd
      })
    } else {
      setEditingExpense(null)
      setFormData({
        name: '',
        categoryId: expenseCategories[0]?.id || '',
        amount: '',
        frequency: 'monthly',
        nextDue: '',
        description: '',
        autoAdd: false
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.amount || !formData.categoryId) return

    setIsLoading(true)
    try {
      const expenseData = {
        name: formData.name,
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        nextDue: formData.nextDue ? new Date(formData.nextDue) : undefined,
        isActive: true,
        description: formData.description,
        autoAdd: formData.autoAdd
      }

      if (editingExpense) {
        const { data, error } = await updatePredefinedExpense(editingExpense.id, expenseData)
        if (error) {
          console.error('Error updating predefined expense:', error)
          return
        }
        if (data) {
          const updated = predefinedExpenses.map(e => e.id === editingExpense.id ? data : e)
          onUpdatePredefinedExpenses(updated)
        }
      } else {
        const { data, error } = await createPredefinedExpense(expenseData)
        if (error) {
          console.error('Error creating predefined expense:', error)
          return
        }
        if (data) {
          onUpdatePredefinedExpenses([...predefinedExpenses, data])
        }
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving predefined expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (expense: PredefinedExpense) => {
    if (!confirm(`Are you sure you want to delete "${expense.name}"?`)) return

    try {
      const { success, error } = await deletePredefinedExpense(expense.id)
      if (error) {
        console.error('Error deleting predefined expense:', error)
        return
      }
      if (success) {
        const updated = predefinedExpenses.filter(e => e.id !== expense.id)
        onUpdatePredefinedExpenses(updated)
      }
    } catch (error) {
      console.error('Error deleting predefined expense:', error)
    }
  }

  const handleToggleStatus = async (expense: PredefinedExpense) => {
    try {
      const { data, error } = await togglePredefinedExpenseStatus(expense.id)
      if (error) {
        console.error('Error toggling expense status:', error)
        return
      }
      if (data) {
        const updated = predefinedExpenses.map(e => e.id === expense.id ? data : e)
        onUpdatePredefinedExpenses(updated)
      }
    } catch (error) {
      console.error('Error toggling expense status:', error)
    }
  }

  const handleAddToTransactions = async (expense: PredefinedExpense) => {
    try {
      const { success, error } = await addPredefinedExpenseToTransactions(expense.id)
      if (error) {
        console.error('Error adding to transactions:', error)
        return
      }
      if (success) {
        // Optionally refresh the expense to get updated next due date
        console.log('Successfully added to transactions')
      }
    } catch (error) {
      console.error('Error adding to transactions:', error)
    }
  }

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      weekly: 'bg-gray-100 text-[#2667FF] border border-[#2667FF]/20',
      monthly: 'bg-gray-100 text-[#17BEBB] border border-[#17BEBB]/20',
      yearly: 'bg-gray-100 text-[#3B6064] border border-[#3B6064]/20'
    }
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  const isDue = (nextDue?: Date) => {
    if (!nextDue) return false
    return new Date(nextDue) <= new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recurring Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Set up automatic tracking for your regular bills and subscriptions
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-[#2667FF] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <Calendar className="h-5 w-5 text-[#2667FF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Expenses</p>
                <p className="text-2xl font-bold text-[#2667FF]">{activeExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <DollarSign className="h-5 w-5 text-[#17BEBB]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Est. Monthly</p>
                <p className="text-2xl font-bold text-[#17BEBB]">{formatCurrency(estimatedMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3B6064] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <Clock className="h-5 w-5 text-[#3B6064]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto-Add Enabled</p>
                <p className="text-2xl font-bold text-[#3B6064]">
                  {activeExpenses.filter(e => e.autoAdd).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <AlertCircle className="h-5 w-5 text-[#C41E3D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Now</p>
                <p className="text-2xl font-bold text-[#C41E3D]">
                  {activeExpenses.filter(e => isDue(e.nextDue)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Expenses', count: predefinedExpenses.length },
          { key: 'active', label: 'Active', count: activeExpenses.length },
          { key: 'inactive', label: 'Inactive', count: inactiveExpenses.length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="flex items-center space-x-2"
          >
            <span>{label}</span>
            <Badge variant="secondary" className="ml-1">{count}</Badge>
          </Button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => {
          const category = getCategory(expense.categoryId)
          const dueSoon = isDue(expense.nextDue)
          
          return (
            <Card key={expense.id} className={dueSoon ? 'border-l-4 border-l-[#C41E3D] shadow-md' : 'shadow-sm hover:shadow-md transition-shadow'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${category?.color ? '' : 'bg-gray-100'}`}
                           style={category?.color ? { 
                             backgroundColor: `${category.color}20`, 
                             border: `1px solid ${category.color}40` 
                           } : {}}>
                        {category?.icon || '📝'}
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{expense.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{category?.name || 'Unknown Category'}</span>
                          <span>•</span>
                          <Badge className={getFrequencyBadge(expense.frequency)}>
                            {expense.frequency}
                          </Badge>
                          {expense.autoAdd && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                Auto-add
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{formatCurrency(expense.amount)}</div>
                      {expense.nextDue && (
                        <div className={`text-sm ${dueSoon ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                          {dueSoon ? 'Due: ' : 'Next: '}{formatDate(expense.nextDue)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {dueSoon && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToTransactions(expense)}
                        className="text-[#17BEBB] border-[#17BEBB]/30 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Now
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(expense)}
                      className={expense.isActive ? 'text-orange-600' : 'text-green-600'}
                    >
                      {expense.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenModal(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expense.description && (
                  <p className="text-sm text-muted-foreground mt-2 ml-14">
                    {expense.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recurring expenses found</h3>
            <p className="text-muted-foreground mb-4">
              Add your bills and subscriptions to never miss a payment
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expense Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., Netflix Subscription, Rent"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
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
                <option value="">Select a category</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Next Due Date</label>
              <Input
                type="date"
                value={formData.nextDue}
                onChange={(e) => setFormData(prev => ({ ...prev, nextDue: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="Additional details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.autoAdd}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAdd: checked }))}
              />
              <div>
                <label className="text-sm font-medium">Auto-add to transactions</label>
                <p className="text-xs text-muted-foreground">
                  Automatically create transactions when due
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingExpense ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
