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
import { Switch } from '@/components/ui/switch'
import {
  Info, Volume2, Mic, AudioLines, SlidersHorizontal
} from 'lucide-react'

// ─── Mock Data: Provider-specific voices ───────────────────────────────────
const ttsProviderVoices: Record<string, { id: string; name: string; language: string }[]> = {
  elevenlabs: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en-US' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en-US' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en-US' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'en-US' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'en-US' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', language: 'en-US' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', language: 'en-US' },
  ],
  azure: [
    { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US' },
    { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US' },
    { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US' },
    { id: 'en-US-DavisNeural', name: 'Davis', language: 'en-US' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha', language: 'en-AU' },
  ],
  google: [
    { id: 'en-US-Standard-A', name: 'Standard A (Male)', language: 'en-US' },
    { id: 'en-US-Standard-C', name: 'Standard C (Female)', language: 'en-US' },
    { id: 'en-US-Wavenet-D', name: 'Wavenet D (Male)', language: 'en-US' },
    { id: 'en-US-Neural2-F', name: 'Neural2 F (Female)', language: 'en-US' },
    { id: 'en-GB-Standard-B', name: 'Standard B (Male)', language: 'en-GB' },
    { id: 'en-GB-Neural2-A', name: 'Neural2 A (Female)', language: 'en-GB' },
  ],
  aws: [
    { id: 'Joanna', name: 'Joanna (Female)', language: 'en-US' },
    { id: 'Matthew', name: 'Matthew (Male)', language: 'en-US' },
    { id: 'Salli', name: 'Salli (Female)', language: 'en-US' },
    { id: 'Justin', name: 'Justin (Child)', language: 'en-US' },
    { id: 'Kendra', name: 'Kendra (Female)', language: 'en-US' },
    { id: 'Kimberly', name: 'Kimberly (Female)', language: 'en-US' },
  ],
}

// ─── Mock Data: Provider feature support ────────────────────────────────────
const providerFeatures: Record<string, {
  stability: boolean
  similarityBoost: boolean
  pitch: boolean
  volume: boolean
  style: boolean
  expressiveness: boolean
}> = {
  elevenlabs: { stability: true, similarityBoost: true, pitch: false, volume: false, style: true, expressiveness: true },
  azure:      { stability: false, similarityBoost: false, pitch: true, volume: true, style: true, expressiveness: false },
  google:     { stability: false, similarityBoost: false, pitch: true, volume: true, style: false, expressiveness: false },
  aws:        { stability: false, similarityBoost: false, pitch: true, volume: true, style: false, expressiveness: false },
}

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'hi-IN', label: 'Hindi' },
]

const emotionStyles = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'calm', label: 'Calm / Soothing' },
  { value: 'assertive', label: 'Assertive' },
  { value: 'cheerful', label: 'Cheerful' },
]

