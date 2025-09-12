'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigurationView } from './configuration-view'
import { RecordingView } from './recording-view'
import { AnalyticsView } from './analytics-view'
import { AppState } from '@/types'
import { Settings, Calendar, BarChart3 } from 'lucide-react'
import { getUserCategories, initializeUserCategories } from '@/lib/api/categories'
import { getUserPredefinedExpenses } from '@/lib/api/predefined-expenses'

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recording" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recording
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recording" className="mt-6">
          <RecordingView
            transactions={data.transactions || []}
            categories={data.categories || []}
            predefinedExpenses={data.predefinedExpenses || []}
            onUpdateTransactions={handleUpdateTransactions}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsView
            transactions={data.transactions || []}
            categories={data.categories || []}
            savingsGoals={data.savingsGoals || []}
            predefinedExpenses={data.predefinedExpenses || []}
          />
        </TabsContent>
        
        <TabsContent value="configuration" className="mt-6">
          <ConfigurationView
            categories={data.categories || []}
            predefinedExpenses={data.predefinedExpenses || []}
            incomeSources={data.incomeSources || []}
            onUpdateCategories={handleUpdateCategories}
            onUpdatePredefinedExpenses={handleUpdatePredefinedExpenses}
            onUpdateIncomeSources={handleUpdateIncomeSources}
            onAddIncomeSource={onAddIncomeSource}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
