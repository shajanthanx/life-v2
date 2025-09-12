import { supabase } from '../supabase'
import { Transaction } from '@/types'
import { authService } from '../auth'

export async function createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Validate categoryId if provided
    if (transactionData.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', transactionData.categoryId)
        .eq('user_id', userId)
        .single()

      if (categoryError || !category) {
        return { data: null, error: 'Category not found or access denied' }
      }
    }

    const insertData: any = {
      user_id: userId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      date: transactionData.date.toISOString().split('T')[0],
      is_recurring: transactionData.isRecurring,
      recurring_pattern: transactionData.recurringPattern
    }

    // Post-migration: Use new schema with categoryId as primary
    if (transactionData.categoryId && transactionData.categoryId.trim() !== '') {
      // Primary approach: use categoryId
      insertData.category_id = transactionData.categoryId
      
      // Also set category name for legacy compatibility
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', transactionData.categoryId)
        .eq('user_id', userId)
        .single()
      
      insertData.category = category?.name || 'Unknown'
    } else if (transactionData.category) {
      // Legacy support: find or create category from text
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', transactionData.category)
        .eq('type', transactionData.type)
        .single()

      if (existingCategory) {
        insertData.category_id = existingCategory.id
        insertData.category = transactionData.category
      } else {
        // Create new category from legacy text
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            user_id: userId,
            name: transactionData.category,
            type: transactionData.type,
            is_default: false,
            icon: transactionData.type === 'income' ? '💰' : '📝',
            color: transactionData.type === 'income' ? '#22c55e' : '#6b7280'
          })
          .select('id')
          .single()

        insertData.category_id = newCategory?.id
        insertData.category = transactionData.category
      }
    } else {
      // No category provided - use default "Other" category
      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', transactionData.type === 'income' ? 'Other Income' : 'Other Expenses')
        .eq('type', transactionData.type)
        .single()

      insertData.category_id = defaultCategory?.id
      insertData.category = transactionData.type === 'income' ? 'Other Income' : 'Other Expenses'
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          icon,
          color
        )
      `)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      category: data.category || data.categories?.name,
      categoryId: data.category_id,
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

    // Validate categoryId if provided
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
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0]
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring
    if (updates.recurringPattern !== undefined) updateData.recurring_pattern = updates.recurringPattern

    // Handle category updates with new schema
    if (updates.categoryId !== undefined && updates.categoryId.trim() !== '') {
      // Primary approach: use categoryId
      updateData.category_id = updates.categoryId
      
      // Also update category name for legacy compatibility
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', updates.categoryId)
        .eq('user_id', userId)
        .single()
      
      updateData.category = category?.name || 'Unknown'
    } else if (updates.category !== undefined) {
      // Legacy support: find or create category from text
      const transactionType = updates.type || 'expense' // Default to expense if type not provided
      
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', updates.category)
        .eq('type', transactionType)
        .single()

      if (existingCategory) {
        updateData.category_id = existingCategory.id
        updateData.category = updates.category
      } else {
        // Create new category from legacy text
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            user_id: userId,
            name: updates.category,
            type: transactionType,
            is_default: false,
            icon: transactionType === 'income' ? '💰' : '📝',
            color: transactionType === 'income' ? '#22c55e' : '#6b7280'
          })
          .select('id')
          .single()

        updateData.category_id = newCategory?.id
        updateData.category = updates.category
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          icon,
          color
        )
      `)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      category: data.category || data.categories?.name,
      categoryId: data.category_id,
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
      .select(`
        *,
        categories (
          id,
          name,
          type,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedTransactions: Transaction[] = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || transaction.categories?.name,
      categoryId: transaction.category_id,
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

// New function to get transactions with enhanced category information
export async function getTransactionsWithCategories(): Promise<{ 
  data: (Transaction & { categoryInfo?: { id: string; name: string; type: string; icon?: string; color?: string } })[]; 
  error: string | null 
}> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || transaction.categories?.name,
      categoryId: transaction.category_id,
      description: transaction.description,
      date: new Date(transaction.date),
      isRecurring: transaction.is_recurring,
      recurringPattern: transaction.recurring_pattern,
      categoryInfo: transaction.categories ? {
        id: transaction.categories.id,
        name: transaction.categories.name,
        type: transaction.categories.type,
        icon: transaction.categories.icon,
        color: transaction.categories.color
      } : undefined
    }))

    return { data: transformedTransactions, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch transactions with categories' }
  }
}

// Function to get transactions by category
export async function getTransactionsByCategory(categoryId: string): Promise<{ data: Transaction[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    // Verify category belongs to user
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single()

    if (categoryError || !category) {
      return { data: [], error: 'Category not found or access denied' }
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedTransactions: Transaction[] = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || transaction.categories?.name,
      categoryId: transaction.category_id,
      description: transaction.description,
      date: new Date(transaction.date),
      isRecurring: transaction.is_recurring,
      recurringPattern: transaction.recurring_pattern
    }))

    return { data: transformedTransactions, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch transactions by category' }
  }
}
