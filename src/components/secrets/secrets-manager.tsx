'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Secret } from '@/types'
import { Shield, Eye, EyeOff, Plus, Lock, Copy, Key, CreditCard, Building, Smartphone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SecretsManagerProps {
  secrets: Secret[]
  onAddSecret: (secret: Omit<Secret, 'id'>) => void
  onUpdateSecret: (secret: Secret) => void
  onDeleteSecret: (id: string) => void
}

export function SecretsManager({ secrets, onAddSecret, onUpdateSecret, onDeleteSecret }: SecretsManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null)
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    type: 'password' as Secret['type'],
    website: '',
    username: '',
    password: '',
    notes: '',
    customFields: [] as { key: string; value: string }[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.password.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in title and password'
      })
      return
    }

    const newSecret: Omit<Secret, 'id'> = {
      title: formData.title,
      type: formData.type,
      website: formData.website || undefined,
      username: formData.username || undefined,
      password: formData.password,
      notes: formData.notes || undefined,
      customFields: formData.customFields.filter(f => f.key && f.value),
      createdAt: new Date(),
      lastAccessed: new Date()
    }

    onAddSecret(newSecret)
    setShowAddModal(false)
    setFormData({
      title: '',
      type: 'password',
      website: '',
      username: '',
      password: '',
      notes: '',
      customFields: []
    })
    
    addToast({
      type: 'success',
      message: 'Secret saved securely!'
    })
  }

  const togglePasswordVisibility = (secretId: string) => {
    setShowPasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(secretId)) {
        newSet.delete(secretId)
      } else {
        newSet.add(secretId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({
        type: 'success',
        message: `${label} copied to clipboard!`
      })
    })
  }

  const getTypeIcon = (type: Secret['type']) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />
      case 'credit_card': return <CreditCard className="h-4 w-4" />
      case 'bank_account': return <Building className="h-4 w-4" />
      case 'identity': return <Shield className="h-4 w-4" />
      case 'secure_note': return <Lock className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Secret['type']) => {
    switch (type) {
      case 'password': return 'bg-blue-100 text-blue-800'
      case 'credit_card': return 'bg-green-100 text-green-800'
      case 'bank_account': return 'bg-purple-100 text-purple-800'
      case 'identity': return 'bg-orange-100 text-orange-800'
      case 'secure_note': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const filteredSecrets = secrets.filter(secret =>
    secret.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secret.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secret.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { key: '', value: '' }]
    }))
  }

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }))
  }

  const removeCustomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secrets Manager
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Securely store passwords, cards, and sensitive information
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search secrets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {['password', 'credit_card', 'bank_account', 'identity'].map(type => {
              const count = secrets.filter(s => s.type === type).length
              return (
                <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {type.replace('_', ' ')}s
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secrets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSecrets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Secrets Stored</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first password or secure note
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Secret
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSecrets.map((secret) => (
            <Card key={secret.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(secret.type)}
                    <h3 className="font-semibold truncate">{secret.title}</h3>
                  </div>
                  <Badge className={getTypeColor(secret.type)}>
                    {secret.type.replace('_', ' ')}
                  </Badge>
                </div>

                {secret.website && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {secret.website}
                  </p>
                )}

                {secret.username && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Username:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-mono">{secret.username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(secret.username!, 'Username')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Password:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">
                      {showPasswords.has(secret.id) ? secret.password : '••••••••'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility(secret.id)}
                    >
                      {showPasswords.has(secret.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(secret.password, 'Password')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {secret.customFields && secret.customFields.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {secret.customFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{field.key}:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono">{field.value}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(field.value, field.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {secret.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {secret.notes}
                  </p>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(secret.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSecret(secret)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Secret Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Secret</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Gmail Account, Bank Login"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Secret['type'] }))}
              >
                <option value="password">Password</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_account">Bank Account</option>
                <option value="identity">Identity Document</option>
                <option value="secure_note">Secure Note</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Website/Service</label>
              <Input
                placeholder="e.g., gmail.com, bank.com"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Username/Email</label>
              <Input
                placeholder="username or email"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password/Secret</label>
              <Input
                type="password"
                placeholder="secure password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Custom Fields</label>
              {formData.customFields.map((field, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Field name"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Field value"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomField(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomField}
                className="mt-2"
              >
                Add Field
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm min-h-[60px]"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p className="text-yellow-800">
                🔒 <strong>Security Note:</strong> Data is stored locally in your browser. 
                Consider using a dedicated password manager for maximum security.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Secret
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
