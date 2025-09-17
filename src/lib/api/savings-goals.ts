import { supabase } from '../supabase'
import { SavingsGoal } from '@/types'
import { authService } from '../auth'

export async function createSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<{ data: SavingsGoal | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const insertData: any = {
      user_id: userId,
      name: goalData.name,
      target_amount: goalData.targetAmount,
      current_amount: goalData.currentAmount || 0,
      is_completed: goalData.isCompleted || false
    }

    // Add optional fields if provided
    if (goalData.targetDate) {
      insertData.target_date = goalData.targetDate.toISOString().split('T')[0]
    }
    if (goalData.description) {
      insertData.description = goalData.description
    }
    if (goalData.account) {
      insertData.account = goalData.account
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGoal: SavingsGoal = {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      description: data.description,
      account: data.account,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGoal, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create savings goal' }
  }
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<{ data: SavingsGoal | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) {
      updateData.current_amount = updates.currentAmount
      // Check if goal should be marked complete
      if (updates.targetAmount && updates.currentAmount >= updates.targetAmount) {
        updateData.is_completed = true
      }
    }
    if (updates.targetDate !== undefined) {
      updateData.target_date = updates.targetDate ? updates.targetDate.toISOString().split('T')[0] : null
    }
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.account !== undefined) updateData.account = updates.account
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted

    const { data, error } = await supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGoal: SavingsGoal = {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      description: data.description,
      account: data.account,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGoal, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update savings goal' }
  }
}

export async function deleteSavingsGoal(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete savings goal' }
  }
}

export async function getUserSavingsGoals(): Promise<{ data: SavingsGoal[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: goals, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedGoals: SavingsGoal[] = goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      targetDate: goal.target_date ? new Date(goal.target_date) : undefined,
      description: goal.description,
      account: goal.account,
      isCompleted: goal.is_completed,
      createdAt: new Date(goal.created_at)
    }))

    return { data: transformedGoals, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch savings goals' }
  }
}

export async function addToSavingsGoal(id: string, amount: number): Promise<{ data: SavingsGoal | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // First get the current goal
    const { data: currentGoal, error: fetchError } = await supabase
      .from('savings_goals')
      .select('current_amount, target_amount')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    const newAmount = currentGoal.current_amount + amount
    const isCompleted = newAmount >= currentGoal.target_amount

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newAmount,
        is_completed: isCompleted
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGoal: SavingsGoal = {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      description: data.description,
      account: data.account,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGoal, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to add to savings goal' }
  }
}
