'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { Habit, HabitRecord } from '@/types'
import { logHabitProgress } from '@/lib/api/habits'
import { formatDate } from '@/lib/utils'
import { Calendar, Target, Clock, Save } from 'lucide-react'

interface LogHabitModalProps {
  isOpen: boolean
  onClose: () => void
  habit: Habit | null
  onSuccess: (updatedRecord: HabitRecord) => void
  initialDate?: Date
}

export function LogHabitModal({ isOpen, onClose, habit, onSuccess, initialDate }: LogHabitModalProps) {
  const [formData, setFormData] = useState({
    date: initialDate ? formatDate(initialDate, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  // Reset form when modal opens/closes or habit changes
  useEffect(() => {
    if (isOpen && habit) {
      const dateToUse = initialDate || new Date()
      const existingRecord = habit.records.find(record => 
        formatDate(record.date, 'yyyy-MM-dd') === formatDate(dateToUse, 'yyyy-MM-dd')
      )
      
      setFormData({
        date: formatDate(dateToUse, 'yyyy-MM-dd'),
        notes: existingRecord?.notes || ''
      })
    }
  }, [isOpen, habit, initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!habit) return

    try {
      setIsLoading(true)
      
      const recordData = {
        date: new Date(formData.date),
        isCompleted: true, // Simply mark as completed when logging
        notes: formData.notes.trim() || undefined
      }

      const { data, error } = await logHabitProgress(habit.id, recordData)
      
      if (error) {
        addToast({
          message: `Failed to log habit: ${error}`,
          type: 'error'
        })
        return
      }

      if (data) {
        addToast({
          message: `${habit.name} logged successfully!`,
          type: 'success'
        })
        onSuccess(data)
        onClose()
      }
    } catch (error) {
      addToast({
        message: 'Failed to log habit progress',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if habit is already logged for this date
  const existingRecord = habit?.records.find(record => 
    formatDate(record.date, 'yyyy-MM-dd') === formData.date
  )
  const isAlreadyLogged = existingRecord?.isCompleted || false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: habit?.color || '#6b7280' }}
            />
            Log {habit?.name}
          </DialogTitle>
        </DialogHeader>

        {habit && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Habit Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Mark as completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{habit.frequency}</span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                max={formatDate(new Date(), 'yyyy-MM-dd')} // Can't log future dates
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>

            {/* Completion Status */}
            {isAlreadyLogged && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Already completed for this date</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  You can update the notes or log it again to refresh the timestamp.
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this entry..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isAlreadyLogged ? 'Update Completion' : 'Mark Complete'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}