'use client'

import { useState, useRef } from 'react'
import { Palette, Save, Check, RotateCcw, Upload, Monitor, Mail, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const DEFAULTS = {
  orgName: 'Acme Corp',
  appTitle: 'VoiceAI Platform — Acme Corp',
  tagline: 'Enterprise Voice Agent Management',
  primaryColor: '#4F46E5',
  accentColor: '#06B6D4',
  logoText: 'AC',
  supportEmail: 'support@acmecorp.com',
  supportUrl: 'https://help.acmecorp.com',
  loginHeading: 'Welcome back',
  loginSubheading: 'Sign in to your workspace',
  emailFooter: 'Acme Corp · 123 Enterprise Ave, San Francisco, CA 94105',
  faviconText: 'AC',
}

type Branding = typeof DEFAULTS

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 shrink-0 rounded-md border border-border overflow-hidden cursor-pointer">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          <div className="h-full w-full rounded-md" style={{ backgroundColor: value }} />
        </div>
        <Input className="h-8 text-sm font-mono" value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  )
}

function UploadPlaceholder({ label, hint }: { label: string; hint: string }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <button
        onClick={() => ref.current?.click()}
        className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
      >
        <Upload className="h-4 w-4" />
        <span>{hint}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" />
    </div>
  )
}

function AppPreview({ b }: { b: Branding }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-sm">
      {/* Simulated sidebar + topnav */}
      <div className="flex h-48">
        <div className="w-40 flex flex-col" style={{ backgroundColor: '#161b2e' }}>
          <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
            <div className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: b.primaryColor }}>
              {b.logoText}
            </div>
            <span className="text-white text-[10px] font-semibold truncate">{b.orgName}</span>
          </div>
          <div className="flex flex-col gap-0.5 p-2 flex-1">
            {['Dashboard','AI Agents','Telephony','Campaigns'].map((item, i) => (
              <div key={item} className={cn('rounded px-2 py-1 text-[9px]', i === 0 ? 'text-white' : 'text-white/50')} style={i === 0 ? { backgroundColor: b.primaryColor } : {}}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[9px] font-semibold text-foreground">{b.appTitle}</span>
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: b.primaryColor }}>SC</div>
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="h-2 w-32 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="rounded border border-border bg-card p-2">
                  <div className="h-1.5 w-8 rounded bg-muted mb-1" />
                  <div className="h-3 w-10 rounded" style={{ backgroundColor: i === 0 ? b.primaryColor + '30' : i === 1 ? b.accentColor + '30' : '#e5e7eb' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 rounded px-2 flex items-center text-[8px] text-white" style={{ backgroundColor: b.primaryColor }}>Primary action</div>
              <div className="h-5 rounded px-2 flex items-center text-[8px] border border-border text-muted-foreground">Secondary</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginPreview({ b }: { b: Branding }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-sm bg-muted/20">
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: b.primaryColor }}>
          {b.logoText}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">{b.loginHeading}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{b.loginSubheading}</p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="h-8 rounded-md border border-border bg-card px-3 flex items-center text-xs text-muted-foreground">Email address</div>
          <div className="h-8 rounded-md border border-border bg-card px-3 flex items-center text-xs text-muted-foreground">Password</div>
          <div className="h-8 rounded-md flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: b.primaryColor }}>
            Sign in
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">{b.orgName}</p>
      </div>
    </div>
  )
}

function EmailPreview({ b }: { b: Branding }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-sm bg-white">
      <div className="h-1.5 w-full" style={{ backgroundColor: b.primaryColor }} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: b.primaryColor }}>
            {b.logoText}
          </div>
          <span className="text-sm font-semibold text-gray-900">{b.orgName}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Campaign completed: Q3 Renewal Outreach</p>
          <p className="text-xs text-gray-500 mt-1">Your campaign has finished processing 2,000 contacts with a 68% connection rate.</p>
        </div>
        <div className="h-8 w-32 rounded flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: b.primaryColor }}>
          View Report
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400">{b.emailFooter}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Support: {b.supportEmail}</p>
        </div>
      </div>
    </div>
  )
}

export function AdminBranding() {
  const [branding, setBranding] = useState<Branding>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof Branding>(key: K, value: Branding[K]) =>
    setBranding(prev => ({ ...prev, [key]: value }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Palette className="h-5 w-5" /> Branding</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Configure the visual identity of your workspace.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setBranding(DEFAULTS)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Config panel */}
        <div className="flex flex-col gap-4">
          {/* Identity */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Identity</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Organization name">
                <Input className="h-8 text-sm" value={branding.orgName} onChange={e => set('orgName', e.target.value)} />
              </Field>
              <Field label="Application title">
                <Input className="h-8 text-sm" value={branding.appTitle} onChange={e => set('appTitle', e.target.value)} />
              </Field>
              <Field label="Logo initials (placeholder)">
                <Input className="h-8 text-sm" maxLength={3} value={branding.logoText} onChange={e => set('logoText', e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input className="h-8 text-sm" value={branding.tagline} onChange={e => set('tagline', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <UploadPlaceholder label="Logo" hint="Upload logo (PNG, SVG — max 2MB)" />
              </div>
              <div className="col-span-2">
                <UploadPlaceholder label="Favicon" hint="Upload favicon (ICO, PNG — 32×32px)" />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Colors</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <ColorField label="Primary color" value={branding.primaryColor} onChange={v => set('primaryColor', v)} />
              <ColorField label="Accent color" value={branding.accentColor} onChange={v => set('accentColor', v)} />
            </div>
          </div>

          {/* Login page */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Login Page</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Heading">
                <Input className="h-8 text-sm" value={branding.loginHeading} onChange={e => set('loginHeading', e.target.value)} />
              </Field>
              <Field label="Subheading">
                <Input className="h-8 text-sm" value={branding.loginSubheading} onChange={e => set('loginSubheading', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Support & Email */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Support & Email</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Support email">
                <Input className="h-8 text-sm" value={branding.supportEmail} onChange={e => set('supportEmail', e.target.value)} />
              </Field>
              <Field label="Support URL">
                <Input className="h-8 text-sm" value={branding.supportUrl} onChange={e => set('supportUrl', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Email footer text">
                  <Input className="h-8 text-sm" value={branding.emailFooter} onChange={e => set('emailFooter', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Live Preview</h2>
            </div>
            <div className="p-5">
              <Tabs defaultValue="app">
                <TabsList className="h-8 mb-4">
                  <TabsTrigger value="app" className="text-xs gap-1.5 h-7"><Monitor className="h-3 w-3" /> App</TabsTrigger>
                  <TabsTrigger value="login" className="text-xs gap-1.5 h-7"><LogIn className="h-3 w-3" /> Login</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs gap-1.5 h-7"><Mail className="h-3 w-3" /> Email</TabsTrigger>
                </TabsList>
                <TabsContent value="app"><AppPreview b={branding} /></TabsContent>
                <TabsContent value="login"><LoginPreview b={branding} /></TabsContent>
                <TabsContent value="email"><EmailPreview b={branding} /></TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
