import { supabase } from '../supabase'
import { TodoChecklistItem } from '@/types'
import { authService } from '../auth'

export async function createChecklistItem(
  todoId: string,
  content: string,
  position: number
): Promise<{ data: TodoChecklistItem | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('todo_checklist_items')
      .insert({
        todo_id: todoId,
        content,
        position,
        is_completed: false
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedItem: TodoChecklistItem = {
      id: data.id,
      todoId: data.todo_id,
      content: data.content,
      isCompleted: data.is_completed,
      position: data.position,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedItem, error: null }
  } catch (error) {
    return { data: null, error: 'Failed to create checklist item' }
  }
}

export async function updateChecklistItem(
  id: string,
  updates: Partial<Pick<TodoChecklistItem, 'content' | 'isCompleted' | 'position'>>
): Promise<{ data: TodoChecklistItem | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted
    if (updates.position !== undefined) updateData.position = updates.position

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('todo_checklist_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedItem: TodoChecklistItem = {
      id: data.id,
      todoId: data.todo_id,
      content: data.content,
      isCompleted: data.is_completed,
      position: data.position,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedItem, error: null }
  } catch (error) {
    return { data: null, error: 'Failed to update checklist item' }
  }
}

export async function deleteChecklistItem(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('todo_checklist_items')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to delete checklist item' }
  }
}

export async function getChecklistItemsByTodoId(todoId: string): Promise<{ data: TodoChecklistItem[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: items, error } = await supabase
      .from('todo_checklist_items')
      .select('*')
      .eq('todo_id', todoId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedItems: TodoChecklistItem[] = items.map(item => ({
      id: item.id,
      todoId: item.todo_id,
      content: item.content,
      isCompleted: item.is_completed,
      position: item.position,
      createdAt: new Date(item.created_at)
    }))

    return { data: transformedItems, error: null }
  } catch (error) {
    return { data: [], error: 'Failed to fetch checklist items' }
  }
}

export async function toggleChecklistItemCompletion(id: string): Promise<{ data: TodoChecklistItem | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // First get the current state
    const { data: currentItem, error: fetchError } = await supabase
      .from('todo_checklist_items')
      .select('is_completed')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    const newCompletedState = !currentItem.is_completed

    const { data, error } = await supabase
      .from('todo_checklist_items')
      .update({
        is_completed: newCompletedState,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedItem: TodoChecklistItem = {
      id: data.id,
      todoId: data.todo_id,
      content: data.content,
      isCompleted: data.is_completed,
      position: data.position,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedItem, error: null }
  } catch (error) {
    return { data: null, error: 'Failed to toggle checklist item' }
  }
}
