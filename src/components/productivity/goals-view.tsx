'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner'
import { Plus, Target, Calendar, CheckCircle2, Trophy, Edit2, Trash2, MoreVertical, TrendingUp } from 'lucide-react'
import { Goal, Milestone } from '@/types'
import { formatDate, getProgressPercentage } from '@/lib/utils'
import { updateMilestone } from '@/lib/api/goals'
import { useToast } from '@/hooks/use-toast'

interface GoalsViewProps {
  goals: Goal[]
  onGoalUpdate: (goal: Goal) => void
  onGoalDelete: (goalId: string) => void
  onGoalEdit: (goal: Goal) => void
  onAddGoal: () => void
  isLoading?: boolean
}

export function GoalsView({ goals, onGoalUpdate, onGoalDelete, onGoalEdit, onAddGoal, isLoading = false }: GoalsViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showManualUpdate, setShowManualUpdate] = useState<string | null>(null)
  const [manualValue, setManualValue] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  const { addToast } = useToast()

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return !goal.isCompleted
      case 'completed':
        return goal.isCompleted
      default:
        return true
    }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return 'bg-green-100 text-green-700'
      case 'learning':
        return 'bg-blue-100 text-blue-700'
      case 'career':
        return 'bg-purple-100 text-purple-700'
      case 'personal':
        return 'bg-orange-100 text-orange-700'
      case 'finance':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: 'Overdue', color: 'text-red-500' }
    if (days === 0) return { text: 'Due today', color: 'text-orange-500' }
    if (days <= 7) return { text: `${days} days left`, color: 'text-orange-500' }
    if (days <= 30) return { text: `${days} days left`, color: 'text-yellow-600' }
    return { text: `${days} days left`, color: 'text-muted-foreground' }
  }

  const completedMilestones = (goal: Goal) => goal.milestones.filter(m => m.isCompleted).length
  const totalMilestones = (goal: Goal) => goal.milestones.length

  const handleMilestoneToggle = async (goal: Goal, milestoneId: string, isCompleted: boolean) => {
    setOperationLoading(milestoneId)
    try {
      const { data, error } = await updateMilestone(milestoneId, isCompleted)
      
      if (error) {
        addToast({
          title: 'Error',
          message: error,
          type: 'error'
        })
        return
      }

      // Update the goal with the updated milestone
      const updatedGoal = {
        ...goal,
        milestones: goal.milestones.map(milestone =>
          milestone.id === milestoneId 
            ? { ...milestone, isCompleted, completedAt: isCompleted ? new Date() : undefined }
            : milestone
        )
      }

      onGoalUpdate(updatedGoal)
      
      addToast({
        title: 'Success',
        message: `Milestone ${isCompleted ? 'completed' : 'uncompleted'}!`,
        type: 'success'
      })
    } catch (error) {
      addToast({
        title: 'Error', 
        message: 'Failed to update milestone',
        type: 'error'
      })
    } finally {
      setOperationLoading(null)
    }
  }

  const handleManualProgressUpdate = (goal: Goal) => {
    const newValue = parseFloat(manualValue)
    
    if (isNaN(newValue) || newValue < 0) {
      addToast({
        title: 'Invalid Value',
        message: 'Please enter a valid positive number',
        type: 'error'
      })
      return
    }

    if (newValue > goal.targetValue) {
      addToast({
        title: 'Value Too High',
        message: `Value cannot exceed target of ${goal.targetValue} ${goal.unit}`,
        type: 'error'
      })
      return
    }

    const updatedGoal = {
      ...goal,
      currentValue: newValue
    }
    
    if (newValue === goal.targetValue) {
      updatedGoal.isCompleted = true
    }

    onGoalUpdate(updatedGoal)
    setShowManualUpdate(null)
    setManualValue('')
    
    addToast({
      title: 'Progress Updated',
      message: `Progress updated to ${newValue} ${goal.unit}`,
      type: 'success'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground">Track your progress towards achieving your dreams</p>
        </div>
        <Button onClick={onAddGoal} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Goals' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Goals Grid */}
      <LoadingOverlay isLoading={isLoading}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => {
          const progress = getProgressPercentage(goal.currentValue, goal.targetValue)
          const timeRemaining = getTimeRemaining(new Date(goal.deadline))
          
          return (
            <Card key={goal.id} className={`h-full flex flex-col ${goal.isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {goal.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Target className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span>{goal.title}</span>
                    </CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    )}
                  </div>
                  <Badge className={getCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>

                  {/* Milestones */}
                  {goal.milestones.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Milestones</span>
                        <span className="text-sm text-muted-foreground">
                          {completedMilestones(goal)} / {totalMilestones(goal)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {goal.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-start space-x-3 text-sm">
                          <div className="relative">
                            <Checkbox
                              checked={milestone.isCompleted}
                              onCheckedChange={(checked) => 
                                handleMilestoneToggle(goal, milestone.id, !!checked)
                              }
                              className="h-4 w-4 mt-0.5"
                              disabled={operationLoading === milestone.id}
                            />
                            {operationLoading === milestone.id && (
                              <LoadingSpinner size="sm" className="absolute top-0 left-0 h-4 w-4" />
                            )}
                          </div>
                            <span className={milestone.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {formatDate(new Date(goal.deadline))}</span>
                    </div>
                    <span className={timeRemaining.color}>
                      {timeRemaining.text}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 mt-auto border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Update current value
                      const updatedGoal = {
                        ...goal,
                        currentValue: Math.min(goal.currentValue + 1, goal.targetValue)
                      }
                      if (updatedGoal.currentValue === updatedGoal.targetValue) {
                        updatedGoal.isCompleted = true
                      }
                      onGoalUpdate(updatedGoal)
                    }}
                    disabled={goal.isCompleted}
                  >
                    +1 Progress
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={goal.isCompleted}
                        onClick={() => {
                          setShowManualUpdate(goal.id)
                          setManualValue(goal.currentValue.toString())
                        }}
                      >
                        <TrendingUp className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Progress</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            Current Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </label>
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder={`Enter new value (max: ${goal.targetValue})`}
                            value={manualValue}
                            onChange={(e) => setManualValue(e.target.value)}
                            min="0"
                            max={goal.targetValue}
                            step="0.1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleManualProgressUpdate(goal)}
                            className="flex-1"
                          >
                            Update Progress
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onGoalEdit(goal)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(goal.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                  
                  {goal.isCompleted && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm ml-2">
                      <Trophy className="h-4 w-4" />
                      <span>Completed!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </LoadingOverlay>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start by creating your first goal to track your progress."
                : `No ${filter} goals found. Try changing the filter.`}
            </p>
            <Button onClick={onAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          if (showDeleteConfirm) {
            onGoalDelete(showDeleteConfirm)
          }
        }}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone and will also delete all associated milestones."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
