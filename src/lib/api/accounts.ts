import { supabase } from '../supabase'
import { authService } from '../auth'

export interface UserAccount {
  id: string
  userId: string
  name: string
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'cash' | 'crypto' | 'other'
  balance: number
  currency: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function createUserAccount(accountData: Omit<UserAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ data: UserAccount | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('user_accounts')
      .insert({
        user_id: userId,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance || 0,
        currency: accountData.currency || 'USD',
        description: accountData.description,
        is_active: accountData.isActive
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedAccount: UserAccount = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      currency: data.currency,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedAccount, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create account' }
  }
}

export async function updateUserAccount(id: string, updates: Partial<UserAccount>): Promise<{ data: UserAccount | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.balance !== undefined) updateData.balance = updates.balance
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('user_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedAccount: UserAccount = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      currency: data.currency,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedAccount, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update account' }
  }
}

export async function deleteUserAccount(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete account' }
  }
}

export async function getUserAccounts(): Promise<{ data: UserAccount[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: accounts, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedAccounts: UserAccount[] = accounts.map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      description: account.description,
      isActive: account.is_active,
      createdAt: new Date(account.created_at),
      updatedAt: new Date(account.updated_at)
    }))

    return { data: transformedAccounts, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch accounts' }
  }
}

export async function updateAccountBalance(id: string, amount: number, operation: 'add' | 'subtract' | 'set'): Promise<{ data: UserAccount | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // First get the current account
    const { data: currentAccount, error: fetchError } = await supabase
      .from('user_accounts')
      .select('balance')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    let newBalance: number
    switch (operation) {
      case 'add':
        newBalance = currentAccount.balance + amount
        break
      case 'subtract':
        newBalance = currentAccount.balance - amount
        break
      case 'set':
        newBalance = amount
        break
      default:
        return { data: null, error: 'Invalid operation' }
    }

    const { data, error } = await supabase
      .from('user_accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedAccount: UserAccount = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      currency: data.currency,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }

    return { data: transformedAccount, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update account balance' }
  }
}

export async function createDefaultAccounts(): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user already has accounts
    const { data: existingAccounts } = await getUserAccounts()
    if (existingAccounts.length > 0) {
      return { success: true, error: null } // User already has accounts
    }

    const defaultAccounts = [
      { name: 'Main Checking', type: 'checking' as const, description: 'Primary checking account' },
      { name: 'Savings Account', type: 'savings' as const, description: 'Main savings account' },
      { name: 'Cash Wallet', type: 'cash' as const, description: 'Physical cash on hand' }
    ]

    for (const account of defaultAccounts) {
      await createUserAccount({
        ...account,
        balance: 0,
        currency: 'USD',
        isActive: true
      })
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to create default accounts' }
  }
}
