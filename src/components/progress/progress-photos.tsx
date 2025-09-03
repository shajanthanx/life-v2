'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ProgressPhoto } from '@/types'
import { formatDate } from '@/lib/utils'
import { Camera, Calendar, TrendingUp, Plus } from 'lucide-react'
import { uploadProgressPhoto } from '@/lib/image-utils'
import { useToast } from '@/components/ui/use-toast'

interface ProgressPhotosProps {
  photos: ProgressPhoto[]
  onAddPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void
  onUpdatePhoto: (photo: ProgressPhoto) => void
}

export function ProgressPhotos({ photos, onAddPhoto, onUpdatePhoto }: ProgressPhotosProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    image: '',
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    notes: ''
  })
  
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image) {
      alert('Please select a photo')
      return
    }

    const newPhoto: Omit<ProgressPhoto, 'id'> = {
      image: formData.image,
      date: new Date(),
      weight: formData.weight ? Number(formData.weight) : undefined,
      bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : undefined,
      muscleMass: formData.muscleMass ? Number(formData.muscleMass) : undefined,
      notes: formData.notes || undefined
    }

    onAddPhoto(newPhoto)
    setShowAddModal(false)
    setFormData({
      image: '',
      weight: '',
      bodyFatPercentage: '',
      muscleMass: '',
      notes: ''
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const result = await uploadProgressPhoto(file)
        if (result.error) {
          addToast({
            type: 'error',
            title: 'Upload Error',
            message: result.error
          })
        } else if (result.url) {
          setFormData(prev => ({ ...prev, image: result.url! }))
          addToast({
            type: 'success',
            message: 'Photo uploaded successfully!'
          })
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Upload Error',
          message: 'Failed to upload photo'
        })
      } finally {
        setUploading(false)
      }
    }
  }

  const sortedPhotos = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const weeksSinceStart = sortedPhotos.length > 0 ? 
    Math.ceil((new Date().getTime() - new Date(sortedPhotos[sortedPhotos.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Progress Photos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your transformation with weekly progress photos
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{photos.length}</div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{weeksSinceStart}</div>
              <div className="text-sm text-muted-foreground">Weeks Tracked</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {photos.length > 1 && photos[0].weight && photos[photos.length - 1].weight
                  ? `${(photos[0].weight - photos[photos.length - 1].weight).toFixed(1)}`
                  : '—'}
              </div>
              <div className="text-sm text-muted-foreground">Weight Change (lbs)</div>
            </div>
          </div>

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Progress Journey</h3>
              <p className="text-muted-foreground mb-4">
                Take your first progress photo to begin tracking your transformation
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Camera className="h-4 w-4 mr-2" />
                Take First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPhotos.map((photo, index) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={photo.image} 
                      alt={`Progress photo from ${formatDate(photo.date)}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        Week {photos.length - index}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(photo.date)}
                    </div>
                    {photo.weight && (
                      <div className="text-sm">
                        <strong>{photo.weight} lbs</strong>
                      </div>
                    )}
                    {photo.bodyFatPercentage && (
                      <div className="text-xs text-muted-foreground">
                        {photo.bodyFatPercentage}% body fat
                      </div>
                    )}
                    {photo.notes && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {photo.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Photo Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Progress Photo</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Progress Photo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded-md text-sm"
                onChange={handleImageUpload}
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Progress photo preview" 
                    className="w-32 h-40 object-cover rounded border mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Weight (lbs)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="150.0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Body Fat %</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15.0"
                  value={formData.bodyFatPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, bodyFatPercentage: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Muscle Mass (lbs)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="120.0"
                value={formData.muscleMass}
                onChange={(e) => setFormData(prev => ({ ...prev, muscleMass: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm min-h-[60px]"
                placeholder="How are you feeling? Any changes you notice?"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="text-blue-800">
                📸 <strong>Tip:</strong> Take photos in the same lighting, pose, and clothing 
                each week for the most accurate progress comparison!
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Photo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
