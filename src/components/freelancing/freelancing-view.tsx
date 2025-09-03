'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FreelanceProject, TimeEntry, ProjectTask } from '@/types'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Briefcase, 
  Plus, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Calendar,
  Upload,
  Download,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface FreelancingViewProps {
  projects: FreelanceProject[]
  timeEntries: TimeEntry[]
  onAddProject: (project: Omit<FreelanceProject, 'id'>) => void
  onUpdateProject: (project: FreelanceProject) => void
  onAddTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  onAddTask: (task: Omit<ProjectTask, 'id'>) => void
}

export function FreelancingView({ 
  projects, 
  timeEntries, 
  onAddProject, 
  onUpdateProject, 
  onAddTimeEntry, 
  onAddTask 
}: FreelancingViewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const { addToast } = useToast()

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    client: '',
    description: '',
    status: 'planning' as FreelanceProject['status'],
    hourlyRate: '',
    estimatedHours: '',
    deadline: '',
    budget: ''
  })

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium' as ProjectTask['priority'],
    estimatedHours: '',
    deadline: ''
  })

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active')
  const totalEarningsThisMonth = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const now = new Date()
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    })
    .reduce((total, entry) => {
      const project = projects.find(p => p.id === entry.projectId)
      return total + (entry.hours * (project?.hourlyRate || 0))
    }, 0)

  const totalHoursThisWeek = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return entryDate >= weekAgo
    })
    .reduce((total, entry) => total + entry.hours, 0)

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectForm.title.trim() || !projectForm.client.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in project title and client name'
      })
      return
    }

    const newProject: Omit<FreelanceProject, 'id'> = {
      title: projectForm.title,
      client: projectForm.client,
      description: projectForm.description || undefined,
      status: projectForm.status,
      hourlyRate: Number(projectForm.hourlyRate) || 0,
      estimatedHours: Number(projectForm.estimatedHours) || 0,
      actualHours: 0,
      deadline: projectForm.deadline ? new Date(projectForm.deadline) : undefined,
      budget: Number(projectForm.budget) || undefined,
      createdAt: new Date(),
      tasks: [],
      documents: []
    }

    onAddProject(newProject)
    setShowAddProjectModal(false)
    setProjectForm({
      title: '',
      client: '',
      description: '',
      status: 'planning',
      hourlyRate: '',
      estimatedHours: '',
      deadline: '',
      budget: ''
    })

    addToast({
      type: 'success',
      message: 'Project created successfully!'
    })
  }

  const startTimer = (projectId: string) => {
    setActiveTimer(projectId)
    setTimerStart(new Date())
    addToast({
      type: 'info',
      message: 'Timer started!'
    })
  }

  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const endTime = new Date()
      const hours = (endTime.getTime() - timerStart.getTime()) / (1000 * 60 * 60)
      
      const timeEntry: Omit<TimeEntry, 'id'> = {
        projectId: activeTimer,
        date: new Date(),
        hours: Math.round(hours * 100) / 100,
        description: 'Timed work session',
        billable: true
      }

      onAddTimeEntry(timeEntry)
      setActiveTimer(null)
      setTimerStart(null)
      
      addToast({
        type: 'success',
        message: `Logged ${timeEntry.hours} hours`
      })
    }
  }

  const getStatusColor = (status: FreelanceProject['status']) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Freelancing Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage projects, track time, and grow your freelance business
              </p>
            </div>
            <Button onClick={() => setShowAddProjectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{activeProjects.length}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">${totalEarningsThisMonth.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalHoursThisWeek.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Hours This Week</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No active projects
                    </p>
                  ) : (
                    activeProjects.slice(0, 3).map((project) => {
                      const progress = project.estimatedHours > 0 
                        ? Math.min((project.actualHours / project.estimatedHours) * 100, 100)
                        : 0

                      return (
                        <div key={project.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{project.title}</h3>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Client: {project.client}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{project.actualHours}h / {project.estimatedHours}h</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-muted-foreground">
                              ${project.hourlyRate}/hour
                            </span>
                            {activeTimer === project.id ? (
                              <Button size="sm" variant="outline" onClick={stopTimer}>
                                <Square className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => startTimer(project.id)}>
                                <Play className="h-4 w-4 mr-1" />
                                Start Timer
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeEntries.slice(0, 5).map((entry) => {
                    const project = projects.find(p => p.id === entry.projectId)
                    return (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{project?.title || 'Unknown Project'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(entry.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{entry.hours}h</p>
                          <p className="text-sm text-muted-foreground">
                            ${(entry.hours * (project?.hourlyRate || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress = project.estimatedHours > 0 
                ? Math.min((project.actualHours / project.estimatedHours) * 100, 100)
                : 0
              const totalEarned = project.actualHours * project.hourlyRate

              return (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Client: {project.client}
                    </p>
                    
                    {project.description && (
                      <p className="text-sm mb-4 line-clamp-2">{project.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hours:</span>
                        <span className="text-sm font-medium">
                          {project.actualHours} / {project.estimatedHours}
                        </span>
                      </div>
                      <Progress value={progress} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rate:</span>
                        <span className="text-sm font-medium">${project.hourlyRate}/hr</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Earned:</span>
                        <span className="text-sm font-medium">${totalEarned.toFixed(2)}</span>
                      </div>

                      {project.deadline && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Deadline:</span>
                          <span className="text-sm font-medium">
                            {formatDate(project.deadline)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {activeTimer === project.id ? (
                        <Button size="sm" variant="outline" onClick={stopTimer} className="flex-1">
                          <Square className="h-4 w-4 mr-1" />
                          Stop Timer
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startTimer(project.id)} className="flex-1">
                          <Play className="h-4 w-4 mr-1" />
                          Start Timer
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Active Timer */}
              {activeTimer && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Timer Running</p>
                      <p className="text-sm text-muted-foreground">
                        {projects.find(p => p.id === activeTimer)?.title}
                      </p>
                    </div>
                    <Button onClick={stopTimer}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Timer
                    </Button>
                  </div>
                </div>
              )}

              {/* Time Entries Table */}
              <div className="space-y-3">
                {timeEntries.map((entry) => {
                  const project = projects.find(p => p.id === entry.projectId)
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project?.title || 'Unknown Project'}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.hours}h</p>
                        <p className="text-sm text-muted-foreground">
                          ${(entry.hours * (project?.hourlyRate || 0)).toFixed(2)}
                        </p>
                        {entry.billable && (
                          <Badge variant="outline" className="text-xs">Billable</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Document Management</h3>
                <p className="text-muted-foreground mb-4">
                  Upload and organize project documents, contracts, and deliverables
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Project Modal */}
      <Dialog open={showAddProjectModal} onOpenChange={setShowAddProjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitProject} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Title</label>
              <Input
                placeholder="e.g., Website Redesign for ABC Corp"
                value={projectForm.title}
                onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Client Name</label>
              <Input
                placeholder="e.g., ABC Corporation"
                value={projectForm.client}
                onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm min-h-[80px]"
                placeholder="Project description and scope..."
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Hourly Rate ($)</label>
                <Input
                  type="number"
                  placeholder="75"
                  value={projectForm.hourlyRate}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Est. Hours</label>
                <Input
                  type="number"
                  placeholder="40"
                  value={projectForm.estimatedHours}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Deadline (optional)</label>
              <Input
                type="date"
                value={projectForm.deadline}
                onChange={(e) => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={projectForm.status}
                onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value as FreelanceProject['status'] }))}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddProjectModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
