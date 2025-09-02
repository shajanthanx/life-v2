'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoalsView } from './goals-view'
import { TasksView } from './tasks-view'
import { HabitsView } from './habits-view'
import { AppState, Goal, Task, Habit } from '@/types'

interface ProductivityViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddGoal?: () => void
  onGoalEdit?: (goal: Goal) => void
  onGoalDelete?: (goalId: string) => void
  onAddTask?: () => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  onAddHabit?: () => void
  onHabitEdit?: (habit: Habit) => void
  onHabitDelete?: (habitId: string) => void
}

export function ProductivityView({ data, onDataUpdate, onAddGoal, onGoalEdit, onGoalDelete, onAddTask, onTaskEdit, onTaskDelete, onAddHabit, onHabitEdit, onHabitDelete }: ProductivityViewProps) {
  const [activeTab, setActiveTab] = useState('goals')

  const handleGoalUpdate = (updatedGoal: Goal) => {
    const updatedGoals = data.goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    )
    onDataUpdate({
      ...data,
      goals: updatedGoals
    })
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    const updatedTasks = data.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
    onDataUpdate({
      ...data,
      tasks: updatedTasks
    })
  }

  const handleHabitUpdate = (updatedHabit: Habit) => {
    const updatedHabits = data.habits.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    )
    onDataUpdate({
      ...data,
      habits: updatedHabits
    })
  }

  const handleAddGoal = () => {
    onAddGoal?.()
  }

  const handleAddTask = () => {
    onAddTask?.()
  }

  const handleAddHabit = () => {
    onAddHabit?.()
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals" className="mt-6">
          <GoalsView 
            goals={data.goals}
            onGoalUpdate={handleGoalUpdate}
            onGoalEdit={onGoalEdit}
            onGoalDelete={onGoalDelete}
            onAddGoal={handleAddGoal}
          />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TasksView 
            tasks={data.tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onAddTask={handleAddTask}
          />
        </TabsContent>
        
        <TabsContent value="habits" className="mt-6">
          <HabitsView 
            habits={data.habits}
            onHabitUpdate={handleHabitUpdate}
            onHabitEdit={onHabitEdit}
            onHabitDelete={onHabitDelete}
            onAddHabit={handleAddHabit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
