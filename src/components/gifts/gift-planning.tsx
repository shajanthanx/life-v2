'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Gift, Event } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Gift as GiftIcon, Calendar, Heart, DollarSign, Users, CheckCircle } from 'lucide-react'

interface GiftPlanningProps {
  gifts: Gift[]
  events: Event[]
  onAddGift: () => void
  onAddEvent: () => void
  onUpdateGift: (gift: Gift) => void
  onUpdateEvent: (event: Event) => void
}

export function GiftPlanning({ gifts, events, onAddGift, onAddEvent, onUpdateGift, onUpdateEvent }: GiftPlanningProps) {
  const [activeTab, setActiveTab] = useState<'gifts' | 'events'>('gifts')

  const upcomingGifts = (gifts || []).filter(gift => new Date(gift.eventDate) > new Date() && gift.status !== 'given')
  const upcomingEvents = (events || []).filter(event => new Date(event.date) > new Date() && event.status !== 'completed')
  
  const totalGiftBudget = (gifts || []).reduce((acc, gift) => acc + gift.budget, 0)
  const totalGiftSpent = (gifts || []).reduce((acc, gift) => acc + gift.spent, 0)
  
  const totalEventBudget = (events || []).reduce((acc, event) => acc + event.budget, 0)
  const totalEventSpent = (events || []).reduce((acc, event) => acc + event.spent, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-700'
      case 'purchased':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'given':
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRelationshipIcon = (relationship: string) => {
    const icons: Record<string, string> = {
      'family': '👨‍👩‍👧‍👦',
      'friend': '👫',
      'partner': '💕',
      'colleague': '🤝',
      'other': '👤'
    }
    return icons[relationship.toLowerCase()] || '👤'
  }

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'birthday': '🎂',
      'anniversary': '💒',
      'holiday': '🎄',
      'celebration': '🎉',
      'other': '📅'
    }
    return icons[type] || '📅'
  }

  const getDaysUntil = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: 'Past due', color: 'text-red-500' }
    if (days === 0) return { text: 'Today', color: 'text-orange-500' }
    if (days <= 7) return { text: `${days} days`, color: 'text-orange-500' }
    if (days <= 30) return { text: `${days} days`, color: 'text-yellow-600' }
    return { text: `${days} days`, color: 'text-green-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gift & Event Planning</h2>
          <p className="text-muted-foreground">Plan thoughtful gifts and memorable events for your loved ones</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onAddGift}>
            <GiftIcon className="h-4 w-4 mr-2" />
            Add Gift
          </Button>
          <Button onClick={onAddEvent} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GiftIcon className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Gifts</p>
                <p className="text-2xl font-bold">{upcomingGifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Gift Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGiftBudget)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(totalGiftSpent)} spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Event Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalEventBudget)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(totalEventSpent)} spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'gifts' ? 'default' : 'outline'}
          onClick={() => setActiveTab('gifts')}
        >
          <GiftIcon className="h-4 w-4 mr-2" />
          Gifts ({(gifts || []).length})
        </Button>
        <Button
          variant={activeTab === 'events' ? 'default' : 'outline'}
          onClick={() => setActiveTab('events')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Events ({(events || []).length})
        </Button>
      </div>

              {/* Gifts Tab */}
      {activeTab === 'gifts' && (
        <div className="space-y-4">
          {(gifts || []).map((gift) => {
            const timeUntil = getDaysUntil(new Date(gift.eventDate))
            const budgetProgress = gift.budget > 0 ? (gift.spent / gift.budget) * 100 : 0
            
            return (
              <Card key={gift.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getRelationshipIcon(gift.relationship)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{gift.giftIdea}</h4>
                        <p className="text-sm text-muted-foreground">
                          For {gift.recipientName} • {gift.occasion}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>{gift.relationship}</span>
                          <span>•</span>
                          <span>{formatDate(gift.eventDate)}</span>
                          <span className={timeUntil.color}>• {timeUntil.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(gift.status)}>
                        {gift.status}
                      </Badge>
                      <div className="text-sm font-medium mt-1">
                        {formatCurrency(gift.budget)}
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Budget Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(gift.spent)} / {formatCurrency(gift.budget)}
                      </span>
                    </div>
                    <Progress value={budgetProgress} />
                  </div>

                  {gift.notes && (
                    <p className="text-sm text-muted-foreground italic mb-3">
                      "{gift.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const amount = prompt('How much did you spend on this gift?')
                        if (amount && !isNaN(Number(amount))) {
                          onUpdateGift({
                            ...gift,
                            spent: gift.spent + Number(amount)
                          })
                        }
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Add Expense
                    </Button>
                    
                    {gift.status === 'planning' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateGift({ ...gift, status: 'purchased', purchaseDate: new Date() })}
                      >
                        Mark Purchased
                      </Button>
                    )}
                    
                    {gift.status === 'purchased' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateGift({ ...gift, status: 'given' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Given
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {(gifts || []).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <GiftIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No gifts planned yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start planning thoughtful gifts for your loved ones
                </p>
                <Button onClick={onAddGift}>
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Your First Gift
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {(events || []).map((event) => {
            const timeUntil = getDaysUntil(new Date(event.date))
            const budgetProgress = event.budget > 0 ? (event.spent / event.budget) * 100 : 0
            
            return (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getEventTypeIcon(event.eventType)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>{event.eventType}</span>
                          <span>•</span>
                          <span>{formatDate(event.date)}</span>
                          <span className={timeUntil.color}>• {timeUntil.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <div className="text-sm font-medium mt-1">
                        {formatCurrency(event.budget)}
                      </div>
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.attendees.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Attendees: </span>
                      <span className="text-sm text-muted-foreground">
                        {event.attendees.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Budget Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Budget Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(event.spent)} / {formatCurrency(event.budget)}
                      </span>
                    </div>
                    <Progress value={budgetProgress} />
                  </div>

                  {/* Associated Gifts */}
                  {event.gifts.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Gifts: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.gifts.map((gift, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {gift.giftIdea} for {gift.recipientName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const amount = prompt('How much did you spend on this event?')
                        if (amount && !isNaN(Number(amount))) {
                          onUpdateEvent({
                            ...event,
                            spent: event.spent + Number(amount)
                          })
                        }
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Add Expense
                    </Button>
                    
                    {event.status === 'planning' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateEvent({ ...event, status: 'confirmed' })}
                      >
                        Confirm Event
                      </Button>
                    )}
                    
                    {event.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateEvent({ ...event, status: 'completed' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {(events || []).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events planned yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start planning memorable events for your loved ones
                </p>
                <Button onClick={onAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
