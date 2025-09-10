'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Menu, Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  onSearchClick?: () => void
  onNotificationClick?: () => void
  notificationCount?: number
  className?: string
}

export function Header({ title, subtitle, onMenuClick, onSearchClick, onNotificationClick, notificationCount, className }: HeaderProps) {
  return (
    <Card className={`border-b border-l-0 border-r-0 border-t-0 rounded-none ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all data... (Ctrl+K)"
              className="pl-10 w-64 cursor-pointer"
              onClick={onSearchClick}
              readOnly
            />
          </div>

          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearchClick}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" onClick={onNotificationClick}>
            <Bell className="h-5 w-5" />
            {notificationCount && notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
