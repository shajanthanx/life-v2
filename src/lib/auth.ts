'use client'

import { User } from '@/types'
import { supabase } from './supabase'
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js'

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private initialized = false
  private authListeners: Array<(user: User | null) => void> = []

  private constructor() {
    // Initialize with current session
    this.initializeAuth()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await this.setCurrentUser(session.user)
      }
      
      this.initialized = true
      this.notifyAuthListeners()

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.setCurrentUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null
          this.notifyAuthListeners()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Refresh user data
          await this.setCurrentUser(session.user)
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      this.initialized = true
      this.notifyAuthListeners()
    }
  }

  private notifyAuthListeners(): void {
    this.authListeners.forEach(listener => listener(this.currentUser))
  }

  onAuthChange(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener)
    
    // If already initialized, call listener immediately
    if (this.initialized) {
      listener(this.currentUser)
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(listener)
      if (index > -1) {
        this.authListeners.splice(index, 1)
      }
    }
  }

  async waitForInitialization(): Promise<void> {
    if (this.initialized) return
    
    return new Promise((resolve) => {
      const checkInitialized = () => {
        if (this.initialized) {
          resolve()
        } else {
          setTimeout(checkInitialized, 100)
        }
      }
      checkInitialized()
    })
  }

  private async setCurrentUser(user: SupabaseUser): Promise<void> {
    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          return
        }

        this.currentUser = {
          id: newProfile.id,
          email: newProfile.email || '',
          name: newProfile.name || 'User',
          avatar: newProfile.avatar_url
        }
      } else if (!error && profile) {
        this.currentUser = {
          id: profile.id,
          email: profile.email || '',
          name: profile.name || 'User',
          avatar: profile.avatar_url
        }
      }
      
      // Notify listeners of user change
      this.notifyAuthListeners()
    } catch (error) {
      console.error('Error setting current user:', error)
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await this.setCurrentUser(data.user)
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async signup(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // User created successfully
        return { success: true }
      }

      return { success: false, error: 'Signup failed' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
      this.currentUser = null
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Not authenticated' }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update current user
      this.currentUser = {
        ...this.currentUser,
        name: updates.name || this.currentUser.name,
        avatar: updates.avatar_url || this.currentUser.avatar
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Get the Supabase auth user ID for database operations
  getUserId(): string | null {
    return this.currentUser?.id || null
  }
}

export const authService = AuthService.getInstance()
