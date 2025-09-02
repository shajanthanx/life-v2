'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BadHabit, AppState } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, TrendingDown, DollarSign, Heart, AlertTriangle, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BadHabitsTrackerProps {
  badHabits: BadHabit[]
  appData: AppState
  onAddBadHabit: () => void
  onUpdateBadHabit: (habit: BadHabit) => void
}

export function BadHabitsTracker({ badHabits, appData, onAddBadHabit, onUpdateBadHabit }: BadHabitsTrackerProps) {
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  // Calculate impact metrics for bad habits
  const calculateHealthImpact = (habit: BadHabit) => {
    const recentRecords = habit.records.slice(0, 7)
    const avgDaily = recentRecords.reduce((acc, record) => acc + record.count, 0) / Math.max(recentRecords.length, 1)
    
    // Define health impact based on habit type
    const healthImpacts: Record<string, { score: number; description: string }> = {
      'social media': { score: Math.min(avgDaily / 60 * 20, 100), description: 'Screen time affecting sleep and focus' },
      'smoking': { score: avgDaily * 10, description: 'Significant respiratory and cardiovascular impact' },
      'alcohol': { score: avgDaily * 15, description: 'Liver health and sleep quality impact' },
      'junk food': { score: avgDaily * 5, description: 'Nutrition and energy level impact' },
      'procrastination': { score: avgDaily * 8, description: 'Stress and mental health impact' },
      'default': { score: avgDaily * 3, description: 'General wellbeing impact' }
    }
    
    const habitKey = habit.name.toLowerCase()
    const impact = Object.keys(healthImpacts).find(key => habitKey.includes(key)) || 'default'
    return healthImpacts[impact]
  }

  const calculateFinancialImpact = (habit: BadHabit) => {
    const recentRecords = habit.records.slice(0, 30) // Last 30 days
    const totalCount = recentRecords.reduce((acc, record) => acc + record.count, 0)
    
    // Define financial costs based on habit type
    const costPerUnit: Record<string, number> = {
      'smoking': 10, // $10 per pack
      'alcohol': 8,  // $8 per drink
      'coffee': 5,   // $5 per coffee
      'junk food': 12, // $12 per meal
      'social media': 0, // No direct cost but opportunity cost
      'shopping': 50, // $50 per impulse buy
      'default': 2    // $2 default cost
    }
    
    const habitKey = habit.name.toLowerCase()
    const cost = Object.keys(costPerUnit).find(key => habitKey.includes(key)) || 'default'
    const monthlyCost = totalCount * costPerUnit[cost]
    const yearlyCost = monthlyCost * 12
    
    return { monthly: monthlyCost, yearly: yearlyCost, perUnit: costPerUnit[cost] }
  }

  const getReductionProgress = (habit: BadHabit) => {
    const recentRecords = habit.records.slice(0, 7)
    const olderRecords = habit.records.slice(7, 14)
    
    if (olderRecords.length === 0) return 0
    
    const recentAvg = recentRecords.reduce((acc, record) => acc + record.count, 0) / Math.max(recentRecords.length, 1)
    const olderAvg = olderRecords.reduce((acc, record) => acc + record.count, 0) / olderRecords.length
    
    const reduction = ((olderAvg - recentAvg) / olderAvg) * 100
    return Math.max(0, reduction)
  }

  const getTrendData = (habit: BadHabit) => {
    return habit.records
      .slice(0, 14)
      .reverse()
      .map((record, index) => ({
        day: index + 1,
        count: record.count,
        date: formatDate(record.date)
      }))
  }

  const getHabitStatus = (habit: BadHabit) => {
    const progress = getReductionProgress(habit)
    if (progress >= 50) return { status: 'improving', color: 'text-green-600', bg: 'bg-green-50' }
    if (progress >= 20) return { status: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { status: 'needs_attention', color: 'text-red-600', bg: 'bg-red-50' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bad Habits Tracker</h2>
          <p className="text-muted-foreground">Monitor and reduce harmful habits with health and financial insights</p>
        </div>
        <Button onClick={onAddBadHabit}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bad Habit
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tracked Habits</p>
                <p className="text-2xl font-bold">{(badHabits || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold">
                  {(badHabits || []).filter(habit => getReductionProgress(habit) >= 20).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    (badHabits || []).reduce((acc, habit) => acc + calculateFinancialImpact(habit).monthly, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">
                  {Math.max(0, 100 - Math.round(
                    (badHabits || []).reduce((acc, habit) => acc + calculateHealthImpact(habit).score, 0) / Math.max((badHabits || []).length, 1)
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bad Habits List */}
      <div className="space-y-4">
        {(badHabits || []).map((habit) => {
          const healthImpact = calculateHealthImpact(habit)
          const financialImpact = calculateFinancialImpact(habit)
          const progress = getReductionProgress(habit)
          const status = getHabitStatus(habit)
          const recentAvg = habit.records.slice(0, 7).reduce((acc, record) => acc + record.count, 0) / Math.max(habit.records.slice(0, 7).length, 1)
          
          return (
            <Card key={habit.id} className={status.bg}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className={`h-5 w-5 ${status.color}`} />
                      <span>{habit.name}</span>
                    </CardTitle>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    )}
                  </div>
                  <Badge className={status.color}>
                    {status.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Current Status */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{recentAvg.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg daily {habit.unit}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{progress.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Reduction progress</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(financialImpact.monthly)}</div>
                    <div className="text-sm text-muted-foreground">Monthly cost</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Reduction Progress</span>
                    <span className="text-sm text-muted-foreground">Target: {habit.targetReduction}% reduction</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                </div>

                {/* Impact Analysis */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Health Impact */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Health Impact</span>
                      </div>
                      <Badge variant="outline" className="text-red-600">
                        {healthImpact.score.toFixed(0)}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{healthImpact.description}</p>
                  </div>

                  {/* Financial Impact */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Financial Impact</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {formatCurrency(financialImpact.yearly)}/year
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(financialImpact.perUnit)} per {habit.unit} • {formatCurrency(financialImpact.monthly)} monthly
                    </p>
                  </div>
                </div>

                {/* Trend Chart */}
                {selectedHabit === habit.id ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">14-Day Trend</h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getTrendData(habit)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => `Day ${value}`}
                            formatter={(value) => [value, habit.unit]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ fill: '#8884d8' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedHabit(selectedHabit === habit.id ? null : habit.id)}
                  >
                    {selectedHabit === habit.id ? 'Hide' : 'Show'} Trend
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const count = prompt(`How many ${habit.unit} today?`)
                      if (count && !isNaN(Number(count))) {
                        const newRecord = {
                          id: `${habit.id}-${Date.now()}`,
                          habitId: habit.id,
                          date: new Date(),
                          count: Number(count)
                        }
                        onUpdateBadHabit({
                          ...habit,
                          records: [newRecord, ...habit.records]
                        })
                      }
                    }}
                  >
                    Log Today
                  </Button>

                  {progress >= habit.targetReduction && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Goal Achieved!
                    </Button>
                  )}
                </div>

                {/* Recommendations */}
                {status.status === 'needs_attention' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800 mb-1">💡 Recommendations</h4>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• Set daily reminders to track progress</li>
                      <li>• Consider replacing with a positive habit</li>
                      <li>• Calculate financial savings to stay motivated</li>
                      <li>• Track health improvements as you reduce this habit</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(badHabits || []).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bad habits tracked yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking habits you want to reduce for better health and financial wellbeing
            </p>
            <Button onClick={onAddBadHabit}>
              <Plus className="h-4 w-4 mr-2" />
              Track Your First Bad Habit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
