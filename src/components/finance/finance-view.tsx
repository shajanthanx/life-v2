'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigurationView } from './configuration-view'
import { RecordingView } from './recording-view'
import { AnalyticsView } from './analytics-view'
import { TransactionsView } from './transactions-view'
import { SavingsView } from './savings-view'
import { AppState, UserAccount } from '@/types'
import { Settings, Calendar, BarChart3, List, PiggyBank } from 'lucide-react'
import { getUserCategories, initializeUserCategories } from '@/lib/api/categories'
import { getUserPredefinedExpenses } from '@/lib/api/predefined-expenses'
import { getUserAccounts, createDefaultAccounts } from '@/lib/api/accounts'
import { getUserSavingsGoals } from '@/lib/api/savings-goals'

interface FinanceViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddTransaction?: () => void
  onAddSavingsGoal?: () => void
  onAddIncomeSource?: () => void
}

export function FinanceView({ data, onDataUpdate, onAddTransaction, onAddSavingsGoal, onAddIncomeSource }: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState('recording')
  const [isLoading, setIsLoading] = useState(false)

  // Initialize categories if they don't exist
  useEffect(() => {
    const initCategories = async () => {
      const categories = data.categories || []
      if (categories.length === 0) {
        setIsLoading(true)
        try {
          const { success } = await initializeUserCategories()
          if (success) {
            const { data: fetchedCategories } = await getUserCategories()
            if (fetchedCategories) {
              onDataUpdate({
                ...data,
                categories: fetchedCategories,
                predefinedExpenses: data.predefinedExpenses || []
              })
            }
          }
        } catch (error) {
          console.error('Error initializing categories:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initCategories()
  }, [data.categories?.length])

  // Load predefined expenses if not already loaded
  useEffect(() => {
    const loadPredefinedExpenses = async () => {
      const predefinedExpenses = data.predefinedExpenses || []
      if (predefinedExpenses.length === 0) {
        try {
          const { data: expenses } = await getUserPredefinedExpenses()
          if (expenses) {
            onDataUpdate({
              ...data,
              categories: data.categories || [],
              predefinedExpenses: expenses
            })
          }
        } catch (error) {
          console.error('Error loading predefined expenses:', error)
        }
      }
    }

    loadPredefinedExpenses()
  }, [data.predefinedExpenses?.length])

  // Load accounts if not already loaded
  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = data.accounts || []
      if (accounts.length === 0) {
        try {
          const { data: userAccounts } = await getUserAccounts()
          if (userAccounts && userAccounts.length > 0) {
            onDataUpdate({
              ...data,
              accounts: userAccounts
            })
          } else {
            // Create default accounts if none exist
            const { success } = await createDefaultAccounts()
            if (success) {
              const { data: defaultAccounts } = await getUserAccounts()
              if (defaultAccounts) {
                onDataUpdate({
                  ...data,
                  accounts: defaultAccounts
                })
              }
            }
          }
        } catch (error) {
          console.error('Error loading accounts:', error)
        }
      }
    }

    loadAccounts()
  }, [data.accounts?.length])

  // Load savings goals if not already loaded
  useEffect(() => {
    const loadSavingsGoals = async () => {
      const savingsGoals = data.savingsGoals || []
      if (savingsGoals.length === 0) {
        try {
          const { data: userSavingsGoals, error } = await getUserSavingsGoals()
          if (error) {
            console.error('Error loading savings goals in finance-view:', error)
          } else {
            onDataUpdate({
              ...data,
              savingsGoals: userSavingsGoals
            })
          }
        } catch (error) {
          console.error('Error loading savings goals:', error)
        }
      }
    }

    loadSavingsGoals()
  }, [data.savingsGoals?.length])

  const handleUpdateCategories = (categories: typeof data.categories) => {
    onDataUpdate({
      ...data,
      categories,
      predefinedExpenses: data.predefinedExpenses || []
    })
  }

  const handleUpdatePredefinedExpenses = (predefinedExpenses: typeof data.predefinedExpenses) => {
    onDataUpdate({
      ...data,
      categories: data.categories || [],
      predefinedExpenses
    })
  }

  const handleUpdateTransactions = (transactions: typeof data.transactions) => {
    onDataUpdate({
      ...data,
      transactions,
      categories: data.categories || [],
      predefinedExpenses: data.predefinedExpenses || []
    })
  }

  const handleUpdateIncomeSources = (incomeSources: typeof data.incomeSources) => {
    onDataUpdate({
      ...data,
      incomeSources,
      categories: data.categories || [],
      predefinedExpenses: data.predefinedExpenses || []
    })
  }

  const handleUpdateAccounts = (accounts: UserAccount[]) => {
    onDataUpdate({
      ...data,
      accounts
    })
  }

  if (isLoading) {
  return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Setting up your finance module...</p>
                        </div>
                      </div>
                    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-muted-foreground">Track and manage your finances</p>
        </div>
      </div>
                
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="recording" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Recording</span>
            <span className="sm:hidden">Record</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <PiggyBank className="h-4 w-4" />
            <span>Savings</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recording" className="mt-6">
          <RecordingView
            transactions={data.transactions || []}
            categories={data.categories || []}
            predefinedExpenses={data.predefinedExpenses || []}
            onUpdateTransactions={handleUpdateTransactions}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsView
            transactions={data.transactions || []}
            categories={data.categories || []}
            onUpdateTransactions={handleUpdateTransactions}
          />
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <SavingsView
            savingsGoals={data.savingsGoals || []}
            transactions={data.transactions || []}
            onUpdateSavingsGoals={(goals) => onDataUpdate({ ...data, savingsGoals: goals })}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsView
            transactions={data.transactions || []}
            categories={data.categories || []}
            predefinedExpenses={data.predefinedExpenses || []}
            accounts={data.accounts || []}
          />
        </TabsContent>
        
        <TabsContent value="configuration" className="mt-6">
          <ConfigurationView
            categories={data.categories || []}
            predefinedExpenses={data.predefinedExpenses || []}
            incomeSources={data.incomeSources || []}
            accounts={data.accounts || []}
            onUpdateCategories={handleUpdateCategories}
            onUpdatePredefinedExpenses={handleUpdatePredefinedExpenses}
            onUpdateIncomeSources={handleUpdateIncomeSources}
            onUpdateAccounts={handleUpdateAccounts}
            onAddIncomeSource={onAddIncomeSource}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
