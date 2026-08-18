'use client'

import { useState, useMemo } from 'react'
import {
  Search, Building2, ShieldCheck, Lock, Save, CheckCircle2, Info, Brain, Mic2, Volume2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

// ─── Types ──────────────────────────────────────────────────────────────────
type ServiceType = 'LLM' | 'STT' | 'TTS'

type Organization = {
  id: string
  name: string
  status: 'active' | 'suspended'
  plan: string
  agentsCount: number
}

// ─── Provider catalog by service type ──────────────────────────────────────
const providerCatalog: Record<ServiceType, string[]> = {
  LLM: ['OpenAI', 'Anthropic', 'Google Gemini', 'Mistral', 'Meta'],
  STT: ['Deepgram', 'Sarvam AI', 'Azure Speech', 'Smallest AI', 'Google Speech'],
  TTS: ['Cartesia', 'ElevenLabs', 'Azure Speech', 'Google Cloud TTS', 'PlayHT'],
}

// ─── Service config for styling ────────────────────────────────────────────
const serviceConfig: Record<ServiceType, { icon: React.ElementType; color: string; badgeClass: string }> = {
  LLM: { icon: Brain, color: 'text-purple-500', badgeClass: 'border-purple-500/30 text-purple-500 bg-purple-500/5' },
  STT: { icon: Mic2, color: 'text-blue-500', badgeClass: 'border-blue-500/30 text-blue-500 bg-blue-500/5' },
  TTS: { icon: Volume2, color: 'text-green-500', badgeClass: 'border-green-500/30 text-green-500 bg-green-500/5' },
}

// ─── Platform-wide provider status ─────────────────────────────────────────
const platformProviderStatus: Record<string, 'available' | 'degraded' | 'maintenance'> = {
  'OpenAI': 'available',
  'Anthropic': 'available',
  'Google Gemini': 'available',
  'Mistral': 'available',
  'Meta': 'maintenance',
  'Deepgram': 'available',
  'Sarvam AI': 'degraded',
  'Azure Speech': 'available',
  'Smallest AI': 'available',
  'Google Speech': 'available',
  'Cartesia': 'available',
  'ElevenLabs': 'available',
  'Google Cloud TTS': 'available',
  'PlayHT': 'degraded',
}

// ─── Organizations ─────────────────────────────────────────────────────────
const organizations: Organization[] = [
  { id: 'org-001', name: 'ACME Corp', status: 'active', plan: 'Enterprise', agentsCount: 24 },
  { id: 'org-002', name: 'NovaStack', status: 'active', plan: 'Professional', agentsCount: 12 },
  { id: 'org-003', name: 'Zenith Finance', status: 'active', plan: 'Enterprise', agentsCount: 18 },
  { id: 'org-004', name: 'Bright Retail', status: 'active', plan: 'Professional', agentsCount: 8 },
  { id: 'org-005', name: 'Vertex Logistics', status: 'suspended', plan: 'Starter', agentsCount: 0 },
  { id: 'org-006', name: 'Stellar Media', status: 'active', plan: 'Professional', agentsCount: 15 },
]

// ─── Build initial access state (ONE provider per service) ─────────────────
function buildInitialAccessState(): Record<string, Record<string, boolean>> {
  const state: Record<string, Record<string, boolean>> = {}
  const allProviders = [
    ...providerCatalog.LLM,
    ...providerCatalog.STT,
    ...providerCatalog.TTS,
  ]

  organizations.forEach(org => {
    state[org.id] = {}
    // Start all OFF
    allProviders.forEach(provider => {
      state[org.id][provider] = false
    })
  })

  // Default: one provider selected per service for each org
  organizations.forEach(org => {
    state[org.id]['OpenAI'] = true      // LLM default
    state[org.id]['Deepgram'] = true    // STT default
    state[org.id]['Cartesia'] = true    // TTS default
  })

  // Realistic per-org overrides (still one per service)
  state['org-002']['OpenAI'] = false
  state['org-002']['Anthropic'] = true        // NovaStack → Anthropic for LLM

  state['org-003']['Deepgram'] = false
  state['org-003']['Sarvam AI'] = true        // Zenith → Sarvam AI for STT

  state['org-004']['Cartesia'] = false
  state['org-004']['ElevenLabs'] = true       // Bright Retail → ElevenLabs for TTS

  state['org-006']['Cartesia'] = false
  state['org-006']['ElevenLabs'] = true       // Stellar Media → ElevenLabs for TTS

  // Suspended org: no provider selected
  allProviders.forEach(provider => {
    state['org-005'][provider] = false
  })

  return state
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function OrgProviderAccessPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0].id)
  const [serviceFilter, setServiceFilter] = useState<'all' | ServiceType>('all')
  const [providerSearch, setProviderSearch] = useState('')
  const [accessState, setAccessState] = useState(buildInitialAccessState())
  const [isSaved, setIsSaved] = useState(false)

  const selectedOrg = organizations.find(o => o.id === selectedOrgId)
  const orgAccess = accessState[selectedOrgId] || {}

  const visibleServices: ServiceType[] = useMemo(() => {
    if (serviceFilter === 'all') return ['LLM', 'STT', 'TTS']
    return [serviceFilter]
  }, [serviceFilter])

  // ── Toggle with radio-group behavior (one ON per service) ──
  function handleToggle(service: ServiceType, provider: string, newValue: boolean) {
    setAccessState(prev => {
      const orgProviders = { ...prev[selectedOrgId] }

      if (newValue) {
        // Turn OFF all providers of this service, then turn ON the selected one
        providerCatalog[service].forEach(p => {
          orgProviders[p] = false
        })
        orgProviders[provider] = true
      } else {
        // Turn OFF this provider (deselects the service)
        orgProviders[provider] = false
      }

      return {
        ...prev,
        [selectedOrgId]: orgProviders,
      }
    })
    setIsSaved(false)
  }

  // ── Save ──
  function handleSave() {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Count of services that have a provider selected (0–3)
  const enabledCount = Object.values(orgAccess).filter(Boolean).length
  const totalServices = 3

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organization AI Provider Access</h1>
        <p className="text-sm text-muted-foreground">
          Control which LLM, STT, and TTS providers are available to each organization.
        </p>
      </div>

      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            Only <span className="font-medium text-foreground">one provider per service type</span> can be active for an organization.
            Enabling a provider automatically disables the others in the same service category.
            Global provider availability is managed separately in the AI Providers section.
          </div>
        </CardContent>
      </Card>

      {/* Organization selector + filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Organization dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Select Organization</Label>
              <Select value={selectedOrgId} onValueChange={(v) => {
                if (v) {
                  setSelectedOrgId(v)
                  setIsSaved(false)
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedOrg?.name || 'Select organization'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{org.name}</span>
                        {org.status === 'suspended' && (
                          <Badge variant="outline" className="text-[9px] px-1 border-destructive/30 text-destructive">Suspended</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Service Type</Label>
              <Select value={serviceFilter} onValueChange={(v) => v && setServiceFilter(v as 'all' | ServiceType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="LLM">LLM Providers</SelectItem>
                  <SelectItem value="STT">STT Providers</SelectItem>
                  <SelectItem value="TTS">TTS Providers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Provider search */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Search Provider</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search providers..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected organization info */}
      {selectedOrg && (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{selectedOrg.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedOrg.plan} plan · {selectedOrg.agentsCount} agents · {enabledCount}/{totalServices} services configured
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              selectedOrg.status === 'active'
                ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
                : 'border-destructive/30 text-destructive'
            }
          >
            {selectedOrg.status}
          </Badge>
        </div>
      )}

      {/* Provider configuration sections */}
      {selectedOrg && (
        <div className="flex flex-col gap-4">
          {visibleServices.map(service => (
            <ServiceSection
              key={service}
              service={service}
              accessState={orgAccess}
              providerSearch={providerSearch}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Save button */}
      {selectedOrg && (
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <Badge variant="outline" className="border-[var(--status-active)]/30 text-[var(--status-active)] gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Changes saved successfully
            </Badge>
          )}
          <Button onClick={handleSave} className="gap-2 px-6">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Service Section Component ─────────────────────────────────────────────
function ServiceSection({
  service,
  accessState,
  providerSearch,
  onToggle,
}: {
  service: ServiceType
  accessState: Record<string, boolean>
  providerSearch: string
  onToggle: (service: ServiceType, provider: string, value: boolean) => void
}) {
  const config = serviceConfig[service]
  const Icon = config.icon
  const providers = providerCatalog[service]

  const filteredProviders = providers.filter(p =>
    p.toLowerCase().includes(providerSearch.toLowerCase())
  )

  if (filteredProviders.length === 0) return null

  // Find the currently active provider for this service
  const activeProvider = providers.find(p => accessState[p])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', config.color)} />
            <CardTitle className="text-base">{service} Providers</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {activeProvider ? (
              <span className="text-xs text-muted-foreground">
                Active: <span className="font-medium text-foreground">{activeProvider}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">No provider selected</span>
            )}
            <Badge variant="outline" className={cn('text-[10px]', config.badgeClass)}>
              {service}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {filteredProviders.map(provider => {
            const isEnabled = accessState[provider] ?? false
            const platformStatus = platformProviderStatus[provider] || 'available'
            const isMaintenance = platformStatus === 'maintenance'

            return (
              <div
                key={provider}
                className={cn(
                  'flex items-center justify-between px-4 py-3 transition-colors',
                  isEnabled ? 'bg-primary/5' : 'hover:bg-muted/20',
                  isMaintenance && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{provider}</span>
                  {isEnabled && (
                    <Badge variant="outline" className="text-[10px] border-[var(--status-active)]/30 text-[var(--status-active)]">
                      Selected
                    </Badge>
                  )}
                  {platformStatus === 'degraded' && (
                    <Badge variant="outline" className="text-[10px] border-[var(--status-warning)]/30 text-[var(--status-warning)]">
                      Degraded
                    </Badge>
                  )}
                  {isMaintenance && (
                    <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                      Maintenance
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-xs font-medium',
                    isEnabled ? 'text-[var(--status-active)]' : 'text-muted-foreground'
                  )}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(v) => onToggle(service, provider, v)}
                    disabled={isMaintenance}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}