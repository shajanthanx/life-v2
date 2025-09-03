'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Memory } from '@/types'
import { formatDate } from '@/lib/utils'
import { Heart, Camera, MapPin, Plus, Calendar, Tag } from 'lucide-react'
import { uploadMemoryImage } from '@/lib/image-utils'
import { useToast } from '@/components/ui/use-toast'

interface MemoriesViewProps {
  memories: Memory[]
  onAddMemory: (memory: Omit<Memory, 'id'>) => void
  onUpdateMemory: (memory: Memory) => void
}

export function MemoriesView({ memories, onAddMemory, onUpdateMemory }: MemoriesViewProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as string[],
    location: '',
    tags: [] as string[],
    isSpecial: false
  })

  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || formData.images.length === 0) {
      alert('Please enter a title and at least one image')
      return
    }

    const newMemory: Omit<Memory, 'id'> = {
      title: formData.title,
      description: formData.description || undefined,
      images: formData.images,
      date: new Date(),
      location: formData.location || undefined,
      tags: formData.tags,
      isSpecial: formData.isSpecial
    }

    onAddMemory(newMemory)
    setShowAddModal(false)
    setFormData({
      title: '',
      description: '',
      images: [],
      location: '',
      tags: [],
      isSpecial: false
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = files.map(file => uploadMemoryImage(file))
      const results = await Promise.all(uploadPromises)
      
      const successfulUploads = results.filter(result => result.url && !result.error)
      const errors = results.filter(result => result.error)
      
      if (successfulUploads.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...successfulUploads.map(result => result.url!)]
        }))
        addToast({
          type: 'success',
          message: `${successfulUploads.length} image(s) uploaded successfully!`
        })
      }
      
      if (errors.length > 0) {
        addToast({
          type: 'error',
          title: 'Upload Error',
          message: `Failed to upload ${errors.length} image(s)`
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: 'Failed to upload images'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const specialMemories = memories.filter(m => m.isSpecial)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Memories
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Capture and preserve your special moments
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{memories.length}</div>
              <div className="text-sm text-muted-foreground">Total Memories</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{specialMemories.length}</div>
              <div className="text-sm text-muted-foreground">Special Moments</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {memories.reduce((acc, m) => acc + m.images.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
          </div>

          {/* Memories Grid */}
          {memories.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Creating Memories</h3>
              <p className="text-muted-foreground mb-4">
                Capture your special moments, achievements, and experiences
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Heart className="h-4 w-4 mr-2" />
                Add First Memory
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMemories.map((memory) => (
                <Card 
                  key={memory.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedMemory(memory)}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={memory.images[0]} 
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                    {memory.isSpecial && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-xs">
                          ⭐ Special
                        </Badge>
                      </div>
                    )}
                    {memory.images.length > 1 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          +{memory.images.length - 1} more
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{memory.title}</h3>
                    {memory.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {memory.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(memory.date)}
                      {memory.location && (
                        <>
                          <MapPin className="h-3 w-3 ml-2" />
                          {memory.location}
                        </>
                      )}
                    </div>
                    {memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {memory.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {memory.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{memory.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Memory Modal */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMemory?.isSpecial && <span>⭐</span>}
              {selectedMemory?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMemory && (
            <div className="space-y-4">
              {/* Images Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedMemory.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${selectedMemory.title} ${index + 1}`}
                    className="w-full aspect-square object-cover rounded border"
                  />
                ))}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedMemory.date)}
                  </div>
                  {selectedMemory.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedMemory.location}
                    </div>
                  )}
                </div>

                {selectedMemory.description && (
                  <p className="text-sm">{selectedMemory.description}</p>
                )}

                {selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedMemory.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Memory Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Memory</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Memory Title</label>
              <Input
                placeholder="e.g., Graduation Day, Family Vacation"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm min-h-[80px]"
                placeholder="Describe this special moment..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full p-2 border rounded-md text-sm"
                onChange={handleImageUpload}
                required={formData.images.length === 0}
              />
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full aspect-square object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Location (optional)</label>
              <Input
                placeholder="e.g., Paris, Home, Beach"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex space-x-2 mt-1">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isSpecial"
                checked={formData.isSpecial}
                onChange={(e) => setFormData(prev => ({ ...prev, isSpecial: e.target.checked }))}
              />
              <label htmlFor="isSpecial" className="text-sm font-medium">
                ⭐ Mark as special memory
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Memory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
