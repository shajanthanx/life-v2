'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Target, DollarSign, BookOpen, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'task' | 'goal' | 'expense' | 'journal' | 'habit'
  title: string
  description?: string
  timestamp: Date
  metadata?: any
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return CheckCircle
      case 'goal':
        return Target
      case 'expense':
        return DollarSign
      case 'journal':
        return BookOpen
      case 'habit':
        return Activity
      default:
        return CheckCircle
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-700'
      case 'goal':
        return 'bg-orange-100 text-orange-700'
      case 'expense':
        return 'bg-red-100 text-red-700'
      case 'journal':
        return 'bg-purple-100 text-purple-700'
      case 'habit':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Task'
      case 'goal':
        return 'Goal'
      case 'expense':
        return 'Expense'
      case 'journal':
        return 'Journal'
      case 'habit':
        return 'Habit'
      default:
        return 'Activity'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to show
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = getIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${getTypeColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(activity.type)}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:underline">
              View all activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
