import { supabase } from '../supabase'
import { Habit, HabitRecord } from '@/types'
import { authService } from '../auth'

export async function createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'records'>): Promise<{ data: Habit | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habitData.name,
        description: habitData.description,
        category: habitData.category,
        target: habitData.target,
        unit: habitData.unit,
        frequency: habitData.frequency,
        color: habitData.color,
        is_active: habitData.isActive
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedHabit: Habit = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      target: data.target,
      unit: data.unit,
      frequency: data.frequency,
      color: data.color,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      records: []
    }

    return { data: transformedHabit, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create habit' }
  }
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<{ data: Habit | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.target !== undefined) updateData.target = updates.target
    if (updates.unit !== undefined) updateData.unit = updates.unit
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('habits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Fetch habit with records
    const habitWithRecords = await getHabitWithRecords(id)
    return { data: habitWithRecords, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update habit' }
  }
}

export async function deleteHabit(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete habit' }
  }
}

export async function getUserHabits(): Promise<{ data: Habit[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: habits, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_records (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedHabits: Habit[] = habits.map(habit => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      target: habit.target,
      unit: habit.unit,
      frequency: habit.frequency,
      color: habit.color,
      isActive: habit.is_active,
      createdAt: new Date(habit.created_at),
      records: habit.habit_records.map((record: any) => ({
        id: record.id,
        habitId: record.habit_id,
        date: new Date(record.date),
        value: record.value,
        isCompleted: record.is_completed,
        notes: record.notes
      }))
    }))

    return { data: transformedHabits, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch habits' }
  }
}

export async function logHabitProgress(habitId: string, recordData: Omit<HabitRecord, 'id' | 'habitId'>): Promise<{ data: HabitRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Check if habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single()

    if (habitError || !habit) {
      return { data: null, error: 'Habit not found or access denied' }
    }

    const { data, error } = await supabase
      .from('habit_records')
      .upsert({
        habit_id: habitId,
        date: recordData.date.toISOString().split('T')[0], // Store as date only
        value: recordData.value,
        is_completed: recordData.isCompleted,
        notes: recordData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: HabitRecord = {
      id: data.id,
      habitId: data.habit_id,
      date: new Date(data.date),
      value: data.value,
      isCompleted: data.is_completed,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to log habit progress' }
  }
}

export async function getHabitRecords(habitId: string, startDate?: Date, endDate?: Date): Promise<{ data: HabitRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    // Check if habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single()

    if (habitError || !habit) {
      return { data: [], error: 'Habit not found or access denied' }
    }

    let query = supabase
      .from('habit_records')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0])
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0])
    }

    const { data: records, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: HabitRecord[] = records.map(record => ({
      id: record.id,
      habitId: record.habit_id,
      date: new Date(record.date),
      value: record.value,
      isCompleted: record.is_completed,
      notes: record.notes
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch habit records' }
  }
}

async function getHabitWithRecords(habitId: string): Promise<Habit | null> {
  try {
    const { data: habit, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_records (*)
      `)
      .eq('id', habitId)
      .single()

    if (error || !habit) return null

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      target: habit.target,
      unit: habit.unit,
      frequency: habit.frequency,
      color: habit.color,
      isActive: habit.is_active,
      createdAt: new Date(habit.created_at),
      records: habit.habit_records.map((record: any) => ({
        id: record.id,
        habitId: record.habit_id,
        date: new Date(record.date),
        value: record.value,
        isCompleted: record.is_completed,
        notes: record.notes
      }))
    }
  } catch (error) {
    return null
  }
}
