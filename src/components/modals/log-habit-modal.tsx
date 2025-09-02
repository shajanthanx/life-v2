'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Habit, HabitRecord } from '@/types'

interface LogHabitModalProps {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onLogHabit: (habitId: string, record: Omit<HabitRecord, 'id' | 'habitId'>) => void
}

export function LogHabitModal({ isOpen, onClose, habits, onLogHabit }: LogHabitModalProps) {
  const [selectedHabitId, setSelectedHabitId] = useState('')
  const [value, setValue] = useState('')
  const [isCompleted, setIsCompleted] = useState(true)

  const selectedHabit = habits.find(h => h.id === selectedHabitId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedHabitId) {
      alert('Please select a habit')
      return
    }

    const record: Omit<HabitRecord, 'id' | 'habitId'> = {
      date: new Date(),
      isCompleted,
      value: selectedHabit?.hasNumericValue ? Number(value) || 0 : undefined
    }

    onLogHabit(selectedHabitId, record)
    onClose()
    setSelectedHabitId('')
    setValue('')
    setIsCompleted(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Habit</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              required
            >
              <option value="">Choose a habit...</option>
              {habits.filter(h => h.isActive).map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>

          {selectedHabit && (
            <>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{selectedHabit.name}</strong>
                  {selectedHabit.description && (
                    <>
                      <br />
                      {selectedHabit.description}
                    </>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={isCompleted ? 'default' : 'outline'}
                    onClick={() => setIsCompleted(true)}
                  >
                    ✅ Completed
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!isCompleted ? 'default' : 'outline'}
                    onClick={() => setIsCompleted(false)}
                  >
                    ❌ Missed
                  </Button>
                </div>
              </div>

              {selectedHabit.hasNumericValue && isCompleted && (
                <div>
                  <label className="text-sm font-medium">
                    Value {selectedHabit.unit && `(${selectedHabit.unit})`}
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={`Enter ${selectedHabit.unit || 'value'}`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedHabitId}>
              Log Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
