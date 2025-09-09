'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getEnabledModules, UserSettings } from '@/lib/api/settings'
import { authService } from '@/lib/auth'

interface SettingsContextType {
  enabledModules: string[]
  isLoading: boolean
  updateEnabledModules: (modules: string[]) => void
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const DEFAULT_MODULES = [
    'goals', 'tasks', 'habits', 'notes', 'health', 
    'finance', 'lifestyle', 'visualization', 'gifts', 
    'memories', 'freelancing', 'secrets', 'analytics'
  ]

  const loadEnabledModules = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is authenticated before making API calls
      const user = authService.getCurrentUser()
      if (!user) {
        // User not authenticated, show all modules as default
        setEnabledModules(DEFAULT_MODULES)
        setIsLoading(false)
        return
      }

      const { data, error } = await getEnabledModules()
      
      if (error) {
        console.error('Error loading enabled modules:', error)
        // Fallback: show all modules if API fails
        setEnabledModules(DEFAULT_MODULES)
        return
      }

      setEnabledModules(data || DEFAULT_MODULES)
    } catch (error) {
      console.error('Unexpected error loading modules:', error)
      // Fallback: show all modules if API fails
      setEnabledModules(DEFAULT_MODULES)
    } finally {
      setIsLoading(false)
    }
  }

  // Load settings when component mounts and when auth state changes
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthChange(async (user) => {
      if (user) {
        // User logged in, load their settings
        await loadEnabledModules()
      } else {
        // User logged out, reset to default modules
        setEnabledModules(DEFAULT_MODULES)
        setIsLoading(false)
      }
    })

    // Cleanup listener on unmount
    return unsubscribe
  }, [])

  const updateEnabledModules = (modules: string[]) => {
    setEnabledModules(modules)
  }

  const refreshSettings = async () => {
    // Only reload if user is authenticated
    const user = authService.getCurrentUser()
    if (user) {
      await loadEnabledModules()
    }
  }

  return (
    <SettingsContext.Provider value={{
      enabledModules,
      isLoading,
      updateEnabledModules,
      refreshSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
