import { supabase } from '../supabase'
import { PredefinedExpense } from '@/types'
import { authService } from '../auth'

export async function createPredefinedExpense(expenseData: Omit<PredefinedExpense, 'id' | 'createdAt'>): Promise<{ data: PredefinedExpense | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Verify the category belongs to the user
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', expenseData.categoryId)
      .eq('user_id', userId)
      .single()

    if (categoryError || !category) {
      return { data: null, error: 'Category not found or access denied' }
    }

    const { data, error } = await supabase
      .from('predefined_expenses')
      .insert({
        user_id: userId,
        name: expenseData.name,
        category_id: expenseData.categoryId,
        amount: expenseData.amount,
        frequency: expenseData.frequency,
        next_due: expenseData.nextDue?.toISOString().split('T')[0],
        is_active: expenseData.isActive,
        description: expenseData.description,
        auto_add: expenseData.autoAdd
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedExpense: PredefinedExpense = {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      amount: data.amount,
      frequency: data.frequency,
      nextDue: data.next_due ? new Date(data.next_due) : undefined,
      isActive: data.is_active,
      description: data.description,
      autoAdd: data.auto_add,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedExpense, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create predefined expense' }
  }
}

export async function updatePredefinedExpense(id: string, updates: Partial<PredefinedExpense>): Promise<{ data: PredefinedExpense | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // If updating categoryId, verify it belongs to the user
    if (updates.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', updates.categoryId)
        .eq('user_id', userId)
        .single()

      if (categoryError || !category) {
        return { data: null, error: 'Category not found or access denied' }
      }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.nextDue !== undefined) updateData.next_due = updates.nextDue?.toISOString().split('T')[0]
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.autoAdd !== undefined) updateData.auto_add = updates.autoAdd

    const { data, error } = await supabase
      .from('predefined_expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedExpense: PredefinedExpense = {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      amount: data.amount,
      frequency: data.frequency,
      nextDue: data.next_due ? new Date(data.next_due) : undefined,
      isActive: data.is_active,
      description: data.description,
      autoAdd: data.auto_add,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedExpense, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update predefined expense' }
  }
}

export async function deletePredefinedExpense(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('predefined_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete predefined expense' }
  }
}

export async function getUserPredefinedExpenses(): Promise<{ data: PredefinedExpense[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: expenses, error } = await supabase
      .from('predefined_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedExpenses: PredefinedExpense[] = expenses.map(expense => ({
      id: expense.id,
      name: expense.name,
      categoryId: expense.category_id,
      amount: expense.amount,
      frequency: expense.frequency,
      nextDue: expense.next_due ? new Date(expense.next_due) : undefined,
      isActive: expense.is_active,
      description: expense.description,
      autoAdd: expense.auto_add,
      createdAt: new Date(expense.created_at)
    }))

    return { data: transformedExpenses, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch predefined expenses' }
  }
}

export async function getActivePredefinedExpenses(): Promise<{ data: PredefinedExpense[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: expenses, error } = await supabase
      .from('predefined_expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedExpenses: PredefinedExpense[] = expenses.map(expense => ({
      id: expense.id,
      name: expense.name,
      categoryId: expense.category_id,
      amount: expense.amount,
      frequency: expense.frequency,
      nextDue: expense.next_due ? new Date(expense.next_due) : undefined,
      isActive: expense.is_active,
      description: expense.description,
      autoAdd: expense.auto_add,
      createdAt: new Date(expense.created_at)
    }))

    return { data: transformedExpenses, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch active predefined expenses' }
  }
}

export async function getDuePredefinedExpenses(): Promise<{ data: PredefinedExpense[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: expenses, error } = await supabase
      .from('predefined_expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_due', today)
      .order('next_due', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedExpenses: PredefinedExpense[] = expenses.map(expense => ({
      id: expense.id,
      name: expense.name,
      categoryId: expense.category_id,
      amount: expense.amount,
      frequency: expense.frequency,
      nextDue: expense.next_due ? new Date(expense.next_due) : undefined,
      isActive: expense.is_active,
      description: expense.description,
      autoAdd: expense.auto_add,
      createdAt: new Date(expense.created_at)
    }))

    return { data: transformedExpenses, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch due predefined expenses' }
  }
}

export async function addPredefinedExpenseToTransactions(id: string, customAmount?: number): Promise<{ success: boolean; transactionId?: string; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the predefined expense
    const { data: expense, error: expenseError } = await supabase
      .from('predefined_expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (expenseError || !expense) {
      return { success: false, error: 'Predefined expense not found' }
    }

    const amount = customAmount || expense.amount

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'expense',
        amount: amount,
        category_id: expense.category_id,
        description: expense.name,
        date: new Date().toISOString().split('T')[0],
        is_recurring: true,
        recurring_pattern: expense.frequency === 'weekly' ? 'weekly' : 'monthly'
      })
      .select()
      .single()

    if (transactionError) {
      return { success: false, error: transactionError.message }
    }

    // Update next due date
    let nextDue: Date
    const currentDue = expense.next_due ? new Date(expense.next_due) : new Date()
    
    switch (expense.frequency) {
      case 'weekly':
        nextDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        nextDue = new Date(currentDue.getFullYear(), currentDue.getMonth() + 1, currentDue.getDate())
        break
      case 'yearly':
        nextDue = new Date(currentDue.getFullYear() + 1, currentDue.getMonth(), currentDue.getDate())
        break
      default:
        nextDue = currentDue
    }

    // Update the predefined expense
    const { error: updateError } = await supabase
      .from('predefined_expenses')
      .update({ next_due: nextDue.toISOString().split('T')[0] })
      .eq('id', id)
      .eq('user_id', userId)

    if (updateError) {
      console.warn('Failed to update next due date:', updateError.message)
    }

    return { success: true, transactionId: transaction.id, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to add predefined expense to transactions' }
  }
}

export async function processDueExpenses(): Promise<{ processed: number; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { processed: 0, error: 'Not authenticated' }
    }

    // Get all due auto-add expenses
    const { data: dueExpenses, error: fetchError } = await supabase
      .from('predefined_expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('auto_add', true)
      .lte('next_due', new Date().toISOString().split('T')[0])

    if (fetchError) {
      return { processed: 0, error: fetchError.message }
    }

    let processed = 0

    for (const expense of dueExpenses || []) {
      const result = await addPredefinedExpenseToTransactions(expense.id)
      if (result.success) {
        processed++
      }
    }

    return { processed, error: null }

  } catch (error) {
    return { processed: 0, error: 'Failed to process due expenses' }
  }
}

export async function togglePredefinedExpenseStatus(id: string): Promise<{ data: PredefinedExpense | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Get current status
    const { data: current, error: fetchError } = await supabase
      .from('predefined_expenses')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !current) {
      return { data: null, error: 'Predefined expense not found' }
    }

    // Toggle status
    const { data, error } = await supabase
      .from('predefined_expenses')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedExpense: PredefinedExpense = {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      amount: data.amount,
      frequency: data.frequency,
      nextDue: data.next_due ? new Date(data.next_due) : undefined,
      isActive: data.is_active,
      description: data.description,
      autoAdd: data.auto_add,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedExpense, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to toggle predefined expense status' }
  }
}
