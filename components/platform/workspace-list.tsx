'use client'

import { useState } from 'react'
import { workspaces, type Workspace } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Bot,
  PhoneCall,
  Settings,
  Ban,
  ExternalLink,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const planColors: Record<string, string> = {
  starter: 'border-blue-500/30 text-blue-500 bg-blue-500/10',
  professional: 'border-purple-500/30 text-purple-500 bg-purple-500/10',
  enterprise: 'border-amber-500/30 text-amber-500 bg-amber-500/10',
}

const wizardSteps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Owner & Admin' },
  { id: 3, label: 'Plan & Config' },
  { id: 4, label: 'Review' },
]

export function WorkspaceList() {
  const [search, setSearch] = useState('')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    name: '',
    slug: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    adminEmail: '',
    plan: 'starter',
    region: 'us-east-1',
    maxAgents: 10,
    maxUsers: 5,
    monthlyCallLimit: 1000,
    enableRecording: true,
    enableTranscription: true,
    enableAnalytics: true,
  })

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.owner.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase()),
  )

  const handleNext = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1)
  }

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1)
  }

  const handleCreate = () => {
    // In a real app, this would call an API
    console.log('Creating workspace:', wizardData)
    setShowWizard(false)
    setWizardStep(1)
    setWizardData({
      name: '',
      slug: '',
      description: '',
      ownerName: '',
      ownerEmail: '',
      adminEmail: '',
      plan: 'starter',
      region: 'us-east-1',
      maxAgents: 10,
      maxUsers: 5,
      monthlyCallLimit: 1000,
      enableRecording: true,
      enableTranscription: true,
      enableAnalytics: true,
    })
  }

  const canProceed = () => {
    if (wizardStep === 1) return wizardData.name.trim() !== '' && wizardData.slug.trim() !== ''
    if (wizardStep === 2) return wizardData.ownerName.trim() !== '' && wizardData.ownerEmail.trim() !== ''
    if (wizardStep === 3) return true
    return true
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Workspace Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspaces, plans, and tenant configuration for this organization.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Workspaces', value: workspaces.length, icon: Building2 },
          { label: 'Active', value: workspaces.filter((w) => w.status === 'active').length, icon: Building2 },
          { label: 'Total Agents', value: workspaces.reduce((a, w) => a + w.agents, 0), icon: Bot },
          { label: 'Monthly Calls', value: workspaces.reduce((a, w) => a + w.monthlyCalls, 0).toLocaleString(), icon: PhoneCall },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search workspaces..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[220px]">Workspace</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Agents</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Monthly Calls</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ws) => (
              <WorkspaceRow key={ws.id} ws={ws} />
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                  No workspaces match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Workspace Wizard */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Set up a new workspace with configuration and resource allocation.
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {wizardSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                    wizardStep === step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : wizardStep > step.id
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted bg-muted text-muted-foreground'
                  }`}>
                    {wizardStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className={`text-xs mt-1 ${wizardStep === step.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < wizardSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${wizardStep > step.id ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Step 1: Basic Info */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workspace Name *</Label>
                <Input
                  placeholder="e.g. Acme Corporation"
                  value={wizardData.name}
                  onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Workspace Slug *</Label>
                <Input
                  placeholder="e.g. acme-corp"
                  value={wizardData.slug}
                  onChange={(e) => setWizardData({ ...wizardData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
                <p className="text-xs text-muted-foreground">URL-friendly identifier (lowercase, hyphens only)</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of this workspace..."
                  value={wizardData.description}
                  onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Owner & Admin */}
          {wizardStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Owner Name *</Label>
                <Input
                  placeholder="e.g. John Smith"
                  value={wizardData.ownerName}
                  onChange={(e) => setWizardData({ ...wizardData, ownerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Owner Email *</Label>
                <Input
                  type="email"
                  placeholder="e.g. john@acme.com"
                  value={wizardData.ownerEmail}
                  onChange={(e) => setWizardData({ ...wizardData, ownerEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Admin Email</Label>
                <Input
                  type="email"
                  placeholder="e.g. admin@acme.com (optional)"
                  value={wizardData.adminEmail}
                  onChange={(e) => setWizardData({ ...wizardData, adminEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  If different from owner, this person will have admin access to the workspace.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Plan & Configuration */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={wizardData.plan} onValueChange={(v) => v && setWizardData({ ...wizardData, plan: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={wizardData.region} onValueChange={(v) => v && setWizardData({ ...wizardData, region: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                      <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Agents</Label>
                  <Input
                    type="number"
                    value={wizardData.maxAgents}
                    onChange={(e) => setWizardData({ ...wizardData, maxAgents: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input
                    type="number"
                    value={wizardData.maxUsers}
                    onChange={(e) => setWizardData({ ...wizardData, maxUsers: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monthly Call Limit</Label>
                <Input
                  type="number"
                  value={wizardData.monthlyCallLimit}
                  onChange={(e) => setWizardData({ ...wizardData, monthlyCallLimit: parseInt(e.target.value) || 0 })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Call Recording</p>
                      <p className="text-xs text-muted-foreground">Enable automatic call recording</p>
                    </div>
                    <Switch
                      checked={wizardData.enableRecording}
                      onCheckedChange={(checked) => setWizardData({ ...wizardData, enableRecording: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Transcription</p>
                      <p className="text-xs text-muted-foreground">Enable automatic transcription</p>
                    </div>
                    <Switch
                      checked={wizardData.enableTranscription}
                      onCheckedChange={(checked) => setWizardData({ ...wizardData, enableTranscription: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">Enable advanced analytics dashboard</p>
                    </div>
                    <Switch
                      checked={wizardData.enableAnalytics}
                      onCheckedChange={(checked) => setWizardData({ ...wizardData, enableAnalytics: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {wizardStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-semibold">Workspace Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {wizardData.name}</div>
                  <div><span className="text-muted-foreground">Slug:</span> {wizardData.slug}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Description:</span> {wizardData.description || '—'}</div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-semibold">Owner & Admin</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Owner:</span> {wizardData.ownerName}</div>
                  <div><span className="text-muted-foreground">Email:</span> {wizardData.ownerEmail}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Admin:</span> {wizardData.adminEmail || 'Same as owner'}</div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-semibold">Configuration</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Plan:</span> <span className="capitalize">{wizardData.plan}</span></div>
                  <div><span className="text-muted-foreground">Region:</span> {wizardData.region}</div>
                  <div><span className="text-muted-foreground">Max Agents:</span> {wizardData.maxAgents}</div>
                  <div><span className="text-muted-foreground">Max Users:</span> {wizardData.maxUsers}</div>
                  <div><span className="text-muted-foreground">Monthly Calls:</span> {wizardData.monthlyCallLimit.toLocaleString()}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  {wizardData.enableRecording && <Badge variant="outline">Recording</Badge>}
                  {wizardData.enableTranscription && <Badge variant="outline">Transcription</Badge>}
                  {wizardData.enableAnalytics && <Badge variant="outline">Analytics</Badge>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={wizardStep === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowWizard(false)}>
                Cancel
              </Button>
              {wizardStep < 4 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleCreate} className="gap-1">
                  Create Workspace
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkspaceRow({ ws }: { ws: Workspace }) {
  return (
    <TableRow className="border-border">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-sm">
            {ws.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{ws.name}</p>
            <p className="text-xs text-muted-foreground">{ws.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{ws.owner}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${planColors[ws.plan]}`}>
          {ws.plan}
        </span>
      </TableCell>
      <TableCell className="text-sm font-mono text-muted-foreground">{ws.region}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.agents}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.users}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.monthlyCalls.toLocaleString()}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            ws.status === 'active'
              ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
              : 'border-destructive/30 text-destructive'
          }
        >
          {ws.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> Open Workspace
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Users className="h-3.5 w-3.5" /> Manage Users
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Ban className="h-3.5 w-3.5" /> Suspend Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}