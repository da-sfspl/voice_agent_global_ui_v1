'use client'

import { useState } from 'react'
import { Settings2, Globe, Phone, Brain, ShieldCheck, Database, RotateCcw, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const DEFAULTS = {
  // General
  workspaceName: 'Acme Corp',
  timezone: 'America/New_York',
  language: 'en-US',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  // Calling & Voice
  callingHoursStart: '09:00',
  callingHoursEnd: '18:00',
  callingDays: 'weekdays',
  defaultVoice: 'neural-female-en',
  callRecording: true,
  transcription: true,
  maxCallDuration: '30',
  // AI Platform
  defaultLlmProvider: 'openai',
  defaultSttProvider: 'deepgram',
  defaultTtsProvider: 'elevenlabs',
  maxResponseTokens: '512',
  temperature: '0.7',
  fallbackEnabled: true,
  // Security
  sessionTimeout: '60',
  mfaRequired: true,
  apiAccessEnabled: true,
  ipAllowlistEnabled: false,
  passwordExpiry: '90',
  // Data & Privacy
  recordingRetention: '90',
  transcriptRetention: '365',
  dataRegion: 'us-east-1',
  gdprMode: false,
  autoDeleteEnabled: true,
}

type Settings = typeof DEFAULTS

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-1.5', full && 'sm:col-span-2')}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function SwitchField({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/20 px-3.5 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Settings2 className="h-5 w-5" /> Profile</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Platform-wide configuration for your workspace.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setSettings(DEFAULTS)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* General */}
      <Section icon={Globe} title="General">
        <Field label="Workspace name">
          <Input className="h-8 text-sm" value={settings.workspaceName} onChange={e => set('workspaceName', e.target.value)} />
        </Field>
        <Field label="Default timezone">
          <Select value={settings.timezone} onValueChange={v => v && set('timezone', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo','Asia/Singapore','UTC'].map(tz => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default language">
          <Select value={settings.language} onValueChange={v => v && set('language', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[['en-US','English (US)'],['en-GB','English (UK)'],['es-ES','Spanish'],['fr-FR','French'],['de-DE','German'],['ja-JP','Japanese']].map(([v,l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date format">
          <Select value={settings.dateFormat} onValueChange={v => v && set('dateFormat', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Time format">
          <Select value={settings.timeFormat} onValueChange={v => v && set('timeFormat', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
              <SelectItem value="24h">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* Calling & Voice */}
      {/* <Section icon={Phone} title="Calling & Voice">
        <Field label="Default calling hours start">
          <Input type="time" className="h-8 text-sm" value={settings.callingHoursStart} onChange={e => set('callingHoursStart', e.target.value)} />
        </Field>
        <Field label="Default calling hours end">
          <Input type="time" className="h-8 text-sm" value={settings.callingHoursEnd} onChange={e => set('callingHoursEnd', e.target.value)} />
        </Field>
        <Field label="Default calling days">
          <Select value={settings.callingDays} onValueChange={v => v && set('callingDays', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekdays">Weekdays (Mon–Fri)</SelectItem>
              <SelectItem value="all">All days</SelectItem>
              <SelectItem value="custom">Custom schedule</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default voice">
          <Select value={settings.defaultVoice} onValueChange={v => v && set('defaultVoice', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="neural-female-en">Neural Female (English)</SelectItem>
              <SelectItem value="neural-male-en">Neural Male (English)</SelectItem>
              <SelectItem value="elevenlabs-rachel">ElevenLabs — Rachel</SelectItem>
              <SelectItem value="elevenlabs-adam">ElevenLabs — Adam</SelectItem>
              <SelectItem value="azure-aria">Azure Neural — Aria</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Max call duration (minutes)">
          <Input type="number" className="h-8 text-sm" value={settings.maxCallDuration} onChange={e => set('maxCallDuration', e.target.value)} />
        </Field>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <SwitchField label="Call recording" description="Record all calls by default for new agents" checked={settings.callRecording} onChange={v => set('callRecording', v)} />
          <SwitchField label="Transcription" description="Transcribe all calls by default for new agents" checked={settings.transcription} onChange={v => set('transcription', v)} />
        </div>
      </Section> */}

      {/* AI Platform */}
      {/* <Section icon={Brain} title="AI Platform">
        <Field label="Default LLM provider">
          <Select value={settings.defaultLlmProvider} onValueChange={v => v && set('defaultLlmProvider', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
              <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
              <SelectItem value="google">Google (Gemini 1.5 Pro)</SelectItem>
              <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default STT provider">
          <Select value={settings.defaultSttProvider} onValueChange={v => v && set('defaultSttProvider', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deepgram">Deepgram Nova-2</SelectItem>
              <SelectItem value="openai-whisper">OpenAI Whisper</SelectItem>
              <SelectItem value="google-stt">Google STT</SelectItem>
              <SelectItem value="azure-stt">Azure Speech</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default TTS provider">
          <Select value={settings.defaultTtsProvider} onValueChange={v => v && set('defaultTtsProvider', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
              <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
              <SelectItem value="google-tts">Google TTS</SelectItem>
              <SelectItem value="azure-tts">Azure Neural TTS</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default max response tokens">
          <Input type="number" className="h-8 text-sm" value={settings.maxResponseTokens} onChange={e => set('maxResponseTokens', e.target.value)} />
        </Field>
        <Field label="Default temperature (0–1)">
          <Input type="number" step="0.1" min="0" max="1" className="h-8 text-sm" value={settings.temperature} onChange={e => set('temperature', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <SwitchField label="Provider fallback" description="Automatically fall back to secondary provider on failure" checked={settings.fallbackEnabled} onChange={v => set('fallbackEnabled', v)} />
        </div>
      </Section> */}

      {/* Security */}
      <Section icon={ShieldCheck} title="Security">
        <Field label="Session timeout (minutes)">
          <Select value={settings.sessionTimeout} onValueChange={v => v && set('sessionTimeout', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="480">8 hours</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Password expiry (days)">
          <Select value={settings.passwordExpiry} onValueChange={v => v && set('passwordExpiry', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <SwitchField label="Require MFA" description="Enforce multi-factor authentication for all admin users" checked={settings.mfaRequired} onChange={v => set('mfaRequired', v)} />
          <SwitchField label="API access" description="Allow API key creation and programmatic access" checked={settings.apiAccessEnabled} onChange={v => set('apiAccessEnabled', v)} />
          <SwitchField label="IP allowlist" description="Restrict access to approved IP ranges only" checked={settings.ipAllowlistEnabled} onChange={v => set('ipAllowlistEnabled', v)} />
        </div>
      </Section>

      {/* Data & Privacy */}
      <Section icon={Database} title="Data & Privacy">
        <Field label="Call recording retention (days)">
          <Select value={settings.recordingRetention} onValueChange={v => v && set('recordingRetention', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
              <SelectItem value="forever">Indefinite</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Transcript retention (days)">
          <Select value={settings.transcriptRetention} onValueChange={v => v && set('transcriptRetention', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
              <SelectItem value="730">2 years</SelectItem>
              <SelectItem value="forever">Indefinite</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Data region">
          <Select value={settings.dataRegion} onValueChange={v => v && set('dataRegion', v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
              <SelectItem value="eu-central-1">EU Central (Frankfurt)</SelectItem>
              <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <SwitchField label="GDPR compliance mode" description="Enable enhanced data subject rights and consent tracking" checked={settings.gdprMode} onChange={v => set('gdprMode', v)} />
          <SwitchField label="Automated data deletion" description="Automatically delete data when retention period expires" checked={settings.autoDeleteEnabled} onChange={v => set('autoDeleteEnabled', v)} />
        </div>
        <div className="sm:col-span-2 flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">Export workspace data</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive">Request data deletion</Button>
        </div>
      </Section>
    </div>
  )
}
