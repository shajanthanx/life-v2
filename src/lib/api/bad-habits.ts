import { supabase } from '../supabase'
import { BadHabit, BadHabitRecord } from '@/types'
import { authService } from '../auth'

export async function createBadHabit(habitData: Omit<BadHabit, 'id' | 'createdAt' | 'records'>): Promise<{ data: BadHabit | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('bad_habits')
      .insert({
        user_id: userId,
        name: habitData.name,
        description: habitData.description
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedHabit: BadHabit = {
      id: data.id,
      name: data.name,
      description: data.description,
      records: [],
      createdAt: new Date(data.created_at)
    }

    return { data: transformedHabit, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create bad habit' }
  }
}

export async function updateBadHabit(id: string, updates: Partial<BadHabit>): Promise<{ data: BadHabit | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description

    const { data, error } = await supabase
      .from('bad_habits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Fetch habit with records
    const habitWithRecords = await getBadHabitWithRecords(id)
    return { data: habitWithRecords, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update bad habit' }
  }
}

export async function deleteBadHabit(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('bad_habits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete bad habit' }
  }
}

export async function getUserBadHabits(): Promise<{ data: BadHabit[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: habits, error } = await supabase
      .from('bad_habits')
      .select(`
        *,
        bad_habit_records (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedHabits: BadHabit[] = habits.map(habit => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      createdAt: new Date(habit.created_at),
      records: habit.bad_habit_records.map((record: any) => ({
        id: record.id,
        habitId: record.habit_id,
        date: new Date(record.date),
        isOccurred: record.is_occurred,
        notes: record.notes
      }))
    }))

    return { data: transformedHabits, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch bad habits' }
  }
}

export async function logBadHabitOccurrence(habitId: string, recordData: Omit<BadHabitRecord, 'id' | 'habitId'>): Promise<{ data: BadHabitRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Check if habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('bad_habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single()

    if (habitError || !habit) {
      return { data: null, error: 'Bad habit not found or access denied' }
    }

    // Format date as local date string (YYYY-MM-DD) without timezone conversion
    const year = recordData.date.getFullYear()
    const month = String(recordData.date.getMonth() + 1).padStart(2, '0')
    const day = String(recordData.date.getDate()).padStart(2, '0')
    const localDateString = `${year}-${month}-${day}`

    const { data, error } = await supabase
      .from('bad_habit_records')
      .upsert({
        habit_id: habitId,
        date: localDateString, // Store as local date only (no timezone conversion)
        is_occurred: recordData.isOccurred,
        notes: recordData.notes
      }, {
        onConflict: 'habit_id,date'
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: BadHabitRecord = {
      id: data.id,
      habitId: data.habit_id,
      date: new Date(data.date),
      isOccurred: data.is_occurred,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to log bad habit occurrence' }
  }
}

export async function getBadHabitRecords(habitId: string, startDate?: Date, endDate?: Date): Promise<{ data: BadHabitRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    // Check if habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('bad_habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single()

    if (habitError || !habit) {
      return { data: [], error: 'Bad habit not found or access denied' }
    }

    let query = supabase
      .from('bad_habit_records')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })

    if (startDate) {
      const startYear = startDate.getFullYear()
      const startMonth = String(startDate.getMonth() + 1).padStart(2, '0')
      const startDay = String(startDate.getDate()).padStart(2, '0')
      const startDateString = `${startYear}-${startMonth}-${startDay}`
      query = query.gte('date', startDateString)
    }

    if (endDate) {
      const endYear = endDate.getFullYear()
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
      const endDay = String(endDate.getDate()).padStart(2, '0')
      const endDateString = `${endYear}-${endMonth}-${endDay}`
      query = query.lte('date', endDateString)
    }

    const { data: records, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: BadHabitRecord[] = records.map(record => ({
      id: record.id,
      habitId: record.habit_id,
      date: new Date(record.date),
      isOccurred: record.is_occurred || record.count > 0, // Handle both old and new schema
      notes: record.notes
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch bad habit records' }
  }
}

export async function updateBadHabitRecord(id: string, updates: Partial<BadHabitRecord>): Promise<{ data: BadHabitRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.date !== undefined) {
      const year = updates.date.getFullYear()
      const month = String(updates.date.getMonth() + 1).padStart(2, '0')
      const day = String(updates.date.getDate()).padStart(2, '0')
      updateData.date = `${year}-${month}-${day}`
    }
    if (updates.isOccurred !== undefined) updateData.is_occurred = updates.isOccurred
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('bad_habit_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: BadHabitRecord = {
      id: data.id,
      habitId: data.habit_id,
      date: new Date(data.date),
      isOccurred: data.is_occurred,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update bad habit record' }
  }
}

export async function deleteBadHabitRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('bad_habit_records')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete bad habit record' }
  }
}

async function getBadHabitWithRecords(habitId: string): Promise<BadHabit | null> {
  try {
    const { data: habit, error } = await supabase
      .from('bad_habits')
      .select(`
        *,
        bad_habit_records (*)
      `)
      .eq('id', habitId)
      .single()

    if (error || !habit) return null

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      createdAt: new Date(habit.created_at),
      records: habit.bad_habit_records.map((record: any) => ({
        id: record.id,
        habitId: record.habit_id,
        date: new Date(record.date),
        isOccurred: record.is_occurred,
        notes: record.notes
      }))
    }
  } catch (error) {
    return null
  }
}
