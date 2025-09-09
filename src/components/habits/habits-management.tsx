'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Edit, Trash2, MoreHorizontal, Eye, EyeOff,
  Grid, List, Plus, Target, Calendar, Palette
} from 'lucide-react'
import { Habit } from '@/types'
import { formatDate } from '@/lib/utils'
import { updateHabit, deleteHabit } from '@/lib/api/habits'

interface HabitsManagementProps {
  habits: Habit[]
  onHabitUpdate: (habit: Habit) => void
  onHabitDelete: (habitId: string) => void
  onHabitEdit: (habit: Habit) => void
  onAddHabit: () => void
  isLoading?: boolean
}

export function HabitsManagement({ 
  habits, 
  onHabitUpdate, 
  onHabitDelete, 
  onHabitEdit, 
  onAddHabit, 
  isLoading = false 
}: HabitsManagementProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; habit: Habit | null }>({
    isOpen: false,
    habit: null
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const { addToast } = useToast()

  const handleToggleActive = async (habit: Habit) => {
    try {
      const { data, error } = await updateHabit(habit.id, {
        ...habit,
        isActive: !habit.isActive
      })

      if (error) {
        addToast({
          message: `Failed to ${habit.isActive ? 'deactivate' : 'activate'} habit: ${error}`,
          type: 'error'
        })
        return
      }

      if (data) {
        onHabitUpdate(data)
        addToast({
          message: `${habit.name} ${habit.isActive ? 'deactivated' : 'activated'} successfully!`,
          type: 'success'
        })
      }
    } catch (error) {
      addToast({
        message: 'Failed to update habit status',
        type: 'error'
      })
    }
  }

  const handleDeleteHabit = async () => {
    if (!deleteModal.habit) return

    setIsDeleting(true)
    try {
      const { success, error } = await deleteHabit(deleteModal.habit.id)

      if (error) {
        addToast({
          message: `Failed to delete habit: ${error}`,
          type: 'error'
        })
        return
      }

      if (success) {
        onHabitDelete(deleteModal.habit.id)
        addToast({
          message: `${deleteModal.habit.name} deleted successfully!`,
          type: 'success'
        })
        setDeleteModal({ isOpen: false, habit: null })
      }
    } catch (error) {
      addToast({
        message: 'Failed to delete habit',
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '🏃'
      case 'productivity': return '💼'
      case 'mindfulness': return '🧘'
      case 'fitness': return '💪'
      case 'learning': return '📚'
      default: return '✨'
    }
  }

  const getHabitStats = (habit: Habit) => {
    // Calculate completion rate based on a reasonable time window (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentRecords = habit.records.filter(r => r.date >= thirtyDaysAgo)
    const completedRecords = recentRecords.filter(r => r.isCompleted).length
    const completionRate = Math.round((completedRecords / 30) * 100)
    
    // Calculate current streak - consecutive completed days from today backwards
    let currentStreak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      
      // Stop if we go before habit creation date
      if (checkDate < new Date(habit.createdAt)) break
      
      const record = habit.records.find(r => 
        r.date.toDateString() === checkDate.toDateString() && r.isCompleted
      )
      
      if (record) {
        currentStreak++
      } else {
        break // Stop at first non-completed day
      }
    }
    
    return { totalRecords: 30, completedRecords, completionRate, currentStreak }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Habits</h2>
          <p className="text-muted-foreground">Create, edit, and organize your habits</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          
          {/* <Button onClick={onAddHabit} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button> */}
        </div>
      </div>

      {/* Empty State */}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">Create your first habit to get started</p>
              <Button onClick={onAddHabit} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Habit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <Card>
              <CardHeader>
                <CardTitle>All Habits ({habits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Habit</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Current Streak</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {habits.map(habit => {
                      const stats = getHabitStats(habit)
                      
                      return (
                        <TableRow key={habit.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: habit.color }}
                              />
                              <div>
                                <div className="font-medium">{habit.name}</div>
                                {habit.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {habit.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getCategoryIcon(habit.category)}</span>
                              <span className="capitalize">{habit.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {habit.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{stats.completionRate}%</span>
                              <span className="text-muted-foreground text-sm">
                                ({stats.completedRecords}/{stats.totalRecords})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {stats.currentStreak > 0 && (
                                <>
                                  <span className="text-orange-500">🔥</span>
                                  <span className="font-medium">{stats.currentStreak}</span>
                                </>
                              )}
                              {stats.currentStreak === 0 && (
                                <span className="text-muted-foreground">No streak</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={habit.isActive ? 'default' : 'secondary'}>
                              {habit.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(habit.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(habit)}
                                className="h-8 w-8 p-0"
                              >
                                {habit.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHabitEdit(habit)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteModal({ isOpen: true, habit })}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map(habit => {
                const stats = getHabitStats(habit)
                
                return (
                  <Card key={habit.id} className={`${!habit.isActive ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: habit.color }}
                          />
                          <div>
                            <CardTitle className="text-lg">{habit.name}</CardTitle>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {habit.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={habit.isActive ? 'default' : 'secondary'} className="text-xs">
                          {habit.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(habit.category)}</span>
                          <span className="capitalize">{habit.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{habit.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.completionRate}% completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stats.currentStreak > 0 ? (
                            <>
                              <span className="text-orange-500">🔥</span>
                              <span>{stats.currentStreak} day streak</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">No streak</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Created {formatDate(habit.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(habit)}
                            className="h-8 w-8 p-0"
                          >
                            {habit.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHabitEdit(habit)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({ isOpen: true, habit })}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, habit: null })}
        onConfirm={handleDeleteHabit}
        title="Delete Habit"
        description={`Are you sure you want to delete "${deleteModal.habit?.name}"? This action cannot be undone and will remove all associated records.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
