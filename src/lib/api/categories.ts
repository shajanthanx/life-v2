import { supabase } from '../supabase'
import { Category } from '@/types'
import { authService } from '../auth'

export async function createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<{ data: Category | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: categoryData.name,
        type: categoryData.type,
        is_default: categoryData.isDefault,
        icon: categoryData.icon,
        color: categoryData.color
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedCategory: Category = {
      id: data.id,
      name: data.name,
      type: data.type,
      isDefault: data.is_default,
      icon: data.icon,
      color: data.color,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedCategory, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault
    if (updates.icon !== undefined) updateData.icon = updates.icon
    if (updates.color !== undefined) updateData.color = updates.color

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedCategory: Category = {
      id: data.id,
      name: data.name,
      type: data.type,
      isDefault: data.is_default,
      icon: data.icon,
      color: data.color,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedCategory, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if category is in use by transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (transactionError) {
      return { success: false, error: transactionError.message }
    }

    if (transactions && transactions.length > 0) {
      return { success: false, error: 'Cannot delete category that is in use by transactions' }
    }

    // Check if category is in use by predefined expenses
    const { data: predefinedExpenses, error: expenseError } = await supabase
      .from('predefined_expenses')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (expenseError) {
      return { success: false, error: expenseError.message }
    }

    if (predefinedExpenses && predefinedExpenses.length > 0) {
      return { success: false, error: 'Cannot delete category that is in use by predefined expenses' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function getUserCategories(): Promise<{ data: Category[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedCategories: Category[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      type: category.type,
      isDefault: category.is_default,
      icon: category.icon,
      color: category.color,
      createdAt: new Date(category.created_at)
    }))

    return { data: transformedCategories, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch categories' }
  }
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<{ data: Category[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedCategories: Category[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      type: category.type,
      isDefault: category.is_default,
      icon: category.icon,
      color: category.color,
      createdAt: new Date(category.created_at)
    }))

    return { data: transformedCategories, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch categories' }
  }
}

export async function getCategory(id: string): Promise<{ data: Category | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedCategory: Category = {
      id: data.id,
      name: data.name,
      type: data.type,
      isDefault: data.is_default,
      icon: data.icon,
      color: data.color,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedCategory, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to fetch category' }
  }
}

export async function initializeUserCategories(): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user already has categories
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (checkError) {
      return { success: false, error: checkError.message }
    }

    if (existingCategories && existingCategories.length > 0) {
      return { success: true, error: null } // User already has categories
    }

    // Call the database function to create default categories
    const { error: functionError } = await supabase.rpc('create_default_categories', {
      user_uuid: userId
    })

    if (functionError) {
      return { success: false, error: functionError.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to initialize categories' }
  }
}

// Fallback function to create default categories manually
async function createDefaultCategoriesManually(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const defaultCategories = [
      // Expense categories
      { name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#ef4444' },
      { name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6' },
      { name: 'Housing', type: 'expense', icon: '🏠', color: '#8b5cf6' },
      { name: 'Utilities', type: 'expense', icon: '⚡', color: '#f59e0b' },
      { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#ec4899' },
      { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#6366f1' },
      { name: 'Other Expenses', type: 'expense', icon: '📝', color: '#6b7280' },
      
      // Income categories
      { name: 'Salary', type: 'income', icon: '💼', color: '#22c55e' },
      { name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6' },
      { name: 'Other Income', type: 'income', icon: '💰', color: '#6b7280' }
    ]

    for (const category of defaultCategories) {
      await supabase.from('categories').insert({
        user_id: userId,
        name: category.name,
        type: category.type,
        is_default: true,
        icon: category.icon,
        color: category.color
      })
    }

    return { success: true, error: null }
  } catch (error) {
    console.warn('Failed to create default categories manually')
    return { success: true, error: null } // Don't fail the app
  }
}

export async function getCategoryUsageStats(categoryId: string): Promise<{ 
  data: { 
    transactionCount: number; 
    totalAmount: number; 
    lastUsed?: Date;
    predefinedExpenseCount: number;
  } | null; 
  error: string | null 
}> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Verify category belongs to user
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single()

    if (categoryError || !category) {
      return { data: null, error: 'Category not found or access denied' }
    }

    // Get transaction stats
    const { data: transactionStats, error: transactionError } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('category_id', categoryId)
      .eq('user_id', userId)

    if (transactionError) {
      return { data: null, error: transactionError.message }
    }

    // Get predefined expense count
    const { count: predefinedCount, error: predefinedError } = await supabase
      .from('predefined_expenses')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('user_id', userId)

    if (predefinedError) {
      return { data: null, error: predefinedError.message }
    }

    const transactionCount = transactionStats?.length || 0
    const totalAmount = transactionStats?.reduce((sum, t) => sum + t.amount, 0) || 0
    const lastUsed = transactionStats && transactionStats.length > 0 
      ? new Date(Math.max(...transactionStats.map(t => new Date(t.date).getTime())))
      : undefined

    return {
      data: {
        transactionCount,
        totalAmount,
        lastUsed,
        predefinedExpenseCount: predefinedCount || 0
      },
      error: null
    }

  } catch (error) {
    return { data: null, error: 'Failed to fetch category usage stats' }
  }
}
