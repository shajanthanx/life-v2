'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ProgressPhoto } from '@/types'
import { formatDate } from '@/lib/utils'
import { Camera, Calendar, TrendingUp, Plus, Trash2, Eye } from 'lucide-react'
import { uploadProgressPhoto } from '@/lib/image-utils'
import { getSignedUrl, STORAGE_BUCKETS } from '@/lib/storage-service'
import { useToast } from '@/hooks/use-toast'

interface ProgressPhotosProps {
  photos: ProgressPhoto[]
  onAddPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void
  onUpdatePhoto: (photo: ProgressPhoto) => void
  onDeletePhoto: (id: string) => void
}

export function ProgressPhotos({ photos, onAddPhoto, onUpdatePhoto, onDeletePhoto }: ProgressPhotosProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    image: '',
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    notes: ''
  })

  const [uploading, setUploading] = useState(false)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [previewPhoto, setPreviewPhoto] = useState<ProgressPhoto | null>(null)
  const { addToast } = useToast()

  // Generate signed URLs for all photos
  useEffect(() => {
    const generateSignedUrls = async () => {
      const urls: Record<string, string> = {}
      for (const photo of photos) {
        if (photo.image) {
          const result = await getSignedUrl(STORAGE_BUCKETS.PROGRESS_PHOTOS, photo.image, 3600)
          if (result.url) {
            urls[photo.id] = result.url
          }
        }
      }
      setSignedUrls(urls)
    }

    if (photos.length > 0) {
      generateSignedUrls()
    }
  }, [photos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image || formData.image.trim() === '') {
      addToast({
        type: 'error',
        title: 'Image Required',
        message: 'Please upload a photo first'
      })
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
        } else if (result.path) {
          // Store the path, not the URL - we'll generate signed URLs when displaying
          setFormData(prev => ({ ...prev, image: result.path! }))
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
                  <div className="aspect-[3/4] relative group">
                    {signedUrls[photo.id] ? (
                      <img
                        src={signedUrls[photo.id]}
                        alt={`Progress photo from ${formatDate(photo.date)}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        Week {photos.length - index}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        aria-label="Preview photo"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this progress photo?')) {
                            onDeletePhoto(photo.id)
                          }
                        }}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

      {/* Preview Modal */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Progress Photo - {previewPhoto && formatDate(previewPhoto.date)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewPhoto && signedUrls[previewPhoto.id] && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <img
                    src={signedUrls[previewPhoto.id]}
                    alt={`Progress photo from ${formatDate(previewPhoto.date)}`}
                    className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
                  />
                </div>
                <div className="w-full md:w-64 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-lg font-semibold">{formatDate(previewPhoto.date)}</p>
                  </div>
                  {previewPhoto.weight && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weight</p>
                      <p className="text-lg font-semibold">{previewPhoto.weight} lbs</p>
                    </div>
                  )}
                  {previewPhoto.bodyFatPercentage && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Body Fat</p>
                      <p className="text-lg font-semibold">{previewPhoto.bodyFatPercentage}%</p>
                    </div>
                  )}
                  {previewPhoto.muscleMass && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Muscle Mass</p>
                      <p className="text-lg font-semibold">{previewPhoto.muscleMass} lbs</p>
                    </div>
                  )}
                  {previewPhoto.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm">{previewPhoto.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewPhoto(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
