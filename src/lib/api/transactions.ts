import { supabase } from '../supabase'
import { Transaction } from '@/types'
import { authService } from '../auth'

export async function createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        date: transactionData.date.toISOString().split('T')[0],
        is_recurring: transactionData.isRecurring,
        recurring_pattern: transactionData.recurringPattern
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      isRecurring: data.is_recurring,
      recurringPattern: data.recurring_pattern
    }

    return { data: transformedTransaction, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create transaction' }
  }
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring
    if (updates.recurringPattern !== undefined) updateData.recurring_pattern = updates.recurringPattern

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      isRecurring: data.is_recurring,
      recurringPattern: data.recurring_pattern
    }

    return { data: transformedTransaction, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update transaction' }
  }
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete transaction' }
  }
}

export async function getUserTransactions(): Promise<{ data: Transaction[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedTransactions: Transaction[] = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date),
      isRecurring: transaction.is_recurring,
      recurringPattern: transaction.recurring_pattern
    }))

    return { data: transformedTransactions, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch transactions' }
  }
}
