'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Save, RotateCcw } from 'lucide-react'

export default function PlatformSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global platform-level defaults and policies.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
          <Button size="sm" className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Defaults</TabsTrigger>
          <TabsTrigger value="limits">Usage & Limits</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Core platform identity and localization.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5"><Label>Platform Name</Label><Input defaultValue="Voice AI Platform" /></div>
              <div className="flex flex-col gap-1.5"><Label>Default Timezone</Label><Select defaultValue="utc"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="utc">UTC</SelectItem><SelectItem value="ist">IST (Asia/Kolkata)</SelectItem><SelectItem value="est">EST (America/New_York)</SelectItem></SelectContent></Select></div>
              <div className="flex flex-col gap-1.5"><Label>Default Currency</Label><Select defaultValue="inr"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inr">INR (₹)</SelectItem><SelectItem value="usd">USD ($)</SelectItem></SelectContent></Select></div>
              <div className="flex flex-col gap-1.5"><Label>Default Language</Label><Select defaultValue="en-US"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en-US">English (US)</SelectItem><SelectItem value="en-GB">English (UK)</SelectItem></SelectContent></Select></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>AI Defaults</CardTitle><CardDescription>Default providers assigned to new organizations.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5"><Label>Default LLM</Label><Select defaultValue="openai"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="openai">OpenAI (gpt-4o)</SelectItem><SelectItem value="anthropic">Anthropic (Claude)</SelectItem></SelectContent></Select></div>
              <div className="flex flex-col gap-1.5"><Label>Default STT</Label><Select defaultValue="deepgram"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deepgram">Deepgram</SelectItem><SelectItem value="azure">Azure Speech</SelectItem></SelectContent></Select></div>
              <div className="flex flex-col gap-1.5"><Label>Default TTS</Label><Select defaultValue="elevenlabs"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="elevenlabs">ElevenLabs</SelectItem><SelectItem value="cartesia">Cartesia</SelectItem></SelectContent></Select></div>
              <div className="flex flex-col gap-1.5"><Label>Default Fallback Policy</Label><Select defaultValue="auto"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto-route to secondary</SelectItem><SelectItem value="fail">Fail immediately</SelectItem></SelectContent></Select></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader><CardTitle>Usage & Limits</CardTitle><CardDescription>Platform-wide resource constraints.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5"><Label>Default Call Limit (per org/day)</Label><Input type="number" defaultValue={10000} /></div>
              <div className="flex flex-col gap-1.5"><Label>Usage Threshold Alert (%)</Label><Input type="number" defaultValue={80} /></div>
              <div className="flex flex-col gap-1.5"><Label>Max Concurrent Calls (per org)</Label><Input type="number" defaultValue={500} /></div>
              <div className="flex flex-col gap-1.5"><Label>Provider Rate Limit Buffer (%)</Label><Input type="number" defaultValue={10} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Policies</CardTitle><CardDescription>Global alert routing for superadmins.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Platform Alert Notifications</p><p className="text-xs text-muted-foreground">Email superadmins on critical platform alerts.</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Cost Threshold Notifications</p><p className="text-xs text-muted-foreground">Alert when orgs exceed 80% of allocated budget.</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Provider Outage Notifications</p><p className="text-xs text-muted-foreground">Immediate alert on primary provider failure.</p></div><Switch defaultChecked /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security Policies</CardTitle><CardDescription>Platform-wide security defaults.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5"><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue={60} /></div>
              <div className="flex flex-col gap-1.5"><Label>API Access Policy</Label><Select defaultValue="ip-whitelist"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ip-whitelist">IP Whitelist Required</SelectItem><SelectItem value="key-only">API Key Only</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between col-span-2 pt-2 border-t"><div><p className="text-sm font-medium">Enforce MFA for Organization Admins</p><p className="text-xs text-muted-foreground">Require MFA for all org-level admin accounts.</p></div><Switch defaultChecked /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}