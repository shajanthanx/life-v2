'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Movie } from '@/types'

interface AddMovieModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (movie: Omit<Movie, 'id'>) => void
}

export function AddMovieModal({ isOpen, onClose, onSubmit }: AddMovieModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    genre: '',
    releaseYear: '',
    rating: 0 as 0 | 1 | 2 | 3 | 4 | 5,
    status: 'want-to-watch' as Movie['status'],
    dateWatched: '',
    notes: '',
    image: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a movie title')
      return
    }

    const newMovie: Omit<Movie, 'id'> = {
      title: formData.title,
      director: formData.director || undefined,
      genre: formData.genre || undefined,
      releaseYear: formData.releaseYear ? Number(formData.releaseYear) : undefined,
      rating: formData.rating || undefined,
      status: formData.status,
      dateWatched: formData.dateWatched ? new Date(formData.dateWatched) : undefined,
      notes: formData.notes || undefined,
      image: formData.image || undefined,
      createdAt: new Date()
    }

    onSubmit(newMovie)
    onClose()
    setFormData({
      title: '',
      director: '',
      genre: '',
      releaseYear: '',
      rating: 0,
      status: 'want-to-watch',
      dateWatched: '',
      notes: '',
      image: ''
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Movie</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Movie Title</label>
            <Input
              placeholder="e.g., The Shawshank Redemption"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Director</label>
              <Input
                placeholder="e.g., Frank Darabont"
                value={formData.director}
                onChange={(e) => setFormData(prev => ({ ...prev, director: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Release Year</label>
              <Input
                type="number"
                placeholder="1994"
                value={formData.releaseYear}
                onChange={(e) => setFormData(prev => ({ ...prev, releaseYear: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Genre</label>
            <Input
              placeholder="e.g., Drama, Action, Comedy"
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Movie['status'] }))}
            >
              <option value="want-to-watch">Want to Watch</option>
              <option value="watching">Currently Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          {(formData.status === 'completed' || formData.status === 'dropped') && (
            <>
              <div>
                <label className="text-sm font-medium">Date Watched</label>
                <Input
                  type="date"
                  value={formData.dateWatched}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateWatched: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex space-x-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      size="sm"
                      variant={formData.rating >= star ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star as 1 | 2 | 3 | 4 | 5 }))}
                    >
                      ⭐
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, rating: 0 }))}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">Movie Poster/Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1"
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Movie poster preview" 
                  className="w-20 h-28 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Your thoughts, review, or notes about this movie..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Movie
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
