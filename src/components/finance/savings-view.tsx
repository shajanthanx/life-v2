'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { SavingsGoal, Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { 
  PiggyBank, 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Landmark,
  Edit2,
  Trash2,
  DollarSign,
  MapPin
} from 'lucide-react'
import { createSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addToSavingsGoal } from '@/lib/api/savings-goals'
import { getUserAccounts } from '@/lib/api/accounts'
import { UserAccount } from '@/types'

interface SavingsViewProps {
  savingsGoals: SavingsGoal[]
  transactions: Transaction[]
  onUpdateSavingsGoals: (goals: SavingsGoal[]) => void
}

interface SavingsGoalFormData {
  name: string
  targetAmount: string
  currentAmount: string
  description: string
  targetDate: string
  account: string
}

const getAccountTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'checking': '🏦',
    'savings': '💰',
    'investment': '📈',
    'credit': '💳',
    'cash': '💵',
    'crypto': '₿',
    'other': '📋'
  }
  return icons[type] || '📋'
}

export function SavingsView({ 
  savingsGoals, 
  transactions,
  onUpdateSavingsGoals 
}: SavingsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [formData, setFormData] = useState<SavingsGoalFormData>({
    name: '',
    targetAmount: '',
    currentAmount: '',
    description: '',
    targetDate: '',
    account: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [quickUpdateOpen, setQuickUpdateOpen] = useState<string | null>(null)
  const [quickUpdateAmount, setQuickUpdateAmount] = useState('')
  const [accounts, setAccounts] = useState<UserAccount[]>([])

  // Load accounts from API
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data, error } = await getUserAccounts()
        if (error) {
          console.error('Error loading accounts:', error)
        } else {
          setAccounts(data)
        }
      } catch (error) {
        console.error('Error loading accounts:', error)
      }
    }

    loadAccounts()
  }, [])

  // Set initial loading to false since parent handles data loading
  useEffect(() => {
    setIsInitialLoading(false)
  }, [])

  // Calculate total savings from all goals
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTargets = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0

  // Calculate savings by account
  const savingsByAccount = savingsGoals.reduce((acc, goal) => {
    const account = goal.account || 'other'
    acc[account] = (acc[account] || 0) + goal.currentAmount
    return acc
  }, {} as Record<string, number>)

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      description: '',
      targetDate: '',
      account: 'savings'
    })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      description: goal.description || '',
      targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
      account: goal.account || 'savings'
    })
    setIsEditOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetAmount) return

    setIsLoading(true)
    try {
      const goalData = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount) || 0,
        description: formData.description || undefined,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        account: formData.account || 'savings',
        isCompleted: Number(formData.currentAmount) >= Number(formData.targetAmount)
      }

      if (editingGoal) {
        // Update existing goal
        const { data, error } = await updateSavingsGoal(editingGoal.id, goalData)
        if (error) {
          console.error('Error updating goal:', error)
          return
        }
        if (data) {
          const updatedGoals = savingsGoals.map(goal => 
            goal.id === editingGoal.id ? data : goal
          )
          onUpdateSavingsGoals(updatedGoals)
          setIsEditOpen(false)
          setEditingGoal(null)
        }
      } else {
        // Create new goal
        const { data, error } = await createSavingsGoal(goalData)
        if (error) {
          console.error('Error creating goal:', error)
          return
        }
        if (data) {
          onUpdateSavingsGoals([...savingsGoals, data])
          setIsCreateOpen(false)
        }
      }

      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        description: '',
        targetDate: '',
        account: ''
      })
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { success, error } = await deleteSavingsGoal(goalId)
      if (error) {
        console.error('Error deleting goal:', error)
        return
      }
      if (success) {
        const updatedGoals = savingsGoals.filter(goal => goal.id !== goalId)
        onUpdateSavingsGoals(updatedGoals)
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleQuickUpdate = async (goalId: string) => {
    if (!quickUpdateAmount || Number(quickUpdateAmount) <= 0) return
    
    try {
      setIsLoading(true)
      const { data, error } = await addToSavingsGoal(goalId, Number(quickUpdateAmount))
      if (error) {
        console.error('Error updating savings amount:', error)
        return
      }
      if (data) {
        const updatedGoals = savingsGoals.map(goal => 
          goal.id === goalId ? data : goal
        )
        onUpdateSavingsGoals(updatedGoals)
        setQuickUpdateOpen(null)
        setQuickUpdateAmount('')
      }
    } catch (error) {
      console.error('Error updating savings amount:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAccountInfo = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      return {
        value: account.id,
        label: `${getAccountTypeIcon(account.type)} ${account.name}`,
        icon: getAccountTypeIcon(account.type)
      }
    }
    return { value: accountId, label: accountId || 'Unknown Account', icon: '📋' }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDaysLeft = (targetDate?: Date) => {
    if (!targetDate) return null
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading savings goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Savings & Goals</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Track your savings goals and progress</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Savings Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-[#17BEBB]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-lg sm:text-2xl font-bold text-[#17BEBB] truncate">{formatCurrency(totalSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#2667FF] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <Target className="h-5 w-5 text-[#2667FF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Targets</p>
                <p className="text-2xl font-bold text-[#2667FF]">{formatCurrency(totalTargets)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <TrendingUp className="h-5 w-5 text-[#C41E3D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-[#C41E3D]">{overallProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings by Account */}
      {Object.keys(savingsByAccount).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Landmark className="h-5 w-5" />
              <span>Savings by Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(savingsByAccount).map(([account, amount]) => {
                const accountInfo = getAccountInfo(account)
                return (
                  <div key={account} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{accountInfo.icon}</span>
                      <span className="text-sm font-medium">{accountInfo.label.replace(/^.*\s/, '')}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(amount)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Goals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savingsGoals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          const daysLeft = getDaysLeft(goal.targetDate)
          const accountInfo = getAccountInfo(goal.account || 'other')
          
          return (
            <Card key={goal.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {goal.name}
                    </CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                      onClick={() => setQuickUpdateOpen(goal.id)}
                      title="Add money"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(goal)}
                      title="Edit goal"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete goal"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Account & Date Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Account:</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {accountInfo.icon} {accountInfo.label.replace(/^.*\s/, '')}
                    </Badge>
                  </div>
                  
                  {goal.targetDate && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Target:</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">{goal.targetDate.toLocaleDateString()}</p>
                        {daysLeft !== null && (
                          <p className={`text-xs ${daysLeft < 0 ? 'text-red-500' : daysLeft < 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge 
                    variant={goal.isCompleted ? "default" : "secondary"}
                    className={goal.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {goal.isCompleted ? "✅ Completed" : progress >= 75 ? "🔥 Almost There" : "💪 In Progress"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Empty State */}
        {savingsGoals.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No savings goals yet</h3>
              <p className="text-muted-foreground mb-6">Start saving for your dreams by creating your first savings goal</p>
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Goal Modal */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
          setEditingGoal(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Goal Name</label>
              <Input
                placeholder="e.g., Emergency Fund, New Car, Vacation"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Account Location</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.account}
                onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
              >
                <option value="">Select an account (optional)</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {getAccountTypeIcon(account.type)} {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="What are you saving for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Target Date (Optional)</label>
              <Input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateOpen(false)
                setIsEditOpen(false)
                setEditingGoal(null)
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.name || !formData.targetAmount}>
                {isLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Update Modal */}
      <Dialog open={!!quickUpdateOpen} onOpenChange={() => setQuickUpdateOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-green-500" />
              <span>Add to Savings</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount to Add</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={quickUpdateAmount}
                onChange={(e) => setQuickUpdateAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This amount will be added to your current savings for this goal.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQuickUpdateOpen(null)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => quickUpdateOpen && handleQuickUpdate(quickUpdateOpen)}
              disabled={isLoading || !quickUpdateAmount || Number(quickUpdateAmount) <= 0}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 'Adding...' : 'Add to Savings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
