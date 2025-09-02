import { supabase } from '../supabase'
import { Visualization } from '@/types'
import { authService } from '../auth'

export async function createVisualization(visualizationData: Omit<Visualization, 'id' | 'createdAt'>): Promise<{ data: Visualization | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('visualizations')
      .insert({
        user_id: userId,
        title: visualizationData.title,
        description: visualizationData.description,
        image_url: visualizationData.imageUrl,
        category: visualizationData.category,
        target_date: visualizationData.targetDate?.toISOString(),
        is_achieved: visualizationData.isAchieved,
        progress: visualizationData.progress,
        notes: visualizationData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedVisualization: Visualization = {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      isAchieved: data.is_achieved,
      progress: data.progress,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedVisualization, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create visualization' }
  }
}

export async function updateVisualization(id: string, updates: Partial<Visualization>): Promise<{ data: Visualization | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate?.toISOString()
    if (updates.isAchieved !== undefined) updateData.is_achieved = updates.isAchieved
    if (updates.progress !== undefined) updateData.progress = updates.progress
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('visualizations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedVisualization: Visualization = {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      isAchieved: data.is_achieved,
      progress: data.progress,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedVisualization, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update visualization' }
  }
}

export async function deleteVisualization(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('visualizations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete visualization' }
  }
}

export async function getUserVisualizations(): Promise<{ data: Visualization[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: visualizations, error } = await supabase
      .from('visualizations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedVisualizations: Visualization[] = visualizations.map(viz => ({
      id: viz.id,
      title: viz.title,
      description: viz.description,
      imageUrl: viz.image_url,
      category: viz.category,
      targetDate: viz.target_date ? new Date(viz.target_date) : undefined,
      isAchieved: viz.is_achieved,
      progress: viz.progress,
      notes: viz.notes,
      createdAt: new Date(viz.created_at)
    }))

    return { data: transformedVisualizations, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch visualizations' }
  }
}

export async function updateVisualizationProgress(id: string, progress: number): Promise<{ data: Visualization | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Auto-achieve if progress reaches 100%
    const updateData: any = { progress }
    if (progress >= 100) {
      updateData.is_achieved = true
    }

    const { data, error } = await supabase
      .from('visualizations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedVisualization: Visualization = {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      isAchieved: data.is_achieved,
      progress: data.progress,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedVisualization, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update visualization progress' }
  }
}

export async function markVisualizationAsAchieved(id: string): Promise<{ data: Visualization | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('visualizations')
      .update({
        is_achieved: true,
        progress: 100
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedVisualization: Visualization = {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      targetDate: data.target_date ? new Date(data.target_date) : undefined,
      isAchieved: data.is_achieved,
      progress: data.progress,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedVisualization, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to mark visualization as achieved' }
  }
}
