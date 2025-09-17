'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { LoadingOverlay } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { Plus, Calendar, Clock, CheckCircle2, Trash2, Edit2, Bell, BellOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Note, createNote, updateNote, deleteNote, getUserNotes } from '@/lib/api/notes'

interface NotesPageProps {
  isLoading?: boolean
}

export function NotesPage({ isLoading = false }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteReminder, setNewNoteReminder] = useState('')
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    const { data, error } = await getUserNotes()
    if (error) {
      addToast({
        title: 'Error',
        message: error,
        type: 'error'
      })
    } else {
      setNotes(data)
    }
  }

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Please enter note content',
        type: 'error'
      })
      return
    }

    setOperationLoading('create')
    try {
      const noteData = {
        content: newNoteContent,
        reminderDate: newNoteReminder ? new Date(newNoteReminder) : undefined,
        isCompleted: false
      }

      const { data, error } = await createNote(noteData)
      if (error) {
        addToast({
          title: 'Error',
          message: error,
          type: 'error'
        })
      } else {
        setNotes(prev => [data!, ...prev])
        setNewNoteContent('')
        setNewNoteReminder('')
        setShowAddNote(false)
        addToast({
          title: 'Success',
          message: 'Note created successfully',
          type: 'success'
        })
      }
    } finally {
      setOperationLoading(null)
    }
  }

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    setOperationLoading(noteId)
    try {
      const { data, error } = await updateNote(noteId, updates)
      if (error) {
        addToast({
          title: 'Error',
          message: error,
          type: 'error'
        })
      } else {
        setNotes(prev => prev.map(note => note.id === noteId ? data! : note))
        setEditingNote(null)
        addToast({
          title: 'Success',
          message: 'Note updated successfully',
          type: 'success'
        })
      }
    } finally {
      setOperationLoading(null)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setOperationLoading(noteId)
    try {
      const { success, error } = await deleteNote(noteId)
      if (error) {
        addToast({
          title: 'Error',
          message: error,
          type: 'error'
        })
      } else {
        setNotes(prev => prev.filter(note => note.id !== noteId))
        addToast({
          title: 'Success',
          message: 'Note deleted successfully',
          type: 'success'
        })
      }
    } finally {
      setOperationLoading(null)
    }
  }

  const handleToggleComplete = (note: Note) => {
    handleUpdateNote(note.id, { isCompleted: !note.isCompleted })
  }

  const isReminderDue = (reminderDate?: Date) => {
    if (!reminderDate) return false
    return reminderDate <= new Date()
  }

  const pendingNotes = notes.filter(note => !note.isCompleted)
  const completedNotes = notes.filter(note => note.isCompleted)
  const remindersCount = notes.filter(note => 
    note.reminderDate && !note.isCompleted && isReminderDue(note.reminderDate)
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Quick Notes</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Capture your thoughts and set reminders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-4">
          {remindersCount > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <Bell className="h-3 w-3" />
              <span>{remindersCount} reminder{remindersCount > 1 ? 's' : ''}</span>
            </Badge>
          )}
          <Button onClick={() => setShowAddNote(!showAddNote)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <Card>
          <CardHeader>
            <CardTitle>New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  value={newNoteReminder}
                  onChange={(e) => setNewNoteReminder(e.target.value)}
                  className="w-full sm:w-auto"
                />
              </div>
              <div className="flex space-x-2 sm:ml-auto">
                <Button variant="outline" onClick={() => setShowAddNote(false)} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateNote}
                  disabled={operationLoading === 'create'}
                  className="flex-1 sm:flex-none"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <LoadingOverlay isLoading={isLoading}>
        <div className="space-y-6">
          {/* Pending Notes */}
          {pendingNotes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Notes ({pendingNotes.length})</h2>
              <div className="space-y-3">
                {pendingNotes.map((note) => (
                  <Card key={note.id} className={`transition-all ${
                    note.reminderDate && isReminderDue(note.reminderDate) 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={note.isCompleted}
                          onCheckedChange={() => handleToggleComplete(note)}
                          disabled={operationLoading === note.id}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          {editingNote?.id === note.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editingNote.content}
                                onChange={(e) => setEditingNote({
                                  ...editingNote,
                                  content: e.target.value
                                })}
                                rows={2}
                              />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
                                <Input
                                  type="datetime-local"
                                  value={editingNote.reminderDate ? 
                                    editingNote.reminderDate.toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditingNote({
                                    ...editingNote,
                                    reminderDate: e.target.value ? new Date(e.target.value) : undefined
                                  })}
                                  className="w-full sm:w-auto"
                                />
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingNote(null)}
                                    className="flex-1 sm:flex-none"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateNote(note.id, {
                                      content: editingNote.content,
                                      reminderDate: editingNote.reminderDate
                                    })}
                                    disabled={operationLoading === note.id}
                                    className="flex-1 sm:flex-none"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{formatDate(note.createdAt)}</span>
                                  {note.reminderDate && (
                                    <div className={`flex items-center space-x-1 ${
                                      isReminderDue(note.reminderDate) ? 'text-yellow-600 font-medium' : ''
                                    }`}>
                                      {isReminderDue(note.reminderDate) ? 
                                        <Bell className="h-3 w-3" /> : 
                                        <Clock className="h-3 w-3" />
                                      }
                                      <span>{formatDate(note.reminderDate)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingNote(note)}
                                    disabled={operationLoading === note.id}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={operationLoading === note.id}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Notes */}
          {completedNotes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed ({completedNotes.length})</h2>
              <div className="space-y-3">
                {completedNotes.map((note) => (
                  <Card key={note.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={note.isCompleted}
                          onCheckedChange={() => handleToggleComplete(note)}
                          disabled={operationLoading === note.id}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-through text-muted-foreground">{note.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{formatDate(note.createdAt)}</span>
                              <div className="flex items-center space-x-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span>Completed</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={operationLoading === note.id}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {notes.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">Start capturing your thoughts and ideas</p>
                <Button onClick={() => setShowAddNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </LoadingOverlay>
    </div>
  )
}
