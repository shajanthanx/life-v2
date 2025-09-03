'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SleepRecord } from '@/types'
import { Moon, Sun, Clock, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface SleepTrackerProps {
  sleepRecords: SleepRecord[]
  onAddRecord: () => void
}

export function SleepTracker({ sleepRecords, onAddRecord }: SleepTrackerProps) {
  const recentRecords = sleepRecords.slice(0, 7)
  
  const avgSleep = recentRecords.reduce((acc, record) => acc + record.hoursSlept, 0) / Math.max(recentRecords.length, 1)
  const avgQuality = recentRecords.reduce((acc, record) => acc + record.quality, 0) / Math.max(recentRecords.length, 1)
  
  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-600'
    if (quality >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityLabel = (quality: number) => {
    if (quality >= 4) return 'Great'
    if (quality >= 3) return 'Good'
    if (quality >= 2) return 'Fair'
    return 'Poor'
  }

  const getSleepScore = (hours: number, quality: number) => {
    const hoursScore = Math.min(hours / 8, 1) * 50
    const qualityScore = (quality / 5) * 50
    return Math.round(hoursScore + qualityScore)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Sleep</p>
                <p className="text-2xl font-bold">{avgSleep.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Quality</p>
                <p className="text-2xl font-bold">{avgQuality.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sleep Score</p>
                <p className="text-2xl font-bold">{getSleepScore(avgSleep, avgQuality)}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sleep Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sleep Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRecords.map((record) => (
              <div key={record.id} className="p-4 border rounded-lg">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(record.date)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-center sm:text-left">
                      <div>
                        <p className="text-sm text-muted-foreground">Bedtime</p>
                        <p className="font-medium text-sm">{new Date(record.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Wake</p>
                        <p className="font-medium text-sm">{new Date(record.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold">{record.hoursSlept.toFixed(1)}h</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Quality</p>
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`text-lg font-bold ${getQualityColor(record.quality)}`}>
                          {record.quality}/5
                        </span>
                        <Badge className={`${getQualityColor(record.quality)} text-xs`}>
                          {getQualityLabel(record.quality)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-bold">{getSleepScore(record.hoursSlept, record.quality)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentRecords.length === 0 && (
            <div className="text-center py-8">
              <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sleep records yet. Start tracking your sleep!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sleep Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Sleep Target: 8 hours</span>
                <span className="text-sm text-muted-foreground">{avgSleep.toFixed(1)} / 8.0 hours</span>
              </div>
              <Progress value={(avgSleep / 8) * 100} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quality Target: 4+ stars</span>
                <span className="text-sm text-muted-foreground">{avgQuality.toFixed(1)} / 5.0 stars</span>
              </div>
              <Progress value={(avgQuality / 5) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
