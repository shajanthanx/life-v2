import { supabase } from '../supabase'
import { Memory } from '@/types'
import { authService } from '../auth'

export async function createMemory(memoryData: Omit<Memory, 'id'>): Promise<{ data: Memory | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        title: memoryData.title,
        description: memoryData.description,
        date: memoryData.date.toISOString(),
        location: memoryData.location,
        tags: memoryData.tags,
        is_special: memoryData.isSpecial
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Insert memory images if any
    if (memoryData.images && memoryData.images.length > 0) {
      const imageInserts = memoryData.images.map((imageUrl, index) => ({
        memory_id: data.id,
        image_url: imageUrl,
        order_index: index
      }))

      await supabase
        .from('memory_images')
        .insert(imageInserts)
    }

    const transformedMemory: Memory = {
      id: data.id,
      title: data.title,
      description: data.description,
      images: memoryData.images,
      date: new Date(data.date),
      location: data.location,
      tags: data.tags || [],
      isSpecial: data.is_special
    }

    return { data: transformedMemory, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create memory' }
  }
}

export async function updateMemory(id: string, updates: Partial<Memory>): Promise<{ data: Memory | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.isSpecial !== undefined) updateData.is_special = updates.isSpecial

    const { data, error } = await supabase
      .from('memories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Update images if provided
    if (updates.images !== undefined) {
      // Delete existing images
      await supabase
        .from('memory_images')
        .delete()
        .eq('memory_id', id)

      // Insert new images
      if (updates.images.length > 0) {
        const imageInserts = updates.images.map((imageUrl, index) => ({
          memory_id: id,
          image_url: imageUrl,
          order_index: index
        }))

        await supabase
          .from('memory_images')
          .insert(imageInserts)
      }
    }

    const memoryWithImages = await getMemoryWithImages(id)
    return { data: memoryWithImages, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update memory' }
  }
}

export async function deleteMemory(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete memory' }
  }
}

export async function getUserMemories(): Promise<{ data: Memory[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: memories, error } = await supabase
      .from('memories')
      .select(`
        *,
        memory_images (
          image_url,
          order_index
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedMemories: Memory[] = memories.map(memory => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      images: memory.memory_images
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => img.image_url),
      date: new Date(memory.date),
      location: memory.location,
      tags: memory.tags || [],
      isSpecial: memory.is_special
    }))

    return { data: transformedMemories, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch memories' }
  }
}

export async function getMemoriesByTag(tag: string): Promise<{ data: Memory[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: memories, error } = await supabase
      .from('memories')
      .select(`
        *,
        memory_images (
          image_url,
          order_index
        )
      `)
      .eq('user_id', userId)
      .contains('tags', [tag])
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedMemories: Memory[] = memories.map(memory => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      images: memory.memory_images
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => img.image_url),
      date: new Date(memory.date),
      location: memory.location,
      tags: memory.tags || [],
      isSpecial: memory.is_special
    }))

    return { data: transformedMemories, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch memories by tag' }
  }
}

export async function getSpecialMemories(): Promise<{ data: Memory[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: memories, error } = await supabase
      .from('memories')
      .select(`
        *,
        memory_images (
          image_url,
          order_index
        )
      `)
      .eq('user_id', userId)
      .eq('is_special', true)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedMemories: Memory[] = memories.map(memory => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      images: memory.memory_images
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => img.image_url),
      date: new Date(memory.date),
      location: memory.location,
      tags: memory.tags || [],
      isSpecial: memory.is_special
    }))

    return { data: transformedMemories, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch special memories' }
  }
}

export async function addImageToMemory(memoryId: string, imageUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify memory belongs to user
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .select('id')
      .eq('id', memoryId)
      .eq('user_id', userId)
      .single()

    if (memoryError || !memory) {
      return { success: false, error: 'Memory not found or access denied' }
    }

    // Get the current highest order index
    const { data: lastImage } = await supabase
      .from('memory_images')
      .select('order_index')
      .eq('memory_id', memoryId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = lastImage ? lastImage.order_index + 1 : 0

    const { error } = await supabase
      .from('memory_images')
      .insert({
        memory_id: memoryId,
        image_url: imageUrl,
        order_index: nextOrderIndex
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to add image to memory' }
  }
}

async function getMemoryWithImages(memoryId: string): Promise<Memory | null> {
  try {
    const { data: memory, error } = await supabase
      .from('memories')
      .select(`
        *,
        memory_images (
          image_url,
          order_index
        )
      `)
      .eq('id', memoryId)
      .single()

    if (error || !memory) return null

    return {
      id: memory.id,
      title: memory.title,
      description: memory.description,
      images: memory.memory_images
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((img: any) => img.image_url),
      date: new Date(memory.date),
      location: memory.location,
      tags: memory.tags || [],
      isSpecial: memory.is_special
    }
  } catch (error) {
    return null
  }
}
