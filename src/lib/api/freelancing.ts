import { supabase } from '../supabase'
import { FreelanceProject, ProjectTask, TimeEntry, ProjectDocument } from '@/types'
import { authService } from '../auth'

// Freelance Projects API
export async function createFreelanceProject(projectData: Omit<FreelanceProject, 'id' | 'createdAt' | 'tasks' | 'documents'>): Promise<{ data: FreelanceProject | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('freelance_projects')
      .insert({
        user_id: userId,
        title: projectData.title,
        client: projectData.client,
        description: projectData.description,
        status: projectData.status,
        hourly_rate: projectData.hourlyRate,
        estimated_hours: projectData.estimatedHours,
        actual_hours: projectData.actualHours,
        deadline: projectData.deadline?.toISOString(),
        budget: projectData.budget
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedProject: FreelanceProject = {
      id: data.id,
      title: data.title,
      client: data.client,
      description: data.description,
      status: data.status,
      hourlyRate: data.hourly_rate,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      budget: data.budget,
      createdAt: new Date(data.created_at),
      tasks: [],
      documents: []
    }

    return { data: transformedProject, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create freelance project' }
  }
}

export async function updateFreelanceProject(id: string, updates: Partial<FreelanceProject>): Promise<{ data: FreelanceProject | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.client !== undefined) updateData.client = updates.client
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours
    if (updates.actualHours !== undefined) updateData.actual_hours = updates.actualHours
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString()
    if (updates.budget !== undefined) updateData.budget = updates.budget

    const { data, error } = await supabase
      .from('freelance_projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const projectWithDetails = await getFreelanceProjectWithDetails(id)
    return { data: projectWithDetails, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update freelance project' }
  }
}

export async function deleteFreelanceProject(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('freelance_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete freelance project' }
  }
}

export async function getUserFreelanceProjects(): Promise<{ data: FreelanceProject[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: projects, error } = await supabase
      .from('freelance_projects')
      .select(`
        *,
        project_tasks (*),
        project_documents (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedProjects: FreelanceProject[] = projects.map(project => ({
      id: project.id,
      title: project.title,
      client: project.client,
      description: project.description,
      status: project.status,
      hourlyRate: project.hourly_rate,
      estimatedHours: project.estimated_hours,
      actualHours: project.actual_hours,
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      budget: project.budget,
      createdAt: new Date(project.created_at),
      tasks: project.project_tasks.map((task: any) => ({
        id: task.id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        createdAt: new Date(task.created_at)
      })),
      documents: project.project_documents.map((doc: any) => ({
        id: doc.id,
        projectId: doc.project_id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: new Date(doc.uploaded_at),
        url: doc.url
      }))
    }))

    return { data: transformedProjects, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch freelance projects' }
  }
}

// Project Tasks API
export async function createProjectTask(taskData: Omit<ProjectTask, 'id' | 'createdAt'>): Promise<{ data: ProjectTask | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('freelance_projects')
      .select('id')
      .eq('id', taskData.projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return { data: null, error: 'Project not found or access denied' }
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: taskData.projectId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        estimated_hours: taskData.estimatedHours,
        actual_hours: taskData.actualHours,
        deadline: taskData.deadline?.toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTask: ProjectTask = {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedTask, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create project task' }
  }
}

export async function updateProjectTask(id: string, updates: Partial<ProjectTask>): Promise<{ data: ProjectTask | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours
    if (updates.actualHours !== undefined) updateData.actual_hours = updates.actualHours
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString()

    const { data, error } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedTask: ProjectTask = {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdAt: new Date(data.created_at)
    }

    return { data: transformedTask, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update project task' }
  }
}

export async function deleteProjectTask(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete project task' }
  }
}

// Time Entries API
export async function createTimeEntry(entryData: Omit<TimeEntry, 'id'>): Promise<{ data: TimeEntry | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('freelance_projects')
      .select('id')
      .eq('id', entryData.projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return { data: null, error: 'Project not found or access denied' }
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        project_id: entryData.projectId,
        date: entryData.date.toISOString(),
        hours: entryData.hours,
        description: entryData.description,
        billable: entryData.billable
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEntry: TimeEntry = {
      id: data.id,
      projectId: data.project_id,
      date: new Date(data.date),
      hours: data.hours,
      description: data.description,
      billable: data.billable
    }

    return { data: transformedEntry, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create time entry' }
  }
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<{ data: TimeEntry | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.hours !== undefined) updateData.hours = updates.hours
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.billable !== undefined) updateData.billable = updates.billable

    const { data, error } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedEntry: TimeEntry = {
      id: data.id,
      projectId: data.project_id,
      date: new Date(data.date),
      hours: data.hours,
      description: data.description,
      billable: data.billable
    }

    return { data: transformedEntry, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update time entry' }
  }
}

export async function deleteTimeEntry(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete time entry' }
  }
}

export async function getUserTimeEntries(): Promise<{ data: TimeEntry[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedEntries: TimeEntry[] = entries.map(entry => ({
      id: entry.id,
      projectId: entry.project_id,
      date: new Date(entry.date),
      hours: entry.hours,
      description: entry.description,
      billable: entry.billable
    }))

    return { data: transformedEntries, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch time entries' }
  }
}

export async function getTimeEntriesByProject(projectId: string): Promise<{ data: TimeEntry[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedEntries: TimeEntry[] = entries.map(entry => ({
      id: entry.id,
      projectId: entry.project_id,
      date: new Date(entry.date),
      hours: entry.hours,
      description: entry.description,
      billable: entry.billable
    }))

    return { data: transformedEntries, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch time entries for project' }
  }
}

export async function getProjectStats(projectId: string): Promise<{ data: any; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('freelance_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError) {
      return { data: null, error: projectError.message }
    }

    // Get time entries for the project
    const { data: timeEntries } = await getTimeEntriesByProject(projectId)
    const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0
    const billableHours = timeEntries?.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0) || 0

    // Get project tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)

    const taskStats = tasks ? {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      todo: tasks.filter(task => task.status === 'todo').length
    } : { total: 0, completed: 0, inProgress: 0, todo: 0 }

    const stats = {
      project: {
        title: project.title,
        client: project.client,
        status: project.status,
        estimatedHours: project.estimated_hours,
        budget: project.budget,
        hourlyRate: project.hourly_rate
      },
      time: {
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        estimatedHours: project.estimated_hours,
        hoursRemaining: Math.max(0, project.estimated_hours - totalHours)
      },
      financial: {
        estimatedRevenue: billableHours * project.hourly_rate,
        budgetUsed: project.budget ? (billableHours * project.hourly_rate / project.budget) * 100 : 0
      },
      tasks: taskStats,
      progress: {
        timeProgress: project.estimated_hours > 0 ? (totalHours / project.estimated_hours) * 100 : 0,
        taskProgress: taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0
      }
    }

    return { data: stats, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to get project statistics' }
  }
}

async function getFreelanceProjectWithDetails(projectId: string): Promise<FreelanceProject | null> {
  try {
    const { data: project, error } = await supabase
      .from('freelance_projects')
      .select(`
        *,
        project_tasks (*),
        project_documents (*)
      `)
      .eq('id', projectId)
      .single()

    if (error || !project) return null

    return {
      id: project.id,
      title: project.title,
      client: project.client,
      description: project.description,
      status: project.status,
      hourlyRate: project.hourly_rate,
      estimatedHours: project.estimated_hours,
      actualHours: project.actual_hours,
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      budget: project.budget,
      createdAt: new Date(project.created_at),
      tasks: project.project_tasks.map((task: any) => ({
        id: task.id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        createdAt: new Date(task.created_at)
      })),
      documents: project.project_documents.map((doc: any) => ({
        id: doc.id,
        projectId: doc.project_id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: new Date(doc.uploaded_at),
        url: doc.url
      }))
    }
  } catch (error) {
    return null
  }
}
