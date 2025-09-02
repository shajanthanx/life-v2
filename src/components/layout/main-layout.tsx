'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  title: string
  subtitle?: string
  onSearchClick?: () => void
  onNotificationClick?: () => void
  notificationCount?: number
}

export function MainLayout({ children, activeTab, onTabChange, title, subtitle, onSearchClick, onNotificationClick, notificationCount }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            onTabChange(tab)
            setSidebarOpen(false)
          }} 
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={onSearchClick}
          onNotificationClick={onNotificationClick}
          notificationCount={notificationCount}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
