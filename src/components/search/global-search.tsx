'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppState } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  Search, 
  Target, 
  CheckSquare, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Eye,
  Gift,
  TrendingDown,
  X
} from 'lucide-react'

interface GlobalSearchProps {
  data: AppState
  onNavigate: (tab: string, subtab?: string) => void
  isOpen: boolean
  onClose: () => void
}

type SearchResult = {
  id: string
  type: string
  title: string
  description: string
  category?: string
  date?: Date
  value?: number
  tab: string
  subtab?: string
  icon: any
}

export function GlobalSearch({ data, onNavigate, isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    // Search Goals
    data.goals?.forEach(goal => {
      if (goal.title.toLowerCase().includes(searchTerm) || 
          goal.description?.toLowerCase().includes(searchTerm) ||
          goal.category.toLowerCase().includes(searchTerm)) {
        results.push({
          id: goal.id,
          type: 'Goal',
          title: goal.title,
          description: goal.description || `${goal.currentValue}/${goal.targetValue} ${goal.unit}`,
          category: goal.category,
          date: goal.deadline,
          tab: 'productivity',
          subtab: 'goals',
          icon: Target
        })
      }
    })

    // Search Tasks
    data.tasks?.forEach(task => {
      if (task.title.toLowerCase().includes(searchTerm) || 
          task.description?.toLowerCase().includes(searchTerm) ||
          task.category.toLowerCase().includes(searchTerm)) {
        results.push({
          id: task.id,
          type: 'Task',
          title: task.title,
          description: task.description || `${task.category} task`,
          category: task.category,
          date: task.dueDate,
          tab: 'productivity',
          subtab: 'tasks',
          icon: CheckSquare
        })
      }
    })

    // Search Habits
    data.habits?.forEach(habit => {
      if (habit.name.toLowerCase().includes(searchTerm) || 
          habit.description?.toLowerCase().includes(searchTerm) ||
          habit.category.toLowerCase().includes(searchTerm)) {
        results.push({
          id: habit.id,
          type: 'Habit',
          title: habit.name,
          description: habit.description || `${habit.category} habit`,
          category: habit.category,
          tab: 'productivity',
          subtab: 'habits',
          icon: CheckSquare
        })
      }
    })

    // Search Transactions
    data.transactions?.forEach(transaction => {
      if (transaction.description.toLowerCase().includes(searchTerm) || 
          transaction.category.toLowerCase().includes(searchTerm)) {
        results.push({
          id: transaction.id,
          type: 'Transaction',
          title: transaction.description,
          description: `${transaction.type} of ${formatCurrency(transaction.amount)}`,
          category: transaction.category,
          date: transaction.date,
          value: transaction.amount,
          tab: 'finance',
          subtab: 'transactions',
          icon: DollarSign
        })
      }
    })

    // Search Journal Entries
    data.journalEntries?.forEach(entry => {
      if (entry.title?.toLowerCase().includes(searchTerm) || 
          entry.content.toLowerCase().includes(searchTerm)) {
        results.push({
          id: entry.id,
          type: 'Journal',
          title: entry.title || 'Journal Entry',
          description: entry.content.substring(0, 100) + '...',
          date: entry.date,
          tab: 'lifestyle',
          subtab: 'journal',
          icon: BookOpen
        })
      }
    })

    // Search Books
    data.books?.forEach(book => {
      if (book.title.toLowerCase().includes(searchTerm) || 
          book.author.toLowerCase().includes(searchTerm)) {
        results.push({
          id: book.id,
          type: 'Book',
          title: book.title,
          description: `by ${book.author} - ${book.currentPage}/${book.totalPages} pages`,
          date: book.startDate,
          tab: 'lifestyle',
          subtab: 'books',
          icon: BookOpen
        })
      }
    })

    // Search Visualizations
    data.visualizations?.forEach(viz => {
      if (viz.title.toLowerCase().includes(searchTerm) || 
          viz.description?.toLowerCase().includes(searchTerm) ||
          viz.category.toLowerCase().includes(searchTerm)) {
        results.push({
          id: viz.id,
          type: 'Vision',
          title: viz.title,
          description: viz.description || `${viz.progress}% progress`,
          category: viz.category,
          date: viz.targetDate,
          tab: 'visualization',
          icon: Eye
        })
      }
    })

    // Search Gifts
    data.gifts?.forEach(gift => {
      if (gift.recipientName.toLowerCase().includes(searchTerm) || 
          gift.giftIdea.toLowerCase().includes(searchTerm) ||
          gift.occasion.toLowerCase().includes(searchTerm)) {
        results.push({
          id: gift.id,
          type: 'Gift',
          title: `${gift.giftIdea} for ${gift.recipientName}`,
          description: `${gift.occasion} - ${formatCurrency(gift.budget)} budget`,
          category: gift.relationship,
          date: gift.eventDate,
          tab: 'gifts',
          subtab: 'gifts',
          icon: Gift
        })
      }
    })

    // Search Bad Habits
    data.badHabits?.forEach(habit => {
      if (habit.name.toLowerCase().includes(searchTerm) || 
          habit.description?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: habit.id,
          type: 'Bad Habit',
          title: habit.name,
          description: habit.description || 'Bad habit tracking',
          tab: 'lifestyle',
          subtab: 'badhabits',
          icon: TrendingDown
        })
      }
    })

    // Search Gratitude Entries
    data.gratitudeEntries?.forEach(entry => {
      entry.entries.forEach((gratitudeItem, index) => {
        if (gratitudeItem.toLowerCase().includes(searchTerm)) {
          results.push({
            id: `${entry.id}-${index}`,
            type: 'Gratitude',
            title: gratitudeItem,
            description: `Mood: ${entry.mood}/5 on ${formatDate(entry.date)}`,
            date: entry.date,
            tab: 'lifestyle',
            subtab: 'gratitude',
            icon: Heart
          })
        }
      })
    })

    // Sort by relevance (exact matches first, then partial matches)
    return results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm ? 1 : 0
      const bExact = b.title.toLowerCase() === searchTerm ? 1 : 0
      return bExact - aExact
    }).slice(0, 20) // Limit to top 20 results
  }, [query, data])

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.tab, result.subtab)
    onClose()
    setQuery('')
  }

  const handleClose = () => {
    onClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3 p-4 border-b">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search goals, tasks, habits, transactions, journal entries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-none focus:ring-0 text-lg"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {query.trim() && (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1 p-2">
                  {searchResults.map((result) => {
                    const Icon = result.icon
                    return (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{result.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {result.category && (
                              <Badge variant="secondary" className="text-xs">
                                {result.category}
                              </Badge>
                            )}
                            {result.date && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(result.date)}
                              </span>
                            )}
                            {result.value && (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(result.value)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm">Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Search across all your data</p>
              <p className="text-sm">Goals, tasks, habits, transactions, and more...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
