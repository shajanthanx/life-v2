'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Book } from '@/types'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (book: Omit<Book, 'id'>) => void
}

export function AddBookModal({ isOpen, onClose, onSubmit }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    totalPages: '',
    currentPage: '',
    rating: 0 as 0 | 1 | 2 | 3 | 4 | 5,
    status: 'want-to-read' as Book['status'],
    dateStarted: '',
    dateFinished: '',
    notes: '',
    image: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Please enter book title and author')
      return
    }

    const newBook: Omit<Book, 'id'> = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre || undefined,
      totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
      currentPage: formData.currentPage ? Number(formData.currentPage) : 0,
      rating: formData.rating || undefined,
      status: formData.status,
      dateStarted: formData.dateStarted ? new Date(formData.dateStarted) : undefined,
      dateFinished: formData.dateFinished ? new Date(formData.dateFinished) : undefined,
      notes: formData.notes || undefined,
      image: formData.image || undefined,
      createdAt: new Date()
    }

    onSubmit(newBook)
    onClose()
    setFormData({
      title: '',
      author: '',
      genre: '',
      totalPages: '',
      currentPage: '',
      rating: 0,
      status: 'want-to-read',
      dateStarted: '',
      dateFinished: '',
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

  const progressPercentage = formData.totalPages && formData.currentPage 
    ? Math.round((Number(formData.currentPage) / Number(formData.totalPages)) * 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Book Title</label>
            <Input
              placeholder="e.g., The Great Gatsby"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Author</label>
            <Input
              placeholder="e.g., F. Scott Fitzgerald"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Genre</label>
            <Input
              placeholder="e.g., Fiction, Science Fiction, Biography"
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Book['status'] }))}
            >
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Total Pages</label>
              <Input
                type="number"
                placeholder="300"
                value={formData.totalPages}
                onChange={(e) => setFormData(prev => ({ ...prev, totalPages: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Page</label>
              <Input
                type="number"
                placeholder="150"
                value={formData.currentPage}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPage: e.target.value }))}
              />
            </div>
          </div>

          {progressPercentage > 0 && (
            <div className="p-2 bg-muted rounded-lg text-sm">
              <p><strong>Reading Progress:</strong> {progressPercentage}% complete</p>
            </div>
          )}

          {formData.status === 'reading' && (
            <div>
              <label className="text-sm font-medium">Date Started</label>
              <Input
                type="date"
                value={formData.dateStarted}
                onChange={(e) => setFormData(prev => ({ ...prev, dateStarted: e.target.value }))}
              />
            </div>
          )}

          {(formData.status === 'completed' || formData.status === 'dropped') && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Date Started</label>
                  <Input
                    type="date"
                    value={formData.dateStarted}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateStarted: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date Finished</label>
                  <Input
                    type="date"
                    value={formData.dateFinished}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateFinished: e.target.value }))}
                  />
                </div>
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
            <label className="text-sm font-medium">Book Cover</label>
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
                  alt="Book cover preview" 
                  className="w-16 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              placeholder="Your thoughts, quotes, or notes about this book..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
