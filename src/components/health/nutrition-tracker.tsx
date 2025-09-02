'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { NutritionRecord } from '@/types'
import { Apple, Coffee, Cookie, Utensils, Plus, Target } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface NutritionTrackerProps {
  nutritionRecords: NutritionRecord[]
  onAddRecord: () => void
}

export function NutritionTracker({ nutritionRecords, onAddRecord }: NutritionTrackerProps) {
  const today = new Date().toDateString()
  const todayRecords = nutritionRecords.filter(record => 
    new Date(record.date).toDateString() === today
  )
  
  const recentRecords = nutritionRecords.slice(0, 10)
  
  const todayCalories = todayRecords.reduce((acc, record) => acc + record.calories, 0)
  const dailyCalorieGoal = 2000 // This would be configurable per user
  const calorieProgress = Math.min((todayCalories / dailyCalorieGoal) * 100, 100)

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return Coffee
      case 'lunch':
        return Utensils
      case 'dinner':
        return Apple
      case 'snack':
        return Cookie
      default:
        return Utensils
    }
  }

  const getMealColor = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-700'
      case 'lunch':
        return 'bg-blue-100 text-blue-700'
      case 'dinner':
        return 'bg-purple-100 text-purple-700'
      case 'snack':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getMealTime = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return '7:00 AM - 10:00 AM'
      case 'lunch':
        return '12:00 PM - 2:00 PM'
      case 'dinner':
        return '6:00 PM - 8:00 PM'
      case 'snack':
        return 'Anytime'
      default:
        return ''
    }
  }

  const mealBreakdown = todayRecords.reduce((acc, record) => {
    acc[record.meal] = (acc[record.meal] || 0) + record.calories
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Today's Nutrition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Calorie Goal</span>
                <span className="text-sm text-muted-foreground">
                  {todayCalories} / {dailyCalorieGoal} calories
                </span>
              </div>
              <Progress value={calorieProgress} />
              <p className="text-xs text-muted-foreground mt-1">
                {todayCalories >= dailyCalorieGoal 
                  ? "✅ Daily goal reached!" 
                  : `${dailyCalorieGoal - todayCalories} calories remaining`}
              </p>
            </div>

            {Object.keys(mealBreakdown).length > 0 && (
              <div className="grid gap-3 md:grid-cols-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
                  const calories = mealBreakdown[meal] || 0
                  const Icon = getMealIcon(meal)
                  
                  return (
                    <div key={meal} className="text-center p-3 bg-muted rounded-lg">
                      <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium text-sm capitalize">{meal}</h4>
                      <p className="text-lg font-bold">{calories}</p>
                      <p className="text-xs text-muted-foreground">calories</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Meals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Meals</CardTitle>
          <Button onClick={onAddRecord} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRecords.map((record) => {
              const Icon = getMealIcon(record.meal)
              
              return (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getMealColor(record.meal)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{record.food}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getMealColor(record.meal)}>
                          {record.meal}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">{record.calories}</p>
                    <p className="text-sm text-muted-foreground">calories</p>
                  </div>
                </div>
              )
            })}
          </div>

          {recentRecords.length === 0 && (
            <div className="text-center py-8">
              <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No meals logged yet</p>
              <Button onClick={onAddRecord}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal Planning Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Planning Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Recommended Meal Times</h4>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
                const Icon = getMealIcon(meal)
                return (
                  <div key={meal} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm capitalize">{meal}</p>
                      <p className="text-xs text-muted-foreground">{getMealTime(meal)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Daily Targets</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span>{dailyCalorieGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span>150g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span>250g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span>78g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber:</span>
                  <span>25g</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hydration Reminder */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💧</div>
            <div>
              <h4 className="font-medium">Stay Hydrated!</h4>
              <p className="text-sm text-muted-foreground">
                Remember to drink at least 8 glasses of water today. Track your water intake in the habits section.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
