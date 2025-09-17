'use client'

import { useState, useEffect } from 'react'
import { getUserSettings, saveUserSettings } from '@/lib/api/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Category, PredefinedExpense, IncomeSource } from '@/types'
import { UserAccount, getUserAccounts, createUserAccount, updateUserAccount, deleteUserAccount, createDefaultAccounts, updateAccountBalance } from '@/lib/api/accounts'
import { CategoriesManagement } from './categories-management'
import { PredefinedExpensesManagement } from './predefined-expenses-management'
import { IncomeManagement } from '../income/income-management'
import { Settings, DollarSign, Calendar, Briefcase, Globe, Landmark, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

interface ConfigurationViewProps {
  categories: Category[]
  predefinedExpenses: PredefinedExpense[]
  incomeSources: IncomeSource[]
  accounts: UserAccount[]
  onUpdateCategories: (categories: Category[]) => void
  onUpdatePredefinedExpenses: (expenses: PredefinedExpense[]) => void
  onUpdateIncomeSources: (sources: IncomeSource[]) => void
  onUpdateAccounts: (accounts: UserAccount[]) => void
  onAddIncomeSource?: () => void
}

// Currency Settings Component
function CurrencySettings() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
  ]

  useEffect(() => {
    // Load currency from database settings
    const loadCurrency = async () => {
      try {
        setIsLoadingSettings(true)
        const { data, error } = await getUserSettings()
        if (data && !error) {
          setSelectedCurrency(data.preferences.currency)
        }
      } catch (error) {
        console.error('Error loading currency settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadCurrency()
  }, [])

  const handleCurrencyChange = async (currencyCode: string) => {
    setIsLoading(true)
    try {
      // Get current settings first
      const { data: currentSettings, error: fetchError } = await getUserSettings()
      if (fetchError || !currentSettings) {
        console.error('Error fetching current settings:', fetchError)
        return
      }

      // Update currency in database
      const updatedSettings = {
        ...currentSettings,
        preferences: {
          ...currentSettings.preferences,
          currency: currencyCode
        }
      }

      const { error: saveError } = await saveUserSettings(updatedSettings)
      if (saveError) {
        console.error('Error saving currency preference:', saveError)
        return
      }

      // Update localStorage for immediate UI updates
      localStorage.setItem('financeAppCurrency', currencyCode)
      setSelectedCurrency(currencyCode)
      
      // Trigger a page refresh to update all currency displays
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error saving currency preference:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Currency Settings</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred currency for all financial displays
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingSettings ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading currency settings...</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currencies.map((currency) => (
              <Button
                key={currency.code}
                variant={selectedCurrency === currency.code ? 'default' : 'outline'}
                className="justify-start h-auto p-4"
                onClick={() => handleCurrencyChange(currency.code)}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{currency.symbol}</span>
                    <span className="font-medium">{currency.code}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currency.name}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Currency Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Changing your currency will update all financial displays throughout the app. 
                The page will refresh automatically to apply the changes.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Currently selected:</strong> {currencies.find(c => c.code === selectedCurrency)?.name} ({selectedCurrency})
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Accounts Management Component
function AccountsManagement({ accounts, onUpdateAccounts }: { accounts: UserAccount[], onUpdateAccounts: (accounts: UserAccount[]) => void }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBalanceUpdateOpen, setIsBalanceUpdateOpen] = useState(false)
  const [balanceUpdateAccount, setBalanceUpdateAccount] = useState<UserAccount | null>(null)
  const [balanceUpdateAmount, setBalanceUpdateAmount] = useState('')
  const [balanceUpdateType, setBalanceUpdateType] = useState<'add' | 'subtract' | 'set'>('add')
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as UserAccount['type'],
    balance: '0',
    currency: 'USD',
    description: ''
  })

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: '🏦' },
    { value: 'savings', label: 'Savings Account', icon: '💰' },
    { value: 'investment', label: 'Investment Account', icon: '📈' },
    { value: 'credit', label: 'Credit Card', icon: '💳' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
    { value: 'other', label: 'Other', icon: '📋' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    setIsLoading(true)
    try {
      const accountData = {
        name: formData.name,
        type: formData.type,
        balance: Number(formData.balance) || 0,
        currency: formData.currency,
        description: formData.description || undefined,
        isActive: true
      }

      if (editingAccount) {
        const { data, error } = await updateUserAccount(editingAccount.id, accountData)
        if (error) {
          console.error('Error updating account:', error)
          return
        }
        if (data) {
          const updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? data : acc)
          onUpdateAccounts(updatedAccounts)
          setIsEditOpen(false)
          setEditingAccount(null)
        }
      } else {
        const { data, error } = await createUserAccount(accountData)
        if (error) {
          console.error('Error creating account:', error)
          return
        }
        if (data) {
          onUpdateAccounts([...accounts, data])
          setIsCreateOpen(false)
        }
      }

      setFormData({
        name: '',
        type: 'checking',
        balance: '0',
        currency: 'USD',
        description: ''
      })
    } catch (error) {
      console.error('Error saving account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (account: UserAccount) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      description: account.description || ''
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (accountId: string) => {
    try {
      const { success, error } = await deleteUserAccount(accountId)
      if (error) {
        console.error('Error deleting account:', error)
        return
      }
      if (success) {
        const updatedAccounts = accounts.filter(acc => acc.id !== accountId)
        onUpdateAccounts(updatedAccounts)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const getTypeInfo = (type: string) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0]
  }

  const handleBalanceUpdate = async () => {
    if (!balanceUpdateAccount || !balanceUpdateAmount || Number(balanceUpdateAmount) <= 0) return

    setIsLoading(true)
    try {
      const { data, error } = await updateAccountBalance(
        balanceUpdateAccount.id, 
        Number(balanceUpdateAmount), 
        balanceUpdateType
      )
      if (error) {
        console.error('Error updating account balance:', error)
        return
      }
      if (data) {
        const updatedAccounts = accounts.map(acc => acc.id === balanceUpdateAccount.id ? data : acc)
        onUpdateAccounts(updatedAccounts)
        setIsBalanceUpdateOpen(false)
        setBalanceUpdateAccount(null)
        setBalanceUpdateAmount('')
        setBalanceUpdateType('add')
      }
    } catch (error) {
      console.error('Error updating account balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const typeInfo = getTypeInfo(account.type)
          return (
            <Card key={account.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeInfo.icon}</span>
                      <h4 className="font-medium">{account.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                    <p className="text-lg font-bold mt-1">{account.balance.toLocaleString('en-US', { style: 'currency', currency: account.currency })}</p>
                    {account.description && (
                      <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-green-500 hover:text-green-700" 
                      onClick={() => {
                        setBalanceUpdateAccount(account)
                        setIsBalanceUpdateOpen(true)
                      }}
                      title="Add/Remove money"
                    >
                      <DollarSign className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(account)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(account.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Landmark className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No accounts found</p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Account
          </Button>
        </div>
      )}

      {/* Create/Edit Account Dialog */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${(isCreateOpen || isEditOpen) ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Checking"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as UserAccount['type'] })}
                >
                  {accountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="LKR">LKR (Rs)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsEditOpen(false)
                    setEditingAccount(null)
                    setFormData({
                      name: '',
                      type: 'checking',
                      balance: '0',
                      currency: 'USD',
                      description: ''
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingAccount ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Balance Update Dialog */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isBalanceUpdateOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">
              Update Account Balance - {balanceUpdateAccount?.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Operation</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={balanceUpdateType}
                  onChange={(e) => setBalanceUpdateType(e.target.value as 'add' | 'subtract' | 'set')}
                >
                  <option value="add">➕ Add Money</option>
                  <option value="subtract">➖ Remove Money</option>
                  <option value="set">💰 Set Balance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                  value={balanceUpdateAmount}
                  onChange={(e) => setBalanceUpdateAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>Current Balance:</strong> {balanceUpdateAccount?.balance.toLocaleString('en-US', { style: 'currency', currency: balanceUpdateAccount?.currency || 'USD' })}</p>
                {balanceUpdateAmount && (
                  <p>
                    <strong>New Balance:</strong> {
                      (() => {
                        const current = balanceUpdateAccount?.balance || 0
                        const amount = Number(balanceUpdateAmount) || 0
                        let newBalance = current
                        if (balanceUpdateType === 'add') newBalance = current + amount
                        else if (balanceUpdateType === 'subtract') newBalance = current - amount
                        else if (balanceUpdateType === 'set') newBalance = amount
                        return newBalance.toLocaleString('en-US', { style: 'currency', currency: balanceUpdateAccount?.currency || 'USD' })
                      })()
                    }
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsBalanceUpdateOpen(false)
                  setBalanceUpdateAccount(null)
                  setBalanceUpdateAmount('')
                  setBalanceUpdateType('add')
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="flex-1" 
                onClick={handleBalanceUpdate}
                disabled={isLoading || !balanceUpdateAmount || Number(balanceUpdateAmount) <= 0}
              >
                {isLoading ? 'Updating...' : 'Update Balance'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfigurationView({
  categories,
  predefinedExpenses,
  incomeSources,
  accounts,
  onUpdateCategories,
  onUpdatePredefinedExpenses,
  onUpdateIncomeSources,
  onUpdateAccounts,
  onAddIncomeSource
}: ConfigurationViewProps) {
  const [activeTab, setActiveTab] = useState('categories')

  // Calculate statistics
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')
  const activeExpenses = predefinedExpenses.filter(e => e.isActive)
  const activeSources = incomeSources.filter(s => s.isActive)

  const totalMonthlyPredefined = activeExpenses
    .filter(e => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalYearlyPredefined = activeExpenses
    .filter(e => e.frequency === 'yearly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalWeeklyPredefined = activeExpenses
    .filter(e => e.frequency === 'weekly')
    .reduce((sum, e) => sum + e.amount, 0)

  const estimatedMonthlyExpenses = totalMonthlyPredefined + (totalYearlyPredefined / 12) + (totalWeeklyPredefined * 4.33)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Finance Configuration</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Set up categories, income sources, and recurring expenses</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#2667FF] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#2667FF]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-[#2667FF]">{categories.length}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {incomeCategories.length} income • {expenseCategories.length} expense
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-[#17BEBB]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Income Sources</p>
                <p className="text-xl sm:text-2xl font-bold text-[#17BEBB]">{activeSources.length}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {incomeSources.length - activeSources.length} inactive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#C41E3D]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Recurring Expenses</p>
                <p className="text-xl sm:text-2xl font-bold text-[#C41E3D]">{activeExpenses.length}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {predefinedExpenses.length - activeExpenses.length} inactive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3B6064] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#3B6064]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Est. Monthly</p>
                <p className="text-xl sm:text-2xl font-bold text-[#3B6064] truncate">
                  ${estimatedMonthlyExpenses.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground truncate">from recurring expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cats</span>
            </span>
            <Badge variant="secondary" className="text-xs px-1">
              {categories.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden lg:inline">Recurring Expenses</span>
              <span className="hidden sm:inline lg:hidden">Expenses</span>
              <span className="sm:hidden">Exp</span>
            </span>
            <Badge variant="secondary" className="text-xs px-1">
              {activeExpenses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Income Sources</span>
              <span className="sm:hidden">Inc</span>
            </span>
            <Badge variant="secondary" className="text-xs px-1">
              {activeSources.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <Landmark className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Accounts</span>
              <span className="sm:hidden">Acc</span>
            </span>
            <Badge variant="secondary" className="text-xs px-1">
              {accounts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManagement
            categories={categories}
            onUpdateCategories={onUpdateCategories}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <PredefinedExpensesManagement
            predefinedExpenses={predefinedExpenses}
            categories={categories}
            onUpdatePredefinedExpenses={onUpdatePredefinedExpenses}
          />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeManagement
                incomeSources={incomeSources}
                incomeRecords={[]} // We'll pass empty array since this is just for setup
                onAddIncomeSource={onAddIncomeSource || (() => {})}
                onUpdateIncomeSource={(source) => {
                  const updated = incomeSources.map(s => s.id === source.id ? source : s)
                  onUpdateIncomeSources(updated)
                }}
                onAddIncomeRecord={() => {}} // Not needed in configuration view
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsManagement
                accounts={accounts}
                onUpdateAccounts={onUpdateAccounts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <CurrencySettings />
        </TabsContent>
      </Tabs>

      {/* Setup Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Setup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border-l-4 border-l-[#2667FF] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#2667FF] mb-2">🏷️ Categories</h4>
              <p className="text-sm text-gray-600">
                Create specific categories for better expense tracking. Example: separate "Groceries" from "Restaurants".
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#17BEBB] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#17BEBB] mb-2">💰 Income Sources</h4>
              <p className="text-sm text-gray-600">
                Set up all your income sources with accurate amounts and frequencies for better budgeting.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#C41E3D] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#C41E3D] mb-2">📅 Recurring Expenses</h4>
              <p className="text-sm text-gray-600">
                Add all your bills and subscriptions. Enable auto-add to never miss recording them.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#3B6064] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#3B6064] mb-2">🎨 Customization</h4>
              <p className="text-sm text-gray-600">
                Use icons and colors to make your categories visually distinct and easier to identify.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
