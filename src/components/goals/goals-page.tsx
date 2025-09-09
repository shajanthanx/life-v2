'use client'

import { GoalsView } from '../productivity/goals-view'
import { AppState, Goal } from '@/types'

interface GoalsPageProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddGoal?: () => void
  onGoalEdit?: (goal: Goal) => void
  onGoalDelete?: (goalId: string) => void
}

export function GoalsPage({ data, onDataUpdate, onAddGoal, onGoalEdit, onGoalDelete }: GoalsPageProps) {
  const handleGoalUpdate = (updatedGoal: Goal) => {
    const updatedGoals = data.goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    )
    onDataUpdate({
      ...data,
      goals: updatedGoals
    })
  }

  const handleAddGoal = () => {
    onAddGoal?.()
  }

  return (
    <div className="space-y-6">
      <GoalsView 
        goals={data.goals}
        onGoalUpdate={handleGoalUpdate}
        onGoalEdit={onGoalEdit}
        onGoalDelete={onGoalDelete}
        onAddGoal={handleAddGoal}
      />
    </div>
  )
}
