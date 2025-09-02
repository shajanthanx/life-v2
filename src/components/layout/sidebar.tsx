'use client'


import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import {
  Home,
  Target,
  Heart,
  DollarSign,
  BookOpen,
  Settings,
  LogOut,
  User,
  TrendingUp,
  Eye,
  Gift,
  Camera,
  Album,
  Minus,
  Shield,
  Briefcase
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const navigationItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'productivity', label: 'Goals & Tasks', icon: Target },
  { id: 'badhabits', label: 'Bad Habits', icon: Minus },
  { id: 'health', label: 'Health Tracking', icon: Heart },
  { id: 'progress', label: 'Progress Photos', icon: Camera },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'lifestyle', label: 'Lifestyle', icon: BookOpen },
  { id: 'memories', label: 'Memories', icon: Album },
  { id: 'visualization', label: 'Vision Board', icon: Eye },
  { id: 'gifts', label: 'Gift Planning', icon: Gift },
  { id: 'freelancing', label: 'Freelancing', icon: Briefcase },
  { id: 'secrets', label: 'Secrets Manager', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    window.location.reload()
  }

  return (
    <div className={cn('flex flex-col h-screen bg-card border-r', className)}>
      {/* Header */}
      <div className="p-6 border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Life Manager</h2>
            <p className="text-sm text-muted-foreground">Personal Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start text-sm',
                  isActive && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t space-y-2 flex-shrink-0">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive" 
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
