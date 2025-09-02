import { supabase } from '../supabase'
import { SleepRecord, ExerciseRecord, NutritionRecord } from '@/types'
import { authService } from '../auth'

// Sleep Records API
export async function createSleepRecord(recordData: Omit<SleepRecord, 'id'>): Promise<{ data: SleepRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('sleep_records')
      .insert({
        user_id: userId,
        date: recordData.date.toISOString().split('T')[0],
        bedtime: recordData.bedtime.toISOString(),
        wake_time: recordData.wakeTime.toISOString(),
        hours_slept: recordData.hoursSlept,
        quality: recordData.quality,
        notes: recordData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: SleepRecord = {
      id: data.id,
      date: new Date(data.date),
      bedtime: new Date(data.bedtime),
      wakeTime: new Date(data.wake_time),
      hoursSlept: data.hours_slept,
      quality: data.quality,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create sleep record' }
  }
}

export async function updateSleepRecord(id: string, updates: Partial<SleepRecord>): Promise<{ data: SleepRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.bedtime !== undefined) updateData.bedtime = updates.bedtime.toISOString()
    if (updates.wakeTime !== undefined) updateData.wake_time = updates.wakeTime.toISOString()
    if (updates.hoursSlept !== undefined) updateData.hours_slept = updates.hoursSlept
    if (updates.quality !== undefined) updateData.quality = updates.quality
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('sleep_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: SleepRecord = {
      id: data.id,
      date: new Date(data.date),
      bedtime: new Date(data.bedtime),
      wakeTime: new Date(data.wake_time),
      hoursSlept: data.hours_slept,
      quality: data.quality,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update sleep record' }
  }
}

export async function deleteSleepRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('sleep_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete sleep record' }
  }
}

export async function getUserSleepRecords(): Promise<{ data: SleepRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: records, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: SleepRecord[] = records.map(record => ({
      id: record.id,
      date: new Date(record.date),
      bedtime: new Date(record.bedtime),
      wakeTime: new Date(record.wake_time),
      hoursSlept: record.hours_slept,
      quality: record.quality,
      notes: record.notes
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch sleep records' }
  }
}

// Exercise Records API
export async function createExerciseRecord(recordData: Omit<ExerciseRecord, 'id'>): Promise<{ data: ExerciseRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('exercise_records')
      .insert({
        user_id: userId,
        date: recordData.date.toISOString().split('T')[0],
        type: recordData.type,
        duration: recordData.duration,
        intensity: recordData.intensity,
        calories: recordData.calories,
        notes: recordData.notes,
        image_url: recordData.image
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: ExerciseRecord = {
      id: data.id,
      date: new Date(data.date),
      type: data.type,
      duration: data.duration,
      intensity: data.intensity,
      calories: data.calories,
      notes: data.notes,
      image: data.image_url
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create exercise record' }
  }
}

export async function updateExerciseRecord(id: string, updates: Partial<ExerciseRecord>): Promise<{ data: ExerciseRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.duration !== undefined) updateData.duration = updates.duration
    if (updates.intensity !== undefined) updateData.intensity = updates.intensity
    if (updates.calories !== undefined) updateData.calories = updates.calories
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.image !== undefined) updateData.image_url = updates.image

    const { data, error } = await supabase
      .from('exercise_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: ExerciseRecord = {
      id: data.id,
      date: new Date(data.date),
      type: data.type,
      duration: data.duration,
      intensity: data.intensity,
      calories: data.calories,
      notes: data.notes,
      image: data.image_url
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update exercise record' }
  }
}

export async function deleteExerciseRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('exercise_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete exercise record' }
  }
}

export async function getUserExerciseRecords(): Promise<{ data: ExerciseRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: records, error } = await supabase
      .from('exercise_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: ExerciseRecord[] = records.map(record => ({
      id: record.id,
      date: new Date(record.date),
      type: record.type,
      duration: record.duration,
      intensity: record.intensity,
      calories: record.calories,
      notes: record.notes,
      image: record.image_url
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch exercise records' }
  }
}

// Nutrition Records API
export async function createNutritionRecord(recordData: Omit<NutritionRecord, 'id'>): Promise<{ data: NutritionRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('nutrition_records')
      .insert({
        user_id: userId,
        date: recordData.date.toISOString().split('T')[0],
        meal: recordData.meal,
        food: recordData.food,
        calories: recordData.calories,
        notes: recordData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: NutritionRecord = {
      id: data.id,
      date: new Date(data.date),
      meal: data.meal,
      food: data.food,
      calories: data.calories,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create nutrition record' }
  }
}

export async function updateNutritionRecord(id: string, updates: Partial<NutritionRecord>): Promise<{ data: NutritionRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.meal !== undefined) updateData.meal = updates.meal
    if (updates.food !== undefined) updateData.food = updates.food
    if (updates.calories !== undefined) updateData.calories = updates.calories
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('nutrition_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: NutritionRecord = {
      id: data.id,
      date: new Date(data.date),
      meal: data.meal,
      food: data.food,
      calories: data.calories,
      notes: data.notes
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update nutrition record' }
  }
}

export async function deleteNutritionRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('nutrition_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete nutrition record' }
  }
}

export async function getUserNutritionRecords(): Promise<{ data: NutritionRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: records, error } = await supabase
      .from('nutrition_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: NutritionRecord[] = records.map(record => ({
      id: record.id,
      date: new Date(record.date),
      meal: record.meal,
      food: record.food,
      calories: record.calories,
      notes: record.notes
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch nutrition records' }
  }
}
