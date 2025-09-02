import { supabase } from '../supabase'
import { IncomeSource, IncomeRecord } from '@/types'
import { authService } from '../auth'

// Income Sources API
export async function createIncomeSource(sourceData: Omit<IncomeSource, 'id' | 'createdAt'>): Promise<{ data: IncomeSource | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('income_sources')
      .insert({
        user_id: userId,
        name: sourceData.name,
        type: sourceData.type,
        amount: sourceData.amount,
        frequency: sourceData.frequency,
        next_pay_date: sourceData.nextPayDate?.toISOString(),
        is_active: sourceData.isActive,
        description: sourceData.description
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedSource: IncomeSource = {
      id: data.id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      frequency: data.frequency,
      nextPayDate: data.next_pay_date ? new Date(data.next_pay_date) : undefined,
      isActive: data.is_active,
      description: data.description,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedSource, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create income source' }
  }
}

export async function updateIncomeSource(id: string, updates: Partial<IncomeSource>): Promise<{ data: IncomeSource | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.nextPayDate !== undefined) updateData.next_pay_date = updates.nextPayDate?.toISOString()
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.description !== undefined) updateData.description = updates.description

    const { data, error } = await supabase
      .from('income_sources')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedSource: IncomeSource = {
      id: data.id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      frequency: data.frequency,
      nextPayDate: data.next_pay_date ? new Date(data.next_pay_date) : undefined,
      isActive: data.is_active,
      description: data.description,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedSource, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update income source' }
  }
}

export async function deleteIncomeSource(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete income source' }
  }
}

export async function getUserIncomeSources(): Promise<{ data: IncomeSource[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: sources, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedSources: IncomeSource[] = sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      amount: source.amount,
      frequency: source.frequency,
      nextPayDate: source.next_pay_date ? new Date(source.next_pay_date) : undefined,
      isActive: source.is_active,
      description: source.description,
      createdAt: new Date(source.created_at)
    }))

    return { data: transformedSources, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch income sources' }
  }
}

// Income Records API
export async function createIncomeRecord(recordData: Omit<IncomeRecord, 'id'>): Promise<{ data: IncomeRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Verify the income source belongs to the user
    const { data: source, error: sourceError } = await supabase
      .from('income_sources')
      .select('id')
      .eq('id', recordData.sourceId)
      .eq('user_id', userId)
      .single()

    if (sourceError || !source) {
      return { data: null, error: 'Income source not found or access denied' }
    }

    const { data, error } = await supabase
      .from('income_records')
      .insert({
        user_id: userId,
        source_id: recordData.sourceId,
        amount: recordData.amount,
        date: recordData.date.toISOString().split('T')[0],
        description: recordData.description,
        is_recurring: recordData.isRecurring
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: IncomeRecord = {
      id: data.id,
      sourceId: data.source_id,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      isRecurring: data.is_recurring
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create income record' }
  }
}

export async function updateIncomeRecord(id: string, updates: Partial<IncomeRecord>): Promise<{ data: IncomeRecord | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring

    const { data, error } = await supabase
      .from('income_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedRecord: IncomeRecord = {
      id: data.id,
      sourceId: data.source_id,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      isRecurring: data.is_recurring
    }

    return { data: transformedRecord, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update income record' }
  }
}

export async function deleteIncomeRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('income_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete income record' }
  }
}

export async function getUserIncomeRecords(): Promise<{ data: IncomeRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: records, error } = await supabase
      .from('income_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: IncomeRecord[] = records.map(record => ({
      id: record.id,
      sourceId: record.source_id,
      amount: record.amount,
      date: new Date(record.date),
      description: record.description,
      isRecurring: record.is_recurring
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch income records' }
  }
}

export async function getIncomeRecordsBySource(sourceId: string): Promise<{ data: IncomeRecord[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    // Verify the income source belongs to the user
    const { data: source, error: sourceError } = await supabase
      .from('income_sources')
      .select('id')
      .eq('id', sourceId)
      .eq('user_id', userId)
      .single()

    if (sourceError || !source) {
      return { data: [], error: 'Income source not found or access denied' }
    }

    const { data: records, error } = await supabase
      .from('income_records')
      .select('*')
      .eq('source_id', sourceId)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedRecords: IncomeRecord[] = records.map(record => ({
      id: record.id,
      sourceId: record.source_id,
      amount: record.amount,
      date: new Date(record.date),
      description: record.description,
      isRecurring: record.is_recurring
    }))

    return { data: transformedRecords, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch income records' }
  }
}
