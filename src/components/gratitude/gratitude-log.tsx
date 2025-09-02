'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GratitudeEntry } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Heart, Star, Calendar, Smile, TrendingUp, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface GratitudeLogProps {
  gratitudeEntries: GratitudeEntry[]
  onAddEntry: (entry: Omit<GratitudeEntry, 'id'>) => void
  onUpdateEntry: (entry: GratitudeEntry) => void
}

export function GratitudeLog({ gratitudeEntries, onAddEntry, onUpdateEntry }: GratitudeLogProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    entries: ['', '', ''],
    mood: 3 as 1 | 2 | 3 | 4 | 5,
    notes: ''
  })

  const handleAddEntry = () => {
    const validEntries = newEntry.entries.filter(entry => entry.trim() !== '')
    if (validEntries.length === 0) return

    onAddEntry({
      date: new Date(),
      entries: validEntries,
      mood: newEntry.mood,
      notes: newEntry.notes || undefined
    })

    setNewEntry({
      entries: ['', '', ''],
      mood: 3,
      notes: ''
    })
    setIsAddingEntry(false)
  }

  const updateEntryText = (index: number, value: string) => {
    const updatedEntries = [...newEntry.entries]
    updatedEntries[index] = value
    setNewEntry(prev => ({ ...prev, entries: updatedEntries }))
  }

  // Calculate statistics
  const avgMood = (gratitudeEntries || []).length > 0 
    ? (gratitudeEntries || []).reduce((acc, entry) => acc + entry.mood, 0) / (gratitudeEntries || []).length
    : 0

  const totalGratitudeItems = (gratitudeEntries || []).reduce((acc, entry) => acc + entry.entries.length, 0)
  
  const currentStreak = (() => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasEntry = (gratitudeEntries || []).some(entry => 
        new Date(entry.date).toDateString() === checkDate.toDateString()
      )
      
      if (hasEntry) {
        streak++
      } else if (i > 0) { // Allow missing today if checking current streak
        break
      }
    }
    
    return streak
  })()

  // Mood trend data (last 30 days)
  const moodTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    
    const entry = (gratitudeEntries || []).find(e => 
      new Date(e.date).toDateString() === date.toDateString()
    )
    
    return {
      day: i + 1,
      date: date.getDate(),
      mood: entry ? entry.mood : null,
      hasEntry: !!entry
    }
  }).filter(item => item.mood !== null)

  // Weekly mood analysis
  const weeklyMoodData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    
    const dayEntries = (gratitudeEntries || []).filter(entry => 
      new Date(entry.date).toDateString() === date.toDateString()
    )
    
    const avgDayMood = dayEntries.length > 0 
      ? dayEntries.reduce((acc, entry) => acc + entry.mood, 0) / dayEntries.length
      : 0
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      mood: avgDayMood,
      count: dayEntries.length
    }
  })

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄']
    return emojis[mood - 1] || '😐'
  }

  const getMoodLabel = (mood: number) => {
    const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
    return labels[mood - 1] || 'Neutral'
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-600'
    if (mood >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Common gratitude themes
  const gratitudeThemes = (gratitudeEntries || [])
    .flatMap(entry => entry.entries)
    .reduce((acc, item) => {
      // Simple keyword analysis
      const keywords = ['family', 'friends', 'health', 'work', 'home', 'food', 'nature', 'love', 'success', 'learning']
      keywords.forEach(keyword => {
        if (item.toLowerCase().includes(keyword)) {
          acc[keyword] = (acc[keyword] || 0) + 1
        }
      })
      return acc
    }, {} as Record<string, number>)

  const topThemes = Object.entries(gratitudeThemes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gratitude Journal</h2>
          <p className="text-muted-foreground">Practice daily gratitude to boost happiness and wellbeing</p>
        </div>
        <Button onClick={() => setIsAddingEntry(true)} disabled={isAddingEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{(gratitudeEntries || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Smile className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
                <p className="text-2xl font-bold">{avgMood.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">out of 5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Gratitude Items</p>
                <p className="text-2xl font-bold">{totalGratitudeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      {isAddingEntry && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Today's Gratitude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">What are you grateful for today?</label>
              <div className="space-y-2 mt-2">
                {newEntry.entries.map((entry, index) => (
                  <Input
                    key={index}
                    placeholder={`Gratitude item ${index + 1}`}
                    value={entry}
                    onChange={(e) => updateEntryText(index, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">How are you feeling? {getMoodEmoji(newEntry.mood)}</label>
              <div className="flex space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <Button
                    key={mood}
                    size="sm"
                    variant={newEntry.mood === mood ? 'default' : 'outline'}
                    onClick={() => setNewEntry(prev => ({ ...prev, mood: mood as 1 | 2 | 3 | 4 | 5 }))}
                  >
                    {getMoodEmoji(mood)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Additional notes (optional)</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm mt-1"
                rows={3}
                placeholder="Any additional thoughts or reflections..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddEntry}>Save Entry</Button>
              <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip 
                    formatter={(value) => [getMoodLabel(Number(value)), 'Mood']}
                    labelFormatter={(value) => `Day ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mood Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyMoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip formatter={(value) => [getMoodLabel(Number(value)), 'Avg Mood']} />
                  <Bar dataKey="mood" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gratitude Themes */}
      {topThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Gratitude Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topThemes.map(([theme, count]) => (
                <Badge key={theme} variant="outline" className="text-sm">
                  {theme} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(gratitudeEntries || []).slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatDate(entry.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <Badge className={getMoodColor(entry.mood)}>
                      {getMoodLabel(entry.mood)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {entry.entries.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                
                {entry.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm italic text-muted-foreground">"{entry.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(gratitudeEntries || []).length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start your gratitude journey</h3>
              <p className="text-muted-foreground mb-4">
                Begin by recording what you're grateful for today
              </p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspiration */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">💫 Daily Inspiration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              "Gratitude turns what we have into enough, and more. It turns denial into acceptance, 
              chaos into order, confusion into clarity... it makes sense of our past, brings peace 
              for today, and creates a vision for tomorrow."
            </p>
            <p className="text-xs text-muted-foreground">- Melody Beattie</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
