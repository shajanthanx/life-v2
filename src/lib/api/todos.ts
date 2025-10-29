import { supabase } from '../supabase'
import { Todo } from '@/types'
import { authService } from '../auth'

export async function createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Todo | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        due_date: todoData.dueDate?.toISOString().split('T')[0],
        is_completed: todoData.isCompleted,
        completed_at: todoData.completedAt?.toISOString(),
        notes: todoData.notes,
        position: todoData.position
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTodo: Todo = {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
      position: data.position,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedTodo, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create todo' }
  }
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<{ data: Todo | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString().split('T')[0]
    if (updates.isCompleted !== undefined) {
      updateData.is_completed = updates.isCompleted
      updateData.completed_at = updates.isCompleted ? new Date().toISOString() : null
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.position !== undefined) updateData.position = updates.position

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Handle checklist items if provided
    if (updates.checklistItems !== undefined) {
      // Get existing checklist items from database
      const { data: existingItems } = await supabase
        .from('todo_checklist_items')
        .select('*')
        .eq('todo_id', id)

      const existingItemsMap = new Map((existingItems || []).map(item => [item.id, item]))
      const updatedItemIds = new Set<string>()

      // Process each checklist item from the update
      for (const item of updates.checklistItems) {
        if (item.id.startsWith('temp-')) {
          // Create new item - explicitly generate UUID using crypto
          const newId = crypto.randomUUID()
          await supabase
            .from('todo_checklist_items')
            .insert({
              id: newId,
              todo_id: id,
              content: item.content,
              is_completed: item.isCompleted,
              position: item.position
            })
        } else {
          // Update existing item
          updatedItemIds.add(item.id)
          await supabase
            .from('todo_checklist_items')
            .update({
              content: item.content,
              is_completed: item.isCompleted,
              position: item.position,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
        }
      }

      // Delete items that were removed
      for (const existingItem of existingItems || []) {
        if (!updatedItemIds.has(existingItem.id) && !updates.checklistItems.some(i => i.id === existingItem.id)) {
          await supabase
            .from('todo_checklist_items')
            .delete()
            .eq('id', existingItem.id)
        }
      }
    }

    const transformedTodo: Todo = {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
      position: data.position,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      checklistItems: updates.checklistItems
    }

    return { data: transformedTodo, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update todo' }
  }
}

export async function deleteTodo(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete todo' }
  }
}

export async function getUserTodos(): Promise<{ data: Todo[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    // Fetch checklist items for all todos
    const todoIds = todos.map(t => t.id)
    const { data: checklistItems, error: checklistError } = await supabase
      .from('todo_checklist_items')
      .select('*')
      .in('todo_id', todoIds)
      .order('position', { ascending: true })

    if (checklistError) {
      console.error('Error loading checklist items:', checklistError)
    }

    // Create a map of checklist items by todo_id
    const checklistMap = new Map<string, any[]>()
    if (checklistItems) {
      checklistItems.forEach(item => {
        if (!checklistMap.has(item.todo_id)) {
          checklistMap.set(item.todo_id, [])
        }
        checklistMap.get(item.todo_id)!.push(item)
      })
    }

    const transformedTodos: Todo[] = todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
      isCompleted: todo.is_completed,
      completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
      notes: todo.notes,
      position: todo.position,
      createdAt: new Date(todo.created_at),
      updatedAt: new Date(todo.updated_at),
      checklistItems: (checklistMap.get(todo.id) || []).map(item => ({
        id: item.id,
        todoId: item.todo_id,
        content: item.content,
        isCompleted: item.is_completed,
        position: item.position,
        createdAt: new Date(item.created_at)
      }))
    }))

    return { data: transformedTodos, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch todos' }
  }
}

export async function toggleTodoCompletion(id: string): Promise<{ data: Todo | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // First get the current todo state
    const { data: currentTodo, error: fetchError } = await supabase
      .from('todos')
      .select('is_completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    const newCompletedState = !currentTodo.is_completed

    const { data, error } = await supabase
      .from('todos')
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

    const transformedTodo: Todo = {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
      position: data.position,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedTodo, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to toggle todo completion' }
  }
}

export async function clearCompletedTodos(): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('user_id', userId)
      .eq('is_completed', true)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to clear completed todos' }
  }
}

export async function reorderTodos(todoIds: string[]): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update position for each todo
    const updates = todoIds.map((id, index) =>
      supabase
        .from('todos')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
    )

    await Promise.all(updates)

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to reorder todos' }
  }
}
