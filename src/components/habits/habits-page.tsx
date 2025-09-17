'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { HabitsOverview } from './habits-overview'
import { HabitsAnalytics } from './habits-analytics'
import { BulkHabitLogger } from './bulk-habit-logger'
import { HabitsManagement } from './habits-management'
import { AppState, Habit } from '@/types'
import { BarChart3, Home, Grid3X3, TrendingUp, Settings, Plus } from 'lucide-react'

interface HabitsPageProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddHabit?: () => void
  onHabitEdit?: (habit: Habit) => void
  onHabitDelete?: (habitId: string) => void
}

export function HabitsPage({ data, onDataUpdate, onAddHabit, onHabitEdit, onHabitDelete }: HabitsPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk' | 'manage' | 'analytics'>('overview')

  const handleHabitUpdate = (updatedHabit: Habit) => {
    const updatedHabits = data.habits.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    )
    
    onDataUpdate({
      ...data,
      habits: updatedHabits
    })
  }

  const handleHabitDelete = (habitId: string) => {
    const updatedHabits = data.habits.filter(habit => habit.id !== habitId)
    onDataUpdate({
      ...data,
      habits: updatedHabits
    })
    onHabitDelete?.(habitId)
  }

  const handleAddHabit = () => {
    onAddHabit?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track and analyze your daily habits</p>
        </div>
        <Button onClick={handleAddHabit} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'bulk' | 'manage' | 'analytics')}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Home className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span>Manage</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Table View</span>
            <span className="sm:hidden">Table</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <HabitsOverview
            habits={data.habits}
            onHabitUpdate={handleHabitUpdate}
            onAddHabit={handleAddHabit}
          />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <HabitsManagement
            habits={data.habits}
            onHabitUpdate={handleHabitUpdate}
            onHabitDelete={handleHabitDelete}
            onHabitEdit={onHabitEdit!}
            onAddHabit={handleAddHabit}
          />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkHabitLogger 
            habits={data.habits}
            onHabitUpdate={handleHabitUpdate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <HabitsAnalytics habits={data.habits} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
