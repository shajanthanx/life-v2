'use client'

import { TasksView } from '../productivity/tasks-view'
import { AppState, Task } from '@/types'

interface TasksPageProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddTask?: () => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
}

export function TasksPage({ data, onDataUpdate, onAddTask, onTaskEdit, onTaskDelete }: TasksPageProps) {
  const handleTaskUpdate = (updatedTask: Task) => {
    const updatedTasks = data.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
    onDataUpdate({
      ...data,
      tasks: updatedTasks
    })
  }

  const handleAddTask = () => {
    onAddTask?.()
  }

  return (
    <div className="space-y-6">
      <TasksView 
        tasks={data.tasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskEdit={onTaskEdit}
        onTaskDelete={onTaskDelete}
        onAddTask={handleAddTask}
      />
    </div>
  )
}
