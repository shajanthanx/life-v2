'use client'

import { useState, useMemo } from 'react'
import { AggregatedHabitHeatmap } from '../habits/aggregated-habit-heatmap'
import { FinanceOverview } from '../finance/finance-overview'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AppState } from '@/types'
import { formatDate } from '@/lib/utils'

interface DashboardViewProps {
  data: AppState
  onQuickAction: (action: string) => void
  onNavigateToFinance: () => void
}

export function DashboardView({ data, onQuickAction, onNavigateToFinance }: DashboardViewProps) {
  // State for heatmap
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  
  // Initialize selected habits to all habits
  useMemo(() => {
    if (data.habits.length > 0 && selectedHabits.length === 0) {
      setSelectedHabits(data.habits.map(h => h.id))
    }
  }, [data.habits, selectedHabits.length])

  // Simplified - only need today's date
  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Streamlined Welcome */}
      {/* <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-1">Daily Progress Dashboard</h1>
        <p className="text-muted-foreground">
          {formatDate(today)} • Track your habits and stay consistent
        </p>
      </div> */}

      

      {/* Main Focus: Habits Heatmap */}
      {data.habits.length > 0 ? (
        <div className="pt-8">
        <AggregatedHabitHeatmap 
          habits={data.habits}
          selectedHabits={selectedHabits}
          year={new Date().getFullYear()}
          onSelectAllHabits={() => setSelectedHabits(data.habits.map(h => h.id))}
        />
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">No habits found. Start by creating your first habit!</p>
          <Button onClick={() => onQuickAction('add-habit')} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create First Habit
          </Button>
        </div>
      )}

      {/* Finance Overview */}
      <FinanceOverview 
        transactions={data.transactions || []}
        savingsGoals={data.savingsGoals || []}
        onNavigateToFinance={onNavigateToFinance}
      />

    </div>
  )
}
