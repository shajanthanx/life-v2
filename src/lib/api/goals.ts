import { supabase } from '../supabase'
import { Goal, Milestone } from '@/types'
import { authService } from '../auth'

export async function createGoal(goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        target_value: goalData.targetValue,
        current_value: goalData.currentValue,
        unit: goalData.unit,
        deadline: goalData.deadline?.toISOString(),
        is_completed: goalData.isCompleted
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Insert milestones if any
    if (goalData.milestones && goalData.milestones.length > 0) {
      const milestonesData = goalData.milestones.map(milestone => ({
        goal_id: data.id,
        title: milestone.title,
        value: milestone.value,
        is_completed: milestone.isCompleted,
        completed_at: milestone.completedAt?.toISOString()
      }))

      await supabase
        .from('milestones')
        .insert(milestonesData)
    }

    // Fetch the complete goal with milestones
    const completeGoal = await getGoalWithMilestones(data.id)
    return { data: completeGoal, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create goal' }
  }
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<{ data: Goal | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue
    if (updates.unit !== undefined) updateData.unit = updates.unit
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString()
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Update milestones if provided
    if (updates.milestones) {
      // Delete existing milestones
      await supabase
        .from('milestones')
        .delete()
        .eq('goal_id', id)

      // Insert new milestones
      if (updates.milestones.length > 0) {
        const milestonesData = updates.milestones.map(milestone => ({
          goal_id: id,
          title: milestone.title,
          value: milestone.value,
          is_completed: milestone.isCompleted,
          completed_at: milestone.completedAt?.toISOString()
        }))

        await supabase
          .from('milestones')
          .insert(milestonesData)
      }
    }

    const completeGoal = await getGoalWithMilestones(id)
    return { data: completeGoal, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update goal' }
  }
}

export async function deleteGoal(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete goal' }
  }
}

export async function getUserGoals(): Promise<{ data: Goal[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedGoals: Goal[] = goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      unit: goal.unit,
      deadline: goal.deadline ? new Date(goal.deadline) : new Date(),
      isCompleted: goal.is_completed,
      createdAt: new Date(goal.created_at),
      milestones: goal.milestones.map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        value: milestone.value,
        isCompleted: milestone.is_completed,
        completedAt: milestone.completed_at ? new Date(milestone.completed_at) : undefined
      }))
    }))

    return { data: transformedGoals, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch goals' }
  }
}

async function getGoalWithMilestones(goalId: string): Promise<Goal | null> {
  try {
    const { data: goal, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones (*)
      `)
      .eq('id', goalId)
      .single()

    if (error || !goal) return null

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      unit: goal.unit,
      deadline: goal.deadline ? new Date(goal.deadline) : new Date(),
      isCompleted: goal.is_completed,
      createdAt: new Date(goal.created_at),
      milestones: goal.milestones.map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        value: milestone.value,
        isCompleted: milestone.is_completed,
        completedAt: milestone.completed_at ? new Date(milestone.completed_at) : undefined
      }))
    }
  } catch (error) {
    return null
  }
}
