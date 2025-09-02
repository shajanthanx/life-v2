import { supabase } from '../supabase'
import { JournalEntry } from '@/types'
import { authService } from '../auth'

export async function createJournalEntry(entryData: Omit<JournalEntry, 'id'>): Promise<{ data: JournalEntry | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        date: entryData.date.toISOString().split('T')[0],
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        tags: entryData.tags,
        image_url: entryData.image
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEntry: JournalEntry = {
      id: data.id,
      date: new Date(data.date),
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      image: data.image_url
    }

    return { data: transformedEntry, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create journal entry' }
  }
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<{ data: JournalEntry | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.mood !== undefined) updateData.mood = updates.mood
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.image !== undefined) updateData.image_url = updates.image
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEntry: JournalEntry = {
      id: data.id,
      date: new Date(data.date),
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      image: data.image_url
    }

    return { data: transformedEntry, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update journal entry' }
  }
}

export async function deleteJournalEntry(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete journal entry' }
  }
}

export async function getUserJournalEntries(): Promise<{ data: JournalEntry[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedEntries: JournalEntry[] = entries.map(entry => ({
      id: entry.id,
      date: new Date(entry.date),
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      image: entry.image_url
    }))

    return { data: transformedEntries, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch journal entries' }
  }
}
