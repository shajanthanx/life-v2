'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SleepRecord, ExerciseRecord, NutritionRecord } from '@/types'
import { handleImageUpload } from '@/lib/image-utils'
import { useToast } from '@/hooks/use-toast'

interface AddHealthModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitSleep: (record: Omit<SleepRecord, 'id'>) => void
  onSubmitExercise: (record: Omit<ExerciseRecord, 'id'>) => void
  onSubmitNutrition: (record: Omit<NutritionRecord, 'id'>) => void
}

export function AddHealthModal({ 
  isOpen, 
  onClose, 
  onSubmitSleep, 
  onSubmitExercise, 
  onSubmitNutrition 
}: AddHealthModalProps) {
  const [activeTab, setActiveTab] = useState('sleep')
  const { addToast } = useToast()
  
  // Sleep form
  const [sleepData, setSleepData] = useState({
    bedtime: '',
    wakeTime: '',
    quality: 3 as 1 | 2 | 3 | 4 | 5
  })

  // Exercise form
  const [exerciseData, setExerciseData] = useState({
    type: 'running' as ExerciseRecord['type'],
    duration: '',
    intensity: 'moderate' as ExerciseRecord['intensity'],
    calories: '',
    notes: '',
    image: ''
  })

  // Nutrition form
  const [nutritionData, setNutritionData] = useState({
    mealType: 'breakfast' as NutritionRecord['mealType'],
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  })

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sleepData.bedtime || !sleepData.wakeTime) {
      alert('Please fill in bedtime and wake time')
      return
    }

    // Calculate hours slept
    const bedtime = new Date(`1970-01-01T${sleepData.bedtime}:00`)
    const wakeTime = new Date(`1970-01-01T${sleepData.wakeTime}:00`)
    
    // Handle overnight sleep
    if (wakeTime < bedtime) {
      wakeTime.setDate(wakeTime.getDate() + 1)
    }
    
    const hoursSlept = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60)

    const newRecord: Omit<SleepRecord, 'id'> = {
      date: new Date(),
      hoursSlept: Math.max(0, hoursSlept),
      quality: sleepData.quality,
      bedtime: sleepData.bedtime,
      wakeTime: sleepData.wakeTime
    }

    onSubmitSleep(newRecord)
    onClose()
    setSleepData({ bedtime: '', wakeTime: '', quality: 3 })
  }

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!exerciseData.duration) {
      alert('Please enter exercise duration')
      return
    }

    const newRecord: Omit<ExerciseRecord, 'id'> = {
      date: new Date(),
      type: exerciseData.type,
      duration: Number(exerciseData.duration),
      intensity: exerciseData.intensity,
      calories: exerciseData.calories ? Number(exerciseData.calories) : undefined,
      notes: exerciseData.notes || undefined,
      image: exerciseData.image || undefined
    }

    onSubmitExercise(newRecord)
    onClose()
    setExerciseData({
      type: 'running',
      duration: '',
      intensity: 'moderate',
      calories: '',
      notes: '',
      image: ''
    })
  }

  const handleNutritionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nutritionData.description) {
      alert('Please describe your meal')
      return
    }

    const newRecord: Omit<NutritionRecord, 'id'> = {
      date: new Date(),
      mealType: nutritionData.mealType,
      description: nutritionData.description,
      calories: nutritionData.calories ? Number(nutritionData.calories) : undefined,
      protein: nutritionData.protein ? Number(nutritionData.protein) : undefined,
      carbs: nutritionData.carbs ? Number(nutritionData.carbs) : undefined,
      fat: nutritionData.fat ? Number(nutritionData.fat) : undefined
    }

    onSubmitNutrition(newRecord)
    onClose()
    setNutritionData({
      mealType: 'breakfast',
      description: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Health Data</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="sleep">
            <form onSubmit={handleSleepSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bedtime</label>
                <Input
                  type="time"
                  value={sleepData.bedtime}
                  onChange={(e) => setSleepData(prev => ({ ...prev, bedtime: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Wake Time</label>
                <Input
                  type="time"
                  value={sleepData.wakeTime}
                  onChange={(e) => setSleepData(prev => ({ ...prev, wakeTime: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Sleep Quality</label>
                <div className="flex space-x-2 mt-1">
                  {[1, 2, 3, 4, 5].map((quality) => (
                    <Button
                      key={quality}
                      type="button"
                      size="sm"
                      variant={sleepData.quality === quality ? 'default' : 'outline'}
                      onClick={() => setSleepData(prev => ({ ...prev, quality: quality as 1 | 2 | 3 | 4 | 5 }))}
                    >
                      {'★'.repeat(quality)}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Sleep
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="exercise">
            <form onSubmit={handleExerciseSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Exercise Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={exerciseData.type}
                  onChange={(e) => setExerciseData(prev => ({ ...prev, type: e.target.value as ExerciseRecord['type'] }))}
                >
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="swimming">Swimming</option>
                  <option value="strength">Strength Training</option>
                  <option value="yoga">Yoga</option>
                  <option value="walking">Walking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={exerciseData.duration}
                  onChange={(e) => setExerciseData(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Intensity</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={exerciseData.intensity}
                  onChange={(e) => setExerciseData(prev => ({ ...prev, intensity: e.target.value as ExerciseRecord['intensity'] }))}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Calories (optional)</label>
                <Input
                  type="number"
                  placeholder="250"
                  value={exerciseData.calories}
                  onChange={(e) => setExerciseData(prev => ({ ...prev, calories: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Workout Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-md text-sm"
                  onChange={(e) => {
                    handleImageUpload(
                      e,
                      (compressedImage) => {
                        setExerciseData(prev => ({ ...prev, image: compressedImage }))
                        addToast({
                          type: 'success',
                          message: 'Image uploaded and compressed successfully!'
                        })
                      },
                      (error) => {
                        addToast({
                          type: 'error',
                          title: 'Upload Error',
                          message: error
                        })
                      }
                    )
                  }}
                />
                {exerciseData.image && (
                  <div className="mt-2">
                    <img 
                      src={exerciseData.image} 
                      alt="Workout preview" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Exercise
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="nutrition">
            <form onSubmit={handleNutritionSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Meal Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={nutritionData.mealType}
                  onChange={(e) => setNutritionData(prev => ({ ...prev, mealType: e.target.value as NutritionRecord['mealType'] }))}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="e.g., Grilled chicken salad"
                  value={nutritionData.description}
                  onChange={(e) => setNutritionData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Calories</label>
                  <Input
                    type="number"
                    placeholder="400"
                    value={nutritionData.calories}
                    onChange={(e) => setNutritionData(prev => ({ ...prev, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Protein (g)</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={nutritionData.protein}
                    onChange={(e) => setNutritionData(prev => ({ ...prev, protein: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Nutrition
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
