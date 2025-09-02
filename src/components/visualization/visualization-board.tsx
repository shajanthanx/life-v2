'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Visualization } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Eye, Target, Star, Calendar, Trophy } from 'lucide-react'

interface VisualizationBoardProps {
  visualizations: Visualization[]
  onAddVisualization: () => void
  onUpdateVisualization: (visualization: Visualization) => void
}

export function VisualizationBoard({ visualizations, onAddVisualization, onUpdateVisualization }: VisualizationBoardProps) {
  const [filter, setFilter] = useState<'all' | Visualization['category']>('all')

  const filteredVisualizations = (visualizations || []).filter(viz => 
    filter === 'all' || viz.category === filter
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'bg-blue-100 text-blue-700'
      case 'career':
        return 'bg-purple-100 text-purple-700'
      case 'health':
        return 'bg-green-100 text-green-700'
      case 'finance':
        return 'bg-orange-100 text-orange-700'
      case 'relationships':
        return 'bg-pink-100 text-pink-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal':
        return '🌟'
      case 'career':
        return '💼'
      case 'health':
        return '🏃'
      case 'finance':
        return '💰'
      case 'relationships':
        return '❤️'
      default:
        return '🎯'
    }
  }

  const getTimeRemaining = (targetDate?: Date) => {
    if (!targetDate) return null
    
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: 'Past due', color: 'text-red-500' }
    if (days === 0) return { text: 'Today', color: 'text-orange-500' }
    if (days <= 30) return { text: `${days} days left`, color: 'text-orange-500' }
    if (days <= 90) return { text: `${days} days left`, color: 'text-yellow-600' }
    return { text: `${days} days left`, color: 'text-green-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visualization Board</h2>
          <p className="text-muted-foreground">Visualize your dreams and aspirations</p>
        </div>
        <Button onClick={onAddVisualization}>
          <Plus className="h-4 w-4 mr-2" />
          Add Visualization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{(visualizations || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Achieved</p>
                <p className="text-2xl font-bold">{(visualizations || []).filter(v => v.isAchieved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{(visualizations || []).filter(v => !v.isAchieved && v.progress > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {(visualizations || []).length > 0 
                    ? Math.round((visualizations || []).reduce((acc, v) => acc + v.progress, 0) / (visualizations || []).length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'personal', 'career', 'health', 'finance', 'relationships'].map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category as any)}
          >
            {category === 'all' ? 'All' : `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </Button>
        ))}
      </div>

      {/* Visualization Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVisualizations.map((visualization) => {
          const timeRemaining = getTimeRemaining(visualization.targetDate)
          
          return (
            <Card key={visualization.id} className={visualization.isAchieved ? 'bg-green-50 border-green-200' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {visualization.isAchieved ? (
                        <Trophy className="h-5 w-5 text-green-500" />
                      ) : (
                        <Target className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span>{visualization.title}</span>
                    </CardTitle>
                    {visualization.description && (
                      <p className="text-sm text-muted-foreground mt-1">{visualization.description}</p>
                    )}
                  </div>
                  <Badge className={getCategoryColor(visualization.category)}>
                    {getCategoryIcon(visualization.category)} {visualization.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Image placeholder */}
                {visualization.imageUrl ? (
                  <div className="w-full h-32 bg-cover bg-center rounded-lg" 
                       style={{ backgroundImage: `url(${visualization.imageUrl})` }} />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-4xl">{getCategoryIcon(visualization.category)}</div>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{visualization.progress}%</span>
                  </div>
                  <Progress value={visualization.progress} />
                </div>

                {/* Target Date */}
                {visualization.targetDate && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Target: {formatDate(visualization.targetDate)}</span>
                    </div>
                    {timeRemaining && (
                      <span className={timeRemaining.color}>
                        {timeRemaining.text}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {visualization.notes && (
                  <p className="text-sm text-muted-foreground italic">
                    "{visualization.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      const newProgress = Math.min(visualization.progress + 10, 100)
                      const updated = {
                        ...visualization,
                        progress: newProgress,
                        isAchieved: newProgress === 100
                      }
                      onUpdateVisualization(updated)
                    }}
                    disabled={visualization.isAchieved}
                  >
                    Update Progress
                  </Button>
                  
                  {visualization.progress === 100 && !visualization.isAchieved && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateVisualization({ ...visualization, isAchieved: true })}
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Mark Achieved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredVisualizations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No visualizations found</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first visualization to track your dreams and aspirations
            </p>
            <Button onClick={onAddVisualization}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Visualization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
