'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BadHabitsTracker } from '../habits/bad-habits-tracker'
import { AppState, BadHabit } from '@/types'
import { Minus, TrendingDown, DollarSign, Heart, Plus } from 'lucide-react'

interface BadHabitsViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddBadHabit?: () => void
}

export function BadHabitsView({ data, onDataUpdate, onAddBadHabit }: BadHabitsViewProps) {
  const badHabits = data.badHabits || []
  const activeHabits = badHabits.filter(h => h.isActive)
  
  // Calculate statistics
  const totalCostThisWeek = badHabits.reduce((total, habit) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyRecords = habit.records.filter(record => 
      new Date(record.date) >= weekAgo
    )
    
    const weeklyInstances = weeklyRecords.reduce((sum, record) => sum + record.instances, 0)
    return total + (weeklyInstances * habit.costPerInstance)
  }, 0)

  const highImpactHabits = activeHabits.filter(h => h.healthImpact === 'high' || h.healthImpact === 'severe')
  
  const habitsByCategory = activeHabits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tracking</p>
                <p className="text-2xl font-bold">{activeHabits.length}</p>
              </div>
              <Minus className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Cost</p>
                <p className="text-2xl font-bold">${totalCostThisWeek.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold">{highImpactHabits.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(habitsByCategory).length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Habits */}
      {highImpactHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              High Impact Habits - Priority Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highImpactHabits.map((habit) => {
                const thisWeekRecords = habit.records.filter(record => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(record.date) >= weekAgo
                })
                
                const weeklyInstances = thisWeekRecords.reduce((sum, record) => sum + record.instances, 0)
                const weeklyCost = weeklyInstances * habit.costPerInstance
                
                return (
                  <div key={habit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{habit.name}</h3>
                        <Badge variant="destructive" className="text-xs">
                          {habit.healthImpact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{habit.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>This week: {weeklyInstances} {habit.unit}</span>
                        <span>Cost: ${weeklyCost.toFixed(2)}</span>
                        <span>Target: {habit.targetReduction} {habit.unit}/week</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tracker */}
      <BadHabitsTracker
        badHabits={badHabits}
        appData={data}
        onAddBadHabit={onAddBadHabit}
        onUpdateBadHabit={(habit) => {
          const updated = badHabits.map(h => h.id === habit.id ? habit : h)
          onDataUpdate({ ...data, badHabits: updated })
        }}
      />

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(habitsByCategory).map(([category, count]) => {
              const categoryHabits = activeHabits.filter(h => h.category === category)
              const monthlyCost = categoryHabits.reduce((total, habit) => {
                const monthAgo = new Date()
                monthAgo.setDate(monthAgo.getDate() - 30)
                
                const monthlyRecords = habit.records.filter(record => 
                  new Date(record.date) >= monthAgo
                )
                
                const monthlyInstances = monthlyRecords.reduce((sum, record) => sum + record.instances, 0)
                return total + (monthlyInstances * habit.costPerInstance)
              }, 0)

              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="outline">{count} habits</Badge>
                  </div>
                  <span className="font-semibold">${monthlyCost.toFixed(2)}/month</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
