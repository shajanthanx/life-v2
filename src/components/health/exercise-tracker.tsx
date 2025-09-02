'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ExerciseRecord } from '@/types'
import { Activity, Clock, Flame, TrendingUp, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ExerciseTrackerProps {
  exerciseRecords: ExerciseRecord[]
  onAddRecord: () => void
}

export function ExerciseTracker({ exerciseRecords, onAddRecord }: ExerciseTrackerProps) {
  const recentRecords = exerciseRecords.slice(0, 7)
  const weeklyMinutes = recentRecords.reduce((acc, record) => acc + record.duration, 0)
  const weeklyCalories = recentRecords.reduce((acc, record) => acc + (record.calories || 0), 0)
  const workoutCount = recentRecords.length

  const weeklyGoal = 150 // 150 minutes per week as recommended
  const progressPercent = Math.min((weeklyMinutes / weeklyGoal) * 100, 100)

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    // Simple mapping for common exercise types
    if (type.toLowerCase().includes('run')) return '🏃'
    if (type.toLowerCase().includes('bike') || type.toLowerCase().includes('cycling')) return '🚴'
    if (type.toLowerCase().includes('swim')) return '🏊'
    if (type.toLowerCase().includes('walk')) return '🚶'
    if (type.toLowerCase().includes('weight') || type.toLowerCase().includes('strength')) return '🏋️'
    if (type.toLowerCase().includes('yoga')) return '🧘'
    return '💪'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{workoutCount}</p>
                <p className="text-xs text-muted-foreground">workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
                <p className="text-2xl font-bold">{weeklyMinutes}</p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold">{weeklyCalories}</p>
                <p className="text-xs text-muted-foreground">burned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Weekly Goal</p>
                <p className="text-2xl font-bold">{progressPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Exercise Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">150 minutes recommended per week</span>
              <span className="text-sm text-muted-foreground">{weeklyMinutes} / 150 minutes</span>
            </div>
            <Progress value={progressPercent} />
            <p className="text-xs text-muted-foreground">
              {weeklyMinutes >= weeklyGoal 
                ? "🎉 Great job! You've reached your weekly exercise goal!" 
                : `${weeklyGoal - weeklyMinutes} minutes remaining to reach your goal`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Workouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Workouts</CardTitle>
          <Button onClick={onAddRecord} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(record.type)}</div>
                  
                  <div>
                    <h4 className="font-medium">{record.type}</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                    {record.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{record.duration} min</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Intensity</p>
                    <Badge className={getIntensityColor(record.intensity)}>
                      {record.intensity}
                    </Badge>
                  </div>
                  
                  {record.calories && (
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="font-medium">{record.calories}</p>
                    </div>
                  )}
                  
                  {record.image && (
                    <div className="ml-4">
                      <img 
                        src={record.image} 
                        alt="Workout photo" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recentRecords.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No workouts recorded yet</p>
              <Button onClick={onAddRecord}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Types Summary */}
      {recentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exercise Types This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from(new Set(recentRecords.map(r => r.type))).map(type => {
                const typeRecords = recentRecords.filter(r => r.type === type)
                const totalMinutes = typeRecords.reduce((acc, r) => acc + r.duration, 0)
                const totalWorkouts = typeRecords.length
                
                return (
                  <div key={type} className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
                    <h4 className="font-medium text-sm">{type}</h4>
                    <p className="text-xs text-muted-foreground">
                      {totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''} • {totalMinutes} min
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
