import { supabase } from '../supabase'
import { authService } from '../auth'

export interface UserSettings {
  modules: {
    enabled: string[]
  }
  notifications: {
    taskReminders: boolean
    habitReminders: boolean
    budgetAlerts: boolean
    goalDeadlines: boolean
    dailyReflection: boolean
    gratitudeReminder: boolean
  }
  preferences: {
    currency: string
    dateFormat: string
    weekStartsOn: string
    darkMode: boolean
    compactView: boolean
    showMotivationalQuotes: boolean
  }
  privacy: {
    dataAnalytics: boolean
    shareProgress: boolean
    publicProfile: boolean
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  modules: {
    enabled: [
      'goals', 'tasks', 'habits', 'notes', 'health', 
      'finance', 'lifestyle', 'visualization', 'gifts', 
      'memories', 'freelancing', 'secrets', 'analytics'
    ]
  },
  notifications: {
    taskReminders: true,
    habitReminders: true,
    budgetAlerts: true,
    goalDeadlines: true,
    dailyReflection: true,
    gratitudeReminder: true
  },
  preferences: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    weekStartsOn: 'Sunday',
    darkMode: false,
    compactView: false,
    showMotivationalQuotes: true
  },
  privacy: {
    dataAnalytics: false,
    shareProgress: false,
    publicProfile: false
  }
}

/**
 * Get user settings from database
 */
export async function getUserSettings(): Promise<{ data: UserSettings | null; error: string | null }> {
  try {
    const user = authService.getCurrentUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('settings_data')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default settings
        return { data: DEFAULT_SETTINGS, error: null }
      }
      console.error('Error fetching user settings:', error)
      return { data: null, error: error.message }
    }

    return { data: data.settings_data as UserSettings, error: null }
  } catch (error) {
    console.error('Unexpected error fetching user settings:', error)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Save user settings to database
 */
export async function saveUserSettings(settings: UserSettings): Promise<{ error: string | null }> {
  try {
    const user = authService.getCurrentUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }

    // First try to update existing settings
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        settings_data: settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      // If update fails, try to insert new record
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          settings_data: settings
        })

      if (insertError) {
        console.error('Error saving user settings:', insertError)
        return { error: insertError.message }
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error saving user settings:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Get only enabled modules for a user
 */
export async function getEnabledModules(): Promise<{ data: string[] | null; error: string | null }> {
  try {
    const { data: settings, error } = await getUserSettings()
    
    if (error) {
      return { data: null, error }
    }

    return { data: settings?.modules.enabled || [], error: null }
  } catch (error) {
    console.error('Unexpected error fetching enabled modules:', error)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Update enabled modules for a user
 */
export async function updateEnabledModules(modules: string[]): Promise<{ error: string | null }> {
  try {
    const { data: currentSettings, error: fetchError } = await getUserSettings()
    
    if (fetchError) {
      return { error: fetchError }
    }

    const updatedSettings: UserSettings = {
      ...currentSettings || DEFAULT_SETTINGS,
      modules: {
        enabled: modules
      }
    }

    return await saveUserSettings(updatedSettings)
  } catch (error) {
    console.error('Unexpected error updating enabled modules:', error)
    return { error: 'An unexpected error occurred' }
  }
}
