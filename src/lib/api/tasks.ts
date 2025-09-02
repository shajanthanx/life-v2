import { supabase } from '../supabase'
import { Task } from '@/types'
import { authService } from '../auth'

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<{ data: Task | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        due_date: taskData.dueDate?.toISOString(),
        is_completed: taskData.isCompleted,
        completed_at: taskData.completedAt?.toISOString(),
        is_recurring: taskData.isRecurring,
        recurring_pattern: taskData.recurringPattern
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      isRecurring: data.is_recurring,
      recurringPattern: data.recurring_pattern,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedTask, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create task' }
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<{ data: Task | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString()
    if (updates.isCompleted !== undefined) {
      updateData.is_completed = updates.isCompleted
      updateData.completed_at = updates.isCompleted ? new Date().toISOString() : null
    }
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring
    if (updates.recurringPattern !== undefined) updateData.recurring_pattern = updates.recurringPattern

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      isRecurring: data.is_recurring,
      recurringPattern: data.recurring_pattern,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedTask, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function getUserTasks(): Promise<{ data: Task[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedTasks: Task[] = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      isCompleted: task.is_completed,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      isRecurring: task.is_recurring,
      recurringPattern: task.recurring_pattern,
      createdAt: new Date(task.created_at)
    }))

    return { data: transformedTasks, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch tasks' }
  }
}

export async function toggleTaskCompletion(id: string): Promise<{ data: Task | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // First get the current task state
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('is_completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    const newCompletedState = !currentTask.is_completed

    const { data, error } = await supabase
      .from('tasks')
      .update({
        is_completed: newCompletedState,
        completed_at: newCompletedState ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      isRecurring: data.is_recurring,
      recurringPattern: data.recurring_pattern,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedTask, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to toggle task completion' }
  }
}
