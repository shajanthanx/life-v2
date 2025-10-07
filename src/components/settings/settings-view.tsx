'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { getUserSettings, saveUserSettings, UserSettings, DEFAULT_SETTINGS } from '@/lib/api/settings'
import { useSettings } from '@/contexts/settings-context'
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Database, 
  Shield, 
  Download, 
  Upload,
  Trash2,
  RefreshCw,
  Grid,
  Target,
  CheckCircle2,
  Repeat,
  StickyNote,
  Heart,
  DollarSign,
  BookOpen,
  Eye,
  Gift,
  Album,
  Briefcase,
  TrendingUp,
  Camera
} from 'lucide-react'

interface SettingsViewProps {
  onDataExport: () => void
  onDataImport: (data: any) => void
  onDataReset: () => void
}

export function SettingsView({ onDataExport, onDataImport, onDataReset }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings & { profile: { name: string; email: string; avatar: string; timezone: string } }>(
    {
      ...DEFAULT_SETTINGS,
      profile: {
        name: '',
        email: '',
        avatar: '',
        timezone: 'America/New_York'
      }
    }
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { addToast } = useToast()
  const { updateEnabledModules } = useSettings()

  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await getUserSettings()
        
        if (error) {
          addToast({
            message: `Failed to load settings: ${error}`,
            type: 'error'
          })
          return
        }

        if (data) {
          setSettings(prev => ({
            ...data,
            profile: prev.profile // Keep profile settings separate for now
          }))
        }
      } catch (error) {
        addToast({
          message: 'Failed to load settings',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [addToast])

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))

    // Special handling for currency changes - update localStorage immediately for finance components
    if (category === 'preferences' && key === 'currency') {
      localStorage.setItem('financeAppCurrency', value)
    }
  }

  const handleModuleToggle = (moduleId: string) => {
    setSettings(prev => {
      const currentEnabled = prev.modules.enabled
      const newEnabled = currentEnabled.includes(moduleId)
        ? currentEnabled.filter(id => id !== moduleId)
        : [...currentEnabled, moduleId]
      
      return {
        ...prev,
        modules: {
          ...prev.modules,
          enabled: newEnabled
        }
      }
    })
  }

  const availableModules = [
    { id: 'goals', label: 'Goals', icon: Target, description: 'Track your progress towards achieving your dreams' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, description: 'Manage your daily tasks and to-dos' },
    { id: 'habits', label: 'Habits', icon: Repeat, description: 'Build positive habits for a better life' },
    { id: 'notes', label: 'Quick Notes', icon: StickyNote, description: 'Capture quick thoughts and set reminders' },
    { id: 'health', label: 'Health Tracking', icon: Heart, description: 'Monitor your physical and mental wellbeing' },
    { id: 'progress', label: 'Progress Photos', icon: Camera, description: 'Track your transformation with weekly progress photos' },
    { id: 'finance', label: 'Finance', icon: DollarSign, description: 'Track spending, budgets, and savings' },
    { id: 'lifestyle', label: 'Lifestyle', icon: BookOpen, description: 'Journal, entertainment, and personal interests' },
    { id: 'visualization', label: 'Vision Board', icon: Eye, description: 'Visualize your dreams and aspirations' },
    { id: 'gifts', label: 'Gift Planning', icon: Gift, description: 'Plan and track gifts for special occasions' },
    { id: 'memories', label: 'Memories', icon: Album, description: 'Preserve and cherish your special moments' },
    { id: 'freelancing', label: 'Freelancing', icon: Briefcase, description: 'Manage projects and track time' },
    { id: 'secrets', label: 'Secrets Manager', icon: Shield, description: 'Securely store sensitive information' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Insights and data visualization' }
  ]

  const handleExportData = () => {
    onDataExport()
    alert('Data exported successfully!')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            onDataImport(data)
            alert('Data imported successfully!')
          } catch (error) {
            alert('Invalid file format')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      onDataReset()
      alert('All data has been reset')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner className="h-8 w-8" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Grid className="h-5 w-5" />
                <span>Module Selection</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which modules you want to see in your sidebar. Select up to 10 modules.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {availableModules.map((module) => {
                  const Icon = module.icon
                  const isEnabled = settings.modules.enabled.includes(module.id)
                  
                  return (
                    <div
                      key={module.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                        isEnabled ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                        disabled={!isEnabled && settings.modules.enabled.length >= 10}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{module.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {settings.modules.enabled.length} of 10 modules selected
                </span>
                <Button 
                  onClick={async () => {
                    try {
                      setIsSaving(true)
                      const { error } = await saveUserSettings({
                        modules: settings.modules,
                        notifications: settings.notifications,
                        preferences: settings.preferences,
                        privacy: settings.privacy
                      })
                      
                      if (error) {
                        addToast({
                          message: `Failed to save settings: ${error}`,
                          type: 'error'
                        })
                        return
                      }

                      // Update global settings state to trigger UI updates
                      updateEnabledModules(settings.modules.enabled)
                      
                      addToast({
                        message: 'Settings saved successfully!',
                        type: 'success'
                      })
                    } catch (error) {
                      addToast({
                        message: 'Failed to save settings',
                        type: 'error'
                      })
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner className="mr-2" /> : null}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={settings.profile.timezone}
                    onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                  </select>
                </div>
              </div>
              <Button>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'taskReminders' && 'Get notified about upcoming task deadlines'}
                      {key === 'habitReminders' && 'Daily reminders to complete your habits'}
                      {key === 'budgetAlerts' && 'Alerts when you approach budget limits'}
                      {key === 'goalDeadlines' && 'Notifications for goal deadlines'}
                      {key === 'dailyReflection' && 'Evening reminder for daily reflection'}
                      {key === 'gratitudeReminder' && 'Daily gratitude practice reminder'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleSettingChange('notifications', key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>App Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CHF">CHF</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="LKR">LKR (Rs)</option>
                    <option value="BRL">BRL (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Format</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings.preferences).filter(([key]) => 
                  ['darkMode', 'compactView', 'showMotivationalQuotes'].includes(key)
                ).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'darkMode' && 'Switch to dark theme'}
                        {key === 'compactView' && 'More compact UI layout'}
                        {key === 'showMotivationalQuotes' && 'Show daily motivational quotes'}
                      </p>
                    </div>
                    <Switch
                      checked={enabled as boolean}
                      onCheckedChange={(checked) => handleSettingChange('preferences', key, checked)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={async () => {
                    try {
                      setIsSaving(true)
                      const { error } = await saveUserSettings({
                        modules: settings.modules,
                        notifications: settings.notifications,
                        preferences: settings.preferences,
                        privacy: settings.privacy
                      })
                      
                      if (error) {
                        addToast({
                          message: `Failed to save preferences: ${error}`,
                          type: 'error'
                        })
                        return
                      }
                      
                      addToast({
                        message: 'Preferences saved successfully!',
                        type: 'success'
                      })

                      // If currency was changed, trigger page refresh to update all displays
                      setTimeout(() => {
                        window.location.reload()
                      }, 1000)
                    } catch (error) {
                      addToast({
                        message: 'Failed to save preferences',
                        type: 'error'
                      })
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner className="mr-2" /> : null}
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <div className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button onClick={handleExportData} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Import Data</span>
                  </Button>
                  <Button onClick={handleResetData} variant="destructive" className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Reset All Data</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Export: Download all your data as a JSON file</p>
                  <p>• Import: Upload a previously exported data file</p>
                  <p>• Reset: Clear all data and start fresh (cannot be undone)</p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.privacy).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'dataAnalytics' && 'Allow anonymous usage analytics'}
                        {key === 'shareProgress' && 'Share progress with friends (future feature)'}
                        {key === 'publicProfile' && 'Make profile visible to others (future feature)'}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => handleSettingChange('privacy', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <Badge variant="outline">1.0.0</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Storage:</span>
                    <span>Local Browser Storage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
