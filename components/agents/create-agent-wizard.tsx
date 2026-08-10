'use client'

import { useState } from 'react'
import Link from 'next/link'
import { agentTemplates } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  FileText,
  Settings2,
  Mic2,
  Check,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowLeftRight,
} from 'lucide-react'

const steps = [
  { id: 1, label: 'Agent Info', icon: Bot },
  { id: 2, label: 'Template', icon: FileText },
  { id: 3, label: 'Providers', icon: Settings2 },
  { id: 4, label: 'Voice', icon: Mic2 },
]

export function CreateAgentWizard() {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [agentType, setAgentType] = useState<'inbound' | 'outbound' | 'hybrid'>('inbound')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/agents" />} className="h-8 px-2 text-muted-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Agents
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-xl font-semibold">Create New Agent</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isDone = step > s.id
          const isActive = step === s.id
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'text-foreground font-medium' : isDone ? 'text-primary cursor-pointer' : 'text-muted-foreground',
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0',
                  isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-accent text-muted-foreground',
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                {s.label}
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1" />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="rounded-lg border border-border bg-card">
          {step === 1 && (
            <StepAgentInfo agentType={agentType} onTypeChange={setAgentType} />
          )}
          {step === 2 && (
            <StepTemplate selected={selectedTemplate} onSelect={setSelectedTemplate} />
          )}
          {step === 3 && (
            <StepProviders />
          )}
          {step === 4 && (
            <StepVoice />
          )}

          {/* Nav Buttons */}
          <div className="border-t border-border px-6 py-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < steps.length ? (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" render={<Link href="/agents/agt-001/config" />}>
                Create Agent
              </Button>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Agent Summary</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <SummaryRow label="Type" value={agentType} />
              <SummaryRow label="Template" value={selectedTemplate ? agentTemplates.find((t) => t.id === selectedTemplate)?.name ?? '—' : 'None (Blank)'} />
              <SummaryRow label="LLM" value="Not set" />
              <SummaryRow label="STT" value="Not set" />
              <SummaryRow label="TTS" value="Not set" />
              <SummaryRow label="Voice" value="Not set" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Documentation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              After creating the agent you will be taken to the full configuration page to set up prompts, conversation flows, knowledge base, and deployment targets.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right capitalize">{value}</span>
    </div>
  )
}

function StepAgentInfo({ agentType, onTypeChange }: {
  agentType: 'inbound' | 'outbound' | 'hybrid'
  onTypeChange: (t: 'inbound' | 'outbound' | 'hybrid') => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold">Agent Information</h2>
        <p className="text-sm text-muted-foreground mt-1">Define the basic details for your new agent.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Agent Name <span className="text-destructive">*</span></Label>
          <Input placeholder="e.g. Customer Support Agent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Describe what this agent does, its purpose, and key use cases." rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Agent Type <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { type: 'inbound' as const, icon: PhoneIncoming, label: 'Inbound', desc: 'Handles incoming calls' },
              { type: 'outbound' as const, icon: PhoneOutgoing, label: 'Outbound', desc: 'Initiates outgoing calls' },
              { type: 'hybrid' as const, icon: ArrowLeftRight, label: 'Hybrid', desc: 'Both inbound & outbound' },
            ]).map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={cn(
                  'flex flex-col gap-1.5 rounded-lg border p-4 text-left transition-colors',
                  agentType === type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80',
                )}
              >
                <Icon className={cn('h-5 w-5', agentType === type ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <Select defaultValue="en-US">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-US">Spanish (US)</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
                <SelectItem value="pt-BR">Portuguese (BR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <Input placeholder="support, inbound, crm" />
            <p className="text-xs text-muted-foreground">Comma-separated tags for filtering.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepTemplate({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold">Start from a Template</h2>
        <p className="text-sm text-muted-foreground mt-1">Select a pre-built template or start from scratch.</p>
      </div>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
          selected === null ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Blank Agent</p>
          <p className="text-xs text-muted-foreground">Start with a clean slate and configure everything manually.</p>
        </div>
        {selected === null && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
      </button>
      <div className="flex flex-col gap-2">
        {agentTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
              selected === tpl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{tpl.name}</p>
                <Badge variant="outline" className="text-[10px] px-1.5">{tpl.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{tpl.description}</p>
            </div>
            {selected === tpl.id && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepProviders() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold">AI Provider Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">Select the LLM, STT, and TTS providers for this agent.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">LLM (Large Language Model)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue="openai">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google Vertex</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select defaultValue="gpt-4o">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Temperature <span className="text-muted-foreground font-normal">(0.0 – 1.0)</span></Label>
              <Input type="number" defaultValue="0.4" min="0" max="1" step="0.05" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Context Window (tokens)</Label>
              <Select defaultValue="8192">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4096">4,096</SelectItem>
                  <SelectItem value="8192">8,192</SelectItem>
                  <SelectItem value="16384">16,384</SelectItem>
                  <SelectItem value="32768">32,768</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">STT (Speech-to-Text)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue="deepgram">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepgram">Deepgram</SelectItem>
                  <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                  <SelectItem value="google">Google STT</SelectItem>
                  <SelectItem value="azure">Azure Speech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select defaultValue="nova-3">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova-3">Nova-3</SelectItem>
                  <SelectItem value="nova-2">Nova-2</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold">TTS (Text-to-Speech)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue="elevenlabs">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="azure">Azure TTS</SelectItem>
                  <SelectItem value="google">Google TTS</SelectItem>
                  <SelectItem value="aws">Amazon Polly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Voice</Label>
              <Select defaultValue="rachel">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rachel">Rachel</SelectItem>
                  <SelectItem value="dorothy">Dorothy</SelectItem>
                  <SelectItem value="james">James</SelectItem>
                  <SelectItem value="aria">Aria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepVoice() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold">Voice Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure how your agent sounds in conversations.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Voice Speed</Label>
          <Select defaultValue="normal">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow (0.85×)</SelectItem>
              <SelectItem value="normal">Normal (1.0×)</SelectItem>
              <SelectItem value="fast">Fast (1.15×)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Stability</Label>
          <Input type="number" defaultValue="0.5" min="0" max="1" step="0.05" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Similarity Boost</Label>
          <Input type="number" defaultValue="0.75" min="0" max="1" step="0.05" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Filler Words</Label>
          <Select defaultValue="minimal">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="minimal">Minimal (uh, um)</SelectItem>
              <SelectItem value="natural">Natural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-accent/30 p-4">
        <p className="text-sm font-medium mb-1">Voice Preview</p>
        <p className="text-xs text-muted-foreground mb-3">
          {"\"Thank you for calling Acme Corp. My name is Alex. How can I help you today?\""}
        </p>
        <Button size="sm" variant="outline">Play Sample</Button>
      </div>
    </div>
  )
}
