import { supabase } from '../supabase'
import { Secret } from '@/types'
import { authService } from '../auth'

// Simple encryption/decryption functions (for demo - use proper encryption in production)
const ENCRYPTION_KEY = 'life-manager-secret-key-v1' // In production, use environment variable

function simpleEncrypt(text: string): string {
  // Simple base64 encoding for demo - use proper encryption in production
  return btoa(text)
}

function simpleDecrypt(encryptedText: string): string {
  try {
    return atob(encryptedText)
  } catch {
    return encryptedText // Return as-is if decryption fails
  }
}

export async function createSecret(secretData: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>): Promise<{ data: Secret | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('secrets')
      .insert({
        user_id: userId,
        title: secretData.title,
        type: secretData.type,
        website: secretData.website,
        username: secretData.username,
        password: simpleEncrypt(secretData.password), // Encrypt password
        notes: secretData.notes,
        custom_fields: secretData.customFields,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedSecret: Secret = {
      id: data.id,
      title: data.title,
      type: data.type,
      website: data.website,
      username: data.username,
      password: simpleDecrypt(data.password), // Decrypt for return
      notes: data.notes,
      customFields: data.custom_fields,
      createdAt: new Date(data.created_at),
      lastAccessed: new Date(data.last_accessed)
    }

    return { data: transformedSecret, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create secret' }
  }
}

export async function updateSecret(id: string, updates: Partial<Secret>): Promise<{ data: Secret | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.website !== undefined) updateData.website = updates.website
    if (updates.username !== undefined) updateData.username = updates.username
    if (updates.password !== undefined) updateData.password = simpleEncrypt(updates.password)
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.customFields !== undefined) updateData.custom_fields = updates.customFields

    // Always update last_accessed when updating
    updateData.last_accessed = new Date().toISOString()

    const { data, error } = await supabase
      .from('secrets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedSecret: Secret = {
      id: data.id,
      title: data.title,
      type: data.type,
      website: data.website,
      username: data.username,
      password: simpleDecrypt(data.password),
      notes: data.notes,
      customFields: data.custom_fields,
      createdAt: new Date(data.created_at),
      lastAccessed: new Date(data.last_accessed)
    }

    return { data: transformedSecret, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update secret' }
  }
}

export async function deleteSecret(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete secret' }
  }
}

export async function getUserSecrets(): Promise<{ data: Secret[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: secrets, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedSecrets: Secret[] = secrets.map(secret => ({
      id: secret.id,
      title: secret.title,
      type: secret.type,
      website: secret.website,
      username: secret.username,
      password: simpleDecrypt(secret.password),
      notes: secret.notes,
      customFields: secret.custom_fields,
      createdAt: new Date(secret.created_at),
      lastAccessed: new Date(secret.last_accessed)
    }))

    return { data: transformedSecrets, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch secrets' }
  }
}

export async function getSecretsByType(type: string): Promise<{ data: Secret[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: secrets, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedSecrets: Secret[] = secrets.map(secret => ({
      id: secret.id,
      title: secret.title,
      type: secret.type,
      website: secret.website,
      username: secret.username,
      password: simpleDecrypt(secret.password),
      notes: secret.notes,
      customFields: secret.custom_fields,
      createdAt: new Date(secret.created_at),
      lastAccessed: new Date(secret.last_accessed)
    }))

    return { data: transformedSecrets, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch secrets by type' }
  }
}

export async function updateSecretLastAccessed(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('secrets')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to update last accessed time' }
  }
}

export async function searchSecrets(searchTerm: string): Promise<{ data: Secret[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: secrets, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%, website.ilike.%${searchTerm}%, username.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedSecrets: Secret[] = secrets.map(secret => ({
      id: secret.id,
      title: secret.title,
      type: secret.type,
      website: secret.website,
      username: secret.username,
      password: simpleDecrypt(secret.password),
      notes: secret.notes,
      customFields: secret.custom_fields,
      createdAt: new Date(secret.created_at),
      lastAccessed: new Date(secret.last_accessed)
    }))

    return { data: transformedSecrets, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to search secrets' }
  }
}

export async function generatePassword(length: number = 16, includeSymbols: boolean = true): Promise<string> {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  let charset = lowercase + uppercase + numbers
  if (includeSymbols) {
    charset += symbols
  }
  
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

export async function exportSecrets(): Promise<{ data: any; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: secrets, error } = await getUserSecrets()
    
    if (error) {
      return { data: null, error }
    }

    // Create export data without passwords for security
    const exportData = {
      exportDate: new Date().toISOString(),
      totalSecrets: secrets.length,
      secrets: secrets.map(secret => ({
        title: secret.title,
        type: secret.type,
        website: secret.website,
        username: secret.username,
        notes: secret.notes,
        customFields: secret.customFields,
        createdAt: secret.createdAt
        // Password is intentionally excluded for security
      }))
    }

    return { data: exportData, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to export secrets' }
  }
}

export async function getSecretsStats(): Promise<{ data: any; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: secrets, error } = await getUserSecrets()
    
    if (error) {
      return { data: null, error }
    }

    const stats = {
      totalSecrets: secrets.length,
      secretsByType: secrets.reduce((acc: any, secret) => {
        acc[secret.type] = (acc[secret.type] || 0) + 1
        return acc
      }, {}),
      recentlyAccessed: secrets
        .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
        .slice(0, 5)
        .map(secret => ({
          id: secret.id,
          title: secret.title,
          type: secret.type,
          lastAccessed: secret.lastAccessed
        })),
      oldestSecrets: secrets
        .sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime())
        .slice(0, 5)
        .map(secret => ({
          id: secret.id,
          title: secret.title,
          type: secret.type,
          lastAccessed: secret.lastAccessed
        }))
    }

    return { data: stats, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to get secrets statistics' }
  }
}