// ─── Helper: Unsupported field indicator ────────────────────────────────────
function UnsupportedBadge({ feature }: { feature: string }) {
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-dashed gap-1">
      <Info className="h-2.5 w-2.5" />
      Not supported by {feature}
    </Badge>
  )
}


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
  // Voice Selection state
  const [ttsProvider, setTtsProvider] = useState('elevenlabs')
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [language, setLanguage] = useState('en-US')

  // Voice Tuning state
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0)
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.75)
  const [fillerWords, setFillerWords] = useState('minimal')
  const [pitch, setPitch] = useState(0)
  const [loudness, setLoudness] = useState(0.8)
  const [emotionStyle, setEmotionStyle] = useState('neutral')
  const [expressiveness, setExpressiveness] = useState(0.6)

  // Conversation Audio state
  const [interruptHandling, setInterruptHandling] = useState(true)
  const [silenceDetection, setSilenceDetection] = useState(true)
  const [backgroundNoiseSuppression, setBackgroundNoiseSuppression] = useState(true)
  const [turnDetection, setTurnDetection] = useState('automatic')
  const [silenceTimeout, setSilenceTimeout] = useState(1500)
  const [vadProvider, setVadProvider] = useState('silero')
  const [vadSensitivity, setVadSensitivity] = useState(0.7)
  const [noiseCancellationProvider, setNoiseCancellationProvider] = useState('krisp')

  const features = providerFeatures[ttsProvider]
  const availableVoices = ttsProviderVoices[ttsProvider] ?? []

  // Reset voice when provider changes
  function handleProviderChange(provider: string | null) {
    if (!provider) return
    setTtsProvider(provider)
    const voices = ttsProviderVoices[provider]
    if (voices && voices.length > 0) {
      setSelectedVoice(voices[0].id)
    }
  }
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold">Voice Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure how your agent sounds in conversations.</p>
      </div>

      {/* ─── Voice Selection ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AudioLines className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Voice Selection</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>TTS Provider</Label>
            <Select value={ttsProvider} onValueChange={handleProviderChange}>
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
            <Select value={selectedVoice} onValueChange={(v) => v && setSelectedVoice(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Voice ID</Label>
            <Input value={selectedVoice} readOnly className="font-mono text-xs bg-muted/50" />
            <p className="text-[11px] text-muted-foreground">Auto-populated from selected voice</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Voice Tuning ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Voice Tuning</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Speaking Speed */}
          <div className="flex flex-col gap-1.5">
            <Label>Speaking Speed <span className="text-muted-foreground font-normal">({speakingSpeed.toFixed(2)}×)</span></Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speakingSpeed}
                onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{speakingSpeed.toFixed(2)}×</span>
            </div>
          </div>

          {/* Pitch */}
          <div className={cn('flex flex-col gap-1.5', !features.pitch && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Pitch <span className="text-muted-foreground font-normal">({pitch > 0 ? '+' : ''}{pitch} semitones)</span></Label>
              {!features.pitch && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                disabled={!features.pitch}
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{pitch > 0 ? '+' : ''}{pitch}</span>
            </div>
          </div>

          {/* Stability */}
          <div className={cn('flex flex-col gap-1.5', !features.stability && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Stability <span className="text-muted-foreground font-normal">({(stability * 100).toFixed(0)}%)</span></Label>
              {!features.stability && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                disabled={!features.stability}
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{(stability * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Similarity Boost */}
          <div className={cn('flex flex-col gap-1.5', !features.similarityBoost && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Similarity Boost <span className="text-muted-foreground font-normal">({(similarityBoost * 100).toFixed(0)}%)</span></Label>
              {!features.similarityBoost && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={similarityBoost}
                onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                disabled={!features.similarityBoost}
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{(similarityBoost * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Loudness / Volume */}
          <div className={cn('flex flex-col gap-1.5', !features.volume && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Loudness / Volume <span className="text-muted-foreground font-normal">({(loudness * 100).toFixed(0)}%)</span></Label>
              {!features.volume && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={loudness}
                onChange={(e) => setLoudness(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                disabled={!features.volume}
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{(loudness * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Expressiveness */}
          <div className={cn('flex flex-col gap-1.5', !features.expressiveness && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Expressiveness <span className="text-muted-foreground font-normal">({(expressiveness * 100).toFixed(0)}%)</span></Label>
              {!features.expressiveness && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={expressiveness}
                onChange={(e) => setExpressiveness(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                disabled={!features.expressiveness}
              />
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{(expressiveness * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Filler Words & Emotion/Style */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Filler Words</Label>
            <Select value={fillerWords} onValueChange={(v) => v && setFillerWords(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minimal">Minimal (uh, um)</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cn('flex flex-col gap-1.5', !features.style && 'opacity-50 pointer-events-none')}>
            <div className="flex items-center justify-between">
              <Label>Emotion / Style</Label>
              {!features.style && <UnsupportedBadge feature={ttsProvider} />}
            </div>
            <Select value={emotionStyle} onValueChange={(v) => v && setEmotionStyle(v)} disabled={!features.style}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {emotionStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Conversation Audio ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Conversation Audio</h3>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Interrupt Handling</p>
              <p className="text-[11px] text-muted-foreground">Stop speaking when caller interrupts</p>
            </div>
            <Switch checked={interruptHandling} onCheckedChange={setInterruptHandling} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Silence Detection</p>
              <p className="text-[11px] text-muted-foreground">Detect caller silence for follow-up</p>
            </div>
            <Switch checked={silenceDetection} onCheckedChange={setSilenceDetection} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Noise Suppression</p>
              <p className="text-[11px] text-muted-foreground">Suppress background noise</p>
            </div>
            <Switch checked={backgroundNoiseSuppression} onCheckedChange={setBackgroundNoiseSuppression} />
          </div>
        </div>

        <Separator />

        {/* Turn Detection & Silence Timeout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Turn Detection</Label>
            <Select value={turnDetection} onValueChange={(v) => v && setTurnDetection(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic (AI-driven)</SelectItem>
                <SelectItem value="vad">VAD-based</SelectItem>
                <SelectItem value="manual">Manual (timeout only)</SelectItem>
                <SelectItem value="hybrid">Hybrid (VAD + AI)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Silence Timeout (ms)</Label>
            <Input
              type="number"
              value={silenceTimeout}
              onChange={(e) => setSilenceTimeout(parseInt(e.target.value) || 1500)}
              min={500}
              max={10000}
              step={100}
            />
            <p className="text-[11px] text-muted-foreground">Time to wait before responding to silence</p>
          </div>
        </div>

        <Separator />

        {/* VAD & Noise Cancellation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>VAD Provider</Label>
            <Select value={vadProvider} onValueChange={(v) => v && setVadProvider(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="silero">Silero VAD</SelectItem>
                <SelectItem value="webrtc">WebRTC VAD</SelectItem>
                <SelectItem value="azure">Azure VAD</SelectItem>
                <SelectItem value="deepgram">Deepgram VAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Noise Cancellation Provider</Label>
            <Select value={noiseCancellationProvider} onValueChange={(v) => v && setNoiseCancellationProvider(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krisp">Krisp</SelectItem>
                <SelectItem value="rnnoise">RNNoise</SelectItem>
                <SelectItem value="azure">Azure Noise Suppression</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* VAD Sensitivity */}
        <div className="flex flex-col gap-1.5">
          <Label>VAD Sensitivity <span className="text-muted-foreground font-normal">({(vadSensitivity * 100).toFixed(0)}%)</span></Label>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-16">Less sensitive</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={vadSensitivity}
              onChange={(e) => setVadSensitivity(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
            />
            <span className="text-[11px] text-muted-foreground w-16 text-right">More sensitive</span>
          </div>
        </div>
      </div>

      {/* ─── Voice Preview (preserved from original) ─────────────────────── */}
      <div className="rounded-lg border border-border bg-accent/30 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-sm font-medium">Voice Preview</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {"\"Thank you for calling Acme Corp. My name is Alex. How can I help you today?\""}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Play Sample</Button>
          <span className="text-[11px] text-muted-foreground">
            {ttsProvider === 'elevenlabs' && `Voice: ${availableVoices.find(v => v.id === selectedVoice)?.name ?? 'Unknown'} · ${language}`}
            {ttsProvider === 'azure' && `Voice: ${availableVoices.find(v => v.id === selectedVoice)?.name ?? 'Unknown'} · ${language}`}
            {ttsProvider === 'google' && `Voice: ${availableVoices.find(v => v.id === selectedVoice)?.name ?? 'Unknown'} · ${language}`}
            {ttsProvider === 'aws' && `Voice: ${availableVoices.find(v => v.id === selectedVoice)?.name ?? 'Unknown'} · ${language}`}
          </span>
        </div>
      </div>
    </div>
  )
}