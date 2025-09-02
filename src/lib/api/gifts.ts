import { supabase } from '../supabase'
import { Gift, Event } from '@/types'
import { authService } from '../auth'

// Gifts API
export async function createGift(giftData: Omit<Gift, 'id' | 'createdAt'>): Promise<{ data: Gift | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('gifts')
      .insert({
        user_id: userId,
        recipient_name: giftData.recipientName,
        relationship: giftData.relationship,
        occasion: giftData.occasion,
        gift_idea: giftData.giftIdea,
        budget: giftData.budget,
        spent: giftData.spent,
        purchase_date: giftData.purchaseDate?.toISOString(),
        event_date: giftData.eventDate.toISOString(),
        status: giftData.status,
        notes: giftData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGift: Gift = {
      id: data.id,
      recipientName: data.recipient_name,
      relationship: data.relationship,
      occasion: data.occasion,
      giftIdea: data.gift_idea,
      budget: data.budget,
      spent: data.spent,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      eventDate: new Date(data.event_date),
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGift, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create gift' }
  }
}

export async function updateGift(id: string, updates: Partial<Gift>): Promise<{ data: Gift | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.recipientName !== undefined) updateData.recipient_name = updates.recipientName
    if (updates.relationship !== undefined) updateData.relationship = updates.relationship
    if (updates.occasion !== undefined) updateData.occasion = updates.occasion
    if (updates.giftIdea !== undefined) updateData.gift_idea = updates.giftIdea
    if (updates.budget !== undefined) updateData.budget = updates.budget
    if (updates.spent !== undefined) updateData.spent = updates.spent
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate?.toISOString()
    if (updates.eventDate !== undefined) updateData.event_date = updates.eventDate.toISOString()
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('gifts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGift: Gift = {
      id: data.id,
      recipientName: data.recipient_name,
      relationship: data.relationship,
      occasion: data.occasion,
      giftIdea: data.gift_idea,
      budget: data.budget,
      spent: data.spent,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      eventDate: new Date(data.event_date),
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGift, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update gift' }
  }
}

export async function deleteGift(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete gift' }
  }
}

export async function getUserGifts(): Promise<{ data: Gift[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedGifts: Gift[] = gifts.map(gift => ({
      id: gift.id,
      recipientName: gift.recipient_name,
      relationship: gift.relationship,
      occasion: gift.occasion,
      giftIdea: gift.gift_idea,
      budget: gift.budget,
      spent: gift.spent,
      purchaseDate: gift.purchase_date ? new Date(gift.purchase_date) : undefined,
      eventDate: new Date(gift.event_date),
      status: gift.status,
      notes: gift.notes,
      createdAt: new Date(gift.created_at)
    }))

    return { data: transformedGifts, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch gifts' }
  }
}

export async function markGiftAsPurchased(id: string, spent: number): Promise<{ data: Gift | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('gifts')
      .update({
        status: 'purchased',
        spent: spent,
        purchase_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedGift: Gift = {
      id: data.id,
      recipientName: data.recipient_name,
      relationship: data.relationship,
      occasion: data.occasion,
      giftIdea: data.gift_idea,
      budget: data.budget,
      spent: data.spent,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      eventDate: new Date(data.event_date),
      status: data.status,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedGift, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to mark gift as purchased' }
  }
}

// Events API
export async function createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<{ data: Event | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.eventType,
        date: eventData.date.toISOString(),
        budget: eventData.budget,
        spent: eventData.spent,
        attendees: eventData.attendees,
        status: eventData.status
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEvent: Event = {
      id: data.id,
      title: data.title,
      description: data.description,
      eventType: data.event_type,
      date: new Date(data.date),
      budget: data.budget,
      spent: data.spent,
      attendees: data.attendees || [],
      gifts: [], // Will be populated when fetching with gifts
      status: data.status,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedEvent, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create event' }
  }
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<{ data: Event | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.eventType !== undefined) updateData.event_type = updates.eventType
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.budget !== undefined) updateData.budget = updates.budget
    if (updates.spent !== undefined) updateData.spent = updates.spent
    if (updates.attendees !== undefined) updateData.attendees = updates.attendees
    if (updates.status !== undefined) updateData.status = updates.status

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEvent: Event = {
      id: data.id,
      title: data.title,
      description: data.description,
      eventType: data.event_type,
      date: new Date(data.date),
      budget: data.budget,
      spent: data.spent,
      attendees: data.attendees || [],
      gifts: [], // Will be populated when fetching with gifts
      status: data.status,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedEvent, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update event' }
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete event' }
  }
}

export async function getUserEvents(): Promise<{ data: Event[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    // Get gifts for each event
    const transformedEvents: Event[] = await Promise.all(events.map(async (event) => {
      const { data: eventGifts } = await supabase
        .from('gifts')
        .select('*')
        .eq('user_id', userId)
        .eq('event_date', event.date.split('T')[0])

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.event_type,
        date: new Date(event.date),
        budget: event.budget,
        spent: event.spent,
        attendees: event.attendees || [],
        gifts: eventGifts?.map(gift => ({
          id: gift.id,
          recipientName: gift.recipient_name,
          relationship: gift.relationship,
          occasion: gift.occasion,
          giftIdea: gift.gift_idea,
          budget: gift.budget,
          spent: gift.spent,
          purchaseDate: gift.purchase_date ? new Date(gift.purchase_date) : undefined,
          eventDate: new Date(gift.event_date),
          status: gift.status,
          notes: gift.notes,
          createdAt: new Date(gift.created_at)
        })) || [],
        status: event.status,
        createdAt: new Date(event.created_at)
      }
    }))

    return { data: transformedEvents, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch events' }
  }
}
