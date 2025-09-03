'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AppState, JournalEntry, Book, Movie } from '@/types'
import { formatDate } from '@/lib/utils'
import { BookOpen, Film, PenTool, Plus, Calendar, Star, Edit2, Trash2 } from 'lucide-react'
import { GratitudeLog } from '../gratitude/gratitude-log'

interface LifestyleViewProps {
  data: AppState
  onDataUpdate: (data: AppState) => void
  onAddJournalEntry?: () => void
  onJournalEdit?: (entry: JournalEntry) => void
  onJournalDelete?: (entryId: string) => void
  onAddBook?: () => void
  onAddMovie?: () => void
}

export function LifestyleView({ data, onDataUpdate, onAddJournalEntry, onJournalEdit, onJournalDelete, onAddBook, onAddMovie }: LifestyleViewProps) {
  const [activeTab, setActiveTab] = useState('journal')

  const handleAddJournalEntry = () => {
    onAddJournalEntry?.()
  }

  const handleAddBook = () => {
    onAddBook?.()
  }

  const handleAddMovie = () => {
    onAddMovie?.()
  }

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄']
    return emojis[mood - 1] || '😐'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'reading':
      case 'watching':
        return 'bg-blue-100 text-blue-700'
      case 'to_read':
      case 'to_watch':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="journal" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>Journal Entries</span>
              </CardTitle>
              <Button onClick={handleAddJournalEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.journalEntries.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {entry.title && (
                            <h4 className="font-medium text-lg mb-2">{entry.title}</h4>
                          )}
                          <p className="text-muted-foreground text-sm mb-2">
                            {entry.content}
                          </p>
                          
                          {/* Display journal entry image if available */}
                          {entry.image && (
                            <div className="mt-3 mb-3">
                              <img
                                src={entry.image}
                                alt="Journal entry"
                                className="w-full max-w-xs sm:max-w-sm h-32 sm:h-48 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          <Badge variant="outline">{entry.mood}/5</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.date)}</span>
                        </div>
                        
                        {entry.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {entry.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-3 mt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => onJournalEdit?.(entry)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-2"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this journal entry?')) {
                              onJournalDelete?.(entry.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.journalEntries.length === 0 && (
                <div className="text-center py-8">
                  <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No journal entries yet</p>
                  <Button onClick={handleAddJournalEntry}>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gratitude" className="mt-6">
          <GratitudeLog
            gratitudeEntries={data.gratitudeEntries}
            onAddEntry={(entry) => {
              const newEntry = { ...entry, id: Date.now().toString() }
              onDataUpdate({
                ...data,
                gratitudeEntries: [newEntry, ...data.gratitudeEntries]
              })
            }}
            onUpdateEntry={(entry) => {
              const updated = data.gratitudeEntries.map(e => e.id === entry.id ? entry : e)
              onDataUpdate({ ...data, gratitudeEntries: updated })
            }}
          />
        </TabsContent>
        
        
        <TabsContent value="books" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Reading List</span>
              </CardTitle>
              <Button onClick={handleAddBook}>
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.books.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{book.title}</h4>
                          <p className="text-muted-foreground">by {book.author}</p>
                        </div>
                        <Badge className={getStatusColor(book.status)}>
                          {book.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {book.status === 'reading' && book.currentPage && book.totalPages && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {book.currentPage} / {book.totalPages} pages
                            </span>
                          </div>
                          <Progress value={(book.currentPage / book.totalPages) * 100} />
                        </div>
                      )}
                      
                      {book.rating && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <div className="flex">{renderStars(book.rating)}</div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {book.startedAt && (
                          <span>Started: {formatDate(book.startedAt)}</span>
                        )}
                        {book.completedAt && (
                          <span>Completed: {formatDate(book.completedAt)}</span>
                        )}
                      </div>
                      
                      {book.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{book.notes}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.books.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No books tracked yet</p>
                  <Button onClick={handleAddBook}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Book
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="movies" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Film className="h-5 w-5" />
                <span>Watchlist</span>
              </CardTitle>
              <Button onClick={handleAddMovie}>
                <Plus className="h-4 w-4 mr-2" />
                Add Movie
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.movies.map((movie) => (
                  <Card key={movie.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{movie.title}</h4>
                          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                            {movie.director && <span>Directed by {movie.director}</span>}
                            {movie.year && <span>({movie.year})</span>}
                          </div>
                        </div>
                        <Badge className={getStatusColor(movie.status)}>
                          {movie.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {movie.rating && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <div className="flex">{renderStars(movie.rating)}</div>
                        </div>
                      )}
                      
                      {movie.watchedAt && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>Watched: {formatDate(movie.watchedAt)}</span>
                        </div>
                      )}
                      
                      {movie.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          "{movie.notes}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.movies.length === 0 && (
                <div className="text-center py-8">
                  <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No movies tracked yet</p>
                  <Button onClick={handleAddMovie}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Movie
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
