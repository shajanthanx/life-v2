import { supabase } from '../supabase'
import { authService } from '../auth'

export interface Note {
  id: string
  content: string
  reminderDate?: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export async function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Note | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        content: noteData.content,
        reminder_date: noteData.reminderDate?.toISOString(),
        is_completed: noteData.isCompleted
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedNote: Note = {
      id: data.id,
      content: data.content,
      reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedNote, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create note' }
  }
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<{ data: Note | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.reminderDate !== undefined) updateData.reminder_date = updates.reminderDate?.toISOString()
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedNote: Note = {
      id: data.id,
      content: data.content,
      reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedNote, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update note' }
  }
}

export async function deleteNote(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete note' }
  }
}

export async function getUserNotes(): Promise<{ data: Note[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedNotes: Note[] = notes.map(note => ({
      id: note.id,
      content: note.content,
      reminderDate: note.reminder_date ? new Date(note.reminder_date) : undefined,
      isCompleted: note.is_completed,
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at)
    }))

    return { data: transformedNotes, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch notes' }
  }
}

export async function getNotesWithReminders(): Promise<{ data: Note[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .not('reminder_date', 'is', null)
      .eq('is_completed', false)
      .lte('reminder_date', new Date().toISOString())
      .order('reminder_date', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedNotes: Note[] = notes.map(note => ({
      id: note.id,
      content: note.content,
      reminderDate: note.reminder_date ? new Date(note.reminder_date) : undefined,
      isCompleted: note.is_completed,
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at)
    }))

    return { data: transformedNotes, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch reminder notes' }
  }
}
