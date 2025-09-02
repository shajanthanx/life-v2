'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export function AuthDebug() {
  const [user, setUser] = useState<User | null>(null)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      // Wait for auth initialization
      await authService.waitForInitialization()
      setIsInitialized(true)
      
      // Get current user
      setUser(authService.getCurrentUser())
      
      // Get session info
      const { data: { session } } = await supabase.auth.getSession()
      setSessionInfo(session)
    }

    init()

    // Listen for auth changes
    const unsubscribe = authService.onAuthChange((newUser) => {
      setUser(newUser)
      console.log('Auth change in debug component:', newUser?.email || 'logged out')
    })

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state change:', event, session?.user?.email)
      setSessionInfo(session)
    })

    return () => {
      unsubscribe()
      subscription.unsubscribe()
    }
  }, [])

  if (!isInitialized) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Auth initializing...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded text-xs">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Current User:</strong> {user ? user.email : 'Not logged in'}
        </div>
        <div>
          <strong>User ID:</strong> {user?.id || 'None'}
        </div>
        <div>
          <strong>Session Valid:</strong> {sessionInfo ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Session Expires:</strong> {sessionInfo?.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'None'}
        </div>
        <div>
          <strong>Auth Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  )
}
