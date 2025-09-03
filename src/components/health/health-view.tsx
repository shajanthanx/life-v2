'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SleepTracker } from './sleep-tracker'
import { ExerciseTracker } from './exercise-tracker'
import { NutritionTracker } from './nutrition-tracker'
import { AppState } from '@/types'
import { Moon, Activity, Apple, Heart, TrendingUp } from 'lucide-react'

interface HealthViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddHealth?: () => void
}

export function HealthView({ data, onDataUpdate, onAddHealth }: HealthViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate health metrics
  const recentSleep = data.sleepRecords.slice(0, 7)
  const avgSleep = recentSleep.reduce((acc, sleep) => acc + sleep.hoursSlept, 0) / Math.max(recentSleep.length, 1)
  const avgSleepQuality = recentSleep.reduce((acc, sleep) => acc + sleep.quality, 0) / Math.max(recentSleep.length, 1)

  const recentExercise = data.exerciseRecords.slice(0, 7)
  const weeklyExerciseMinutes = recentExercise.reduce((acc, exercise) => acc + exercise.duration, 0)
  const exerciseGoal = 150 // minutes per week

  const today = new Date().toDateString()
  const todayNutrition = data.nutritionRecords.filter(record => 
    new Date(record.date).toDateString() === today
  )
  const todayCalories = todayNutrition.reduce((acc, record) => acc + record.calories, 0)
  const calorieGoal = 2000

  const healthMetrics = [
    {
      title: 'Sleep Quality',
      value: `${avgSleep.toFixed(1)}h`,
      subValue: `${avgSleepQuality.toFixed(1)}/5 quality`,
      progress: Math.min((avgSleep / 8) * 100, 100),
      icon: Moon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Exercise',
      value: `${weeklyExerciseMinutes}min`,
      subValue: 'this week',
      progress: Math.min((weeklyExerciseMinutes / exerciseGoal) * 100, 100),
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Nutrition',
      value: `${todayCalories}cal`,
      subValue: 'today',
      progress: Math.min((todayCalories / calorieGoal) * 100, 100),
      icon: Apple,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const overallHealthScore = Math.round(
    (Math.min(avgSleep / 8, 1) * 30) + // Sleep (30%)
    (Math.min(weeklyExerciseMinutes / exerciseGoal, 1) * 40) + // Exercise (40%)
    (Math.min(todayCalories / calorieGoal, 1) * 30) // Nutrition (30%)
  )

  const handleAddSleepRecord = () => {
    onAddHealth?.()
  }

  const handleAddExerciseRecord = () => {
    onAddHealth?.()
  }

  const handleAddNutritionRecord = () => {
    onAddHealth?.()
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="exercise">Exercise</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Overall Health Score */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  <span>Overall Health Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-green-600">
                    {overallHealthScore}/100
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-medium">
                        {overallHealthScore >= 80 ? 'Excellent' : 
                         overallHealthScore >= 60 ? 'Good' : 
                         overallHealthScore >= 40 ? 'Fair' : 'Needs Improvement'}
                      </span>
                      {overallHealthScore >= 80 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on your sleep, exercise, and nutrition patterns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {healthMetrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <Card key={index} className={metric.bgColor}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Icon className={`h-5 w-5 ${metric.color}`} />
                        <span>{metric.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className="text-sm text-muted-foreground">{metric.subValue}</div>
                        </div>
                        <div className="w-full bg-white rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                            style={{ width: `${metric.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.progress.toFixed(0)}% of target
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {avgSleep < 7 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Consider getting more sleep - aim for 7-9 hours per night
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {weeklyExerciseMinutes < 150 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Try to get {150 - weeklyExerciseMinutes} more minutes of exercise this week
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {todayCalories > calorieGoal * 1.2 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Apple className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          You've exceeded your calorie goal today - consider lighter meals
                        </span>
                      </div>
                    </div>
                  )}

                  {avgSleep >= 7 && weeklyExerciseMinutes >= 150 && todayCalories <= calorieGoal && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          🎉 You're maintaining excellent health habits! Keep it up!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sleep" className="mt-6">
          <SleepTracker 
            sleepRecords={data.sleepRecords}
            onAddRecord={handleAddSleepRecord}
          />
        </TabsContent>
        
        <TabsContent value="exercise" className="mt-6">
          <ExerciseTracker 
            exerciseRecords={data.exerciseRecords}
            onAddRecord={handleAddExerciseRecord}
          />
        </TabsContent>
        
        <TabsContent value="nutrition" className="mt-6">
          <NutritionTracker 
            nutritionRecords={data.nutritionRecords}
            onAddRecord={handleAddNutritionRecord}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
