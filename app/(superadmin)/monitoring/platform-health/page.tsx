'use client'

import { useState } from 'react'
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, Phone, Brain, Mic2, Volume2,
  BookOpen, Megaphone, Server, Clock, Radio, TrendingUp, TrendingDown,
  ChevronRight, Info, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'

// ─── Status helpers ─────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Operational: 'border-[var(--status-active)]/30 text-[var(--status-active)] bg-[var(--status-active)]/5',
  Degraded: 'border-[var(--status-warning)]/30 text-[var(--status-warning)] bg-[var(--status-warning)]/5',
  Incident: 'border-destructive/30 text-destructive bg-destructive/5',
  Resolved: 'border-muted text-muted-foreground',
}

const severityStyles: Record<string, string> = {
  Low: 'border-muted text-muted-foreground',
  Medium: 'border-blue-500/30 text-blue-500',
  High: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',
  Critical: 'border-destructive/30 text-destructive',
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const overviewMetrics = {
  availability: 99.98,
  activeCalls: 247,
  callsInProgress: 184,
  errorRate: 0.42,
  avgLatency: 820,
  providerAvailability: 98.7,
  activeIncidents: 2,
}

const services = [
  { name: 'Voice AI Runtime', icon: Radio, status: 'Operational', availability: 99.99, latency: 120, errorRate: 0.08, lastIncident: '12 days ago' },
  { name: 'Telephony', icon: Phone, status: 'Operational', availability: 99.95, latency: 85, errorRate: 0.21, lastIncident: '3 hours ago' },
  { name: 'LLM Services', icon: Brain, status: 'Operational', availability: 99.92, latency: 850, errorRate: 0.34, lastIncident: '14 mins ago' },
  { name: 'Speech-to-Text', icon: Mic2, status: 'Degraded', availability: 98.4, latency: 480, errorRate: 1.8, lastIncident: '14 mins ago' },
  { name: 'Text-to-Speech', icon: Volume2, status: 'Operational', availability: 99.88, latency: 420, errorRate: 0.42, lastIncident: '2 hours ago' },
  { name: 'Knowledge Services', icon: BookOpen, status: 'Operational', availability: 99.96, latency: 210, errorRate: 0.15, lastIncident: '5 days ago' },
  { name: 'Campaign Engine', icon: Megaphone, status: 'Operational', availability: 99.94, latency: 180, errorRate: 0.28, lastIncident: '1 day ago' },
  { name: 'API Gateway', icon: Server, status: 'Operational', availability: 99.99, latency: 45, errorRate: 0.05, lastIncident: '18 days ago' },
]

const providers = [
  { name: 'OpenAI', service: 'LLM', status: 'Operational', availability: 99.95, latency: 820, errorRate: 0.12, lastChecked: '30s ago' },
  { name: 'Anthropic', service: 'LLM', status: 'Operational', availability: 99.98, latency: 910, errorRate: 0.08, lastChecked: '30s ago' },
  { name: 'Google Vertex', service: 'LLM', status: 'Operational', availability: 99.92, latency: 780, errorRate: 0.18, lastChecked: '30s ago' },
  { name: 'Deepgram', service: 'STT', status: 'Operational', availability: 99.88, latency: 320, errorRate: 0.45, lastChecked: '30s ago' },
  { name: 'Sarvam AI', service: 'STT', status: 'Degraded', availability: 97.2, latency: 680, errorRate: 2.8, lastChecked: '30s ago' },
  { name: 'Cartesia', service: 'TTS', status: 'Operational', availability: 99.95, latency: 210, errorRate: 0.08, lastChecked: '30s ago' },
  { name: 'ElevenLabs', service: 'TTS', status: 'Operational', availability: 99.82, latency: 650, errorRate: 0.22, lastChecked: '30s ago' },
  { name: 'Azure Speech', service: 'TTS', status: 'Operational', availability: 99.90, latency: 420, errorRate: 0.15, lastChecked: '30s ago' },
]

const incidents = [
  {
    id: 'inc-001',
    title: 'Elevated STT latency on Sarvam AI',
    service: 'Speech-to-Text',
    severity: 'Medium',
    started: '14 mins ago',
    duration: '14m',
    status: 'Investigating',
    description: 'Sarvam AI STT provider is experiencing elevated latency. Requests are averaging 680ms vs normal 450ms. Auto-routing to fallback providers has been triggered for affected organizations.',
    impact: 'Affecting 2 organizations using Sarvam AI as primary STT provider.',
  },
  {
    id: 'inc-002',
    title: 'LLM response latency spike on OpenAI gpt-4o',
    service: 'LLM Services',
    severity: 'Low',
    started: '14 mins ago',
    duration: '14m',
    status: 'Monitoring',
    description: 'OpenAI gpt-4o model showing elevated response times for complex prompts. Requests exceeding 5s are being routed to Anthropic Claude as fallback.',
    impact: 'Minimal impact — fallback routing is handling traffic smoothly.',
  },
  {
    id: 'inc-003',
    title: 'TTS provider timeout spike on ElevenLabs',
    service: 'Text-to-Speech',
    severity: 'Medium',
    started: '2 hours ago',
    duration: '45m',
    status: 'Resolved',
    description: 'ElevenLabs Turbo v2.5 model experienced intermittent timeouts between 14:00–14:45 UTC. The issue self-resolved and latency has returned to normal.',
    impact: 'Affected 3 organizations briefly. Fallback to Azure Speech handled traffic.',
  },
  {
    id: 'inc-004',
    title: 'Telephony error rate increase',
    service: 'Telephony',
    severity: 'High',
    started: '3 hours ago',
    duration: '18m',
    status: 'Resolved',
    description: 'Twilio SIP trunk showed brief connectivity issues causing a spike in call setup failures. Issue resolved automatically after 18 minutes.',
    impact: '~12 calls failed across 4 organizations. Auto-retry recovered 10 of them.',
  },
]

// ─── Trend data (simple sparklines) ─────────────────────────────────────────
const availabilityTrend = [99.99, 99.98, 99.99, 99.97, 99.95, 99.98, 99.99, 99.96, 99.98, 99.98, 99.97, 99.98]
const errorRateTrend = [0.12, 0.15, 0.18, 0.22, 0.28, 0.31, 0.25, 0.34, 0.42, 0.38, 0.35, 0.42]
const latencyTrend = [780, 795, 810, 825, 840, 820, 835, 850, 865, 845, 830, 820]

// ─── Sparkline component ────────────────────────────────────────────────────
function Sparkline({ data, color, width = 180, height = 36 }: {
  data: number[]; color: string; width?: number; height?: number
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

// ─── Overall status banner ──────────────────────────────────────────────────
function OverallStatusBanner() {
  const hasDegraded = services.some(s => s.status === 'Degraded') || providers.some(p => p.status === 'Degraded')
  const hasIncident = services.some(s => s.status === 'Incident') || providers.some(p => p.status === 'Incident')

  if (hasIncident) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-semibold text-destructive">Service Incident in Progress</p>
          <p className="text-xs text-muted-foreground">One or more platform services are experiencing an incident.</p>
        </div>
      </div>
    )
  }

  if (hasDegraded) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--status-warning)]/30 bg-[var(--status-warning)]/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-[var(--status-warning)] shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[var(--status-warning)]">Partial Service Degradation</p>
          <p className="text-xs text-muted-foreground">Some services are operating with degraded performance. Monitoring in progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--status-active)]/30 bg-[var(--status-active)]/5 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-[var(--status-active)] shrink-0" />
      <div>
        <p className="text-sm font-semibold text-[var(--status-active)]">All Systems Operational</p>
        <p className="text-xs text-muted-foreground">The Voice AI platform is operating normally across all services.</p>
      </div>
    </div>
  )
}

// ─── Incident detail dialog ─────────────────────────────────────────────────
function IncidentDetailDialog({ incident }: { incident: typeof incidents[0] }) {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Eye className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{incident.title}</DialogTitle>
          <DialogDescription>Incident details and impact assessment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={severityStyles[incident.severity]}>{incident.severity}</Badge>
            <Badge variant="outline">{incident.service}</Badge>
            <Badge variant="outline" className={incident.status === 'Resolved' ? 'text-[var(--status-active)]' : 'text-[var(--status-warning)]'}>
              {incident.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Started</p>
              <p className="font-medium">{incident.started}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Duration</p>
              <p className="font-medium">{incident.duration}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{incident.description}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Impact</p>
            <p className="text-sm leading-relaxed">{incident.impact}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function PlatformHealthPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform Health</h1>
          <p className="text-sm text-muted-foreground">Monitor platform-wide operational health and service availability.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Last updated: 30s ago
        </div>
      </div>

      {/* Overall status banner */}
      <OverallStatusBanner />

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Platform Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-[var(--status-active)]">{overviewMetrics.availability}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">30-day rolling</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{overviewMetrics.activeCalls}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[var(--status-active)]" />
              <span className="text-[var(--status-active)]">+12%</span> vs 1h ago
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Calls In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{overviewMetrics.callsInProgress}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tabular-nums ${overviewMetrics.errorRate > 1 ? 'text-[var(--status-warning)]' : 'text-[var(--status-active)]'}`}>
              {overviewMetrics.errorRate}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Last 5 minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{overviewMetrics.avgLatency}<span className="text-sm font-normal text-muted-foreground ml-0.5">ms</span></div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Provider Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{overviewMetrics.providerAvailability}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">All AI providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tabular-nums ${overviewMetrics.activeIncidents > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-active)]'}`}>
              {overviewMetrics.activeIncidents}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently open</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Platform Availability</CardTitle>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums">99.98%</p>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </div>
              <Sparkline data={availabilityTrend} color="hsl(var(--status-active))" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums">0.42%</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-[var(--status-warning)]" />
                  <span className="text-[var(--status-warning)]">+0.18%</span> vs 1h ago
                </p>
              </div>
              <Sparkline data={errorRateTrend} color="hsl(var(--status-warning))" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums">820<span className="text-sm font-normal text-muted-foreground ml-0.5">ms</span></p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-[var(--status-active)]" />
                  <span className="text-[var(--status-active)]">-25ms</span> vs 1h ago
                </p>
              </div>
              <Sparkline data={latencyTrend} color="hsl(var(--primary))" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Health</CardTitle>
            <Badge variant="outline" className="text-xs">
              {services.filter(s => s.status === 'Operational').length} / {services.length} operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Availability</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Error Rate</TableHead>
                <TableHead>Last Incident</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((svc) => {
                const Icon = svc.icon
                return (
                  <TableRow key={svc.name}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm">{svc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[svc.status]}>
                        {svc.status === 'Operational' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {svc.status === 'Degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {svc.status === 'Incident' && <XCircle className="h-3 w-3 mr-1" />}
                        {svc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{svc.availability}%</TableCell>
                    <TableCell className="text-right tabular-nums">{svc.latency}ms</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={svc.errorRate > 1 ? 'text-[var(--status-warning)]' : ''}>
                        {svc.errorRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{svc.lastIncident}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Provider Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Provider Health</CardTitle>
            <Badge variant="outline" className="text-xs">
              {providers.filter(p => p.status === 'Operational').length} / {providers.length} operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Availability</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Error Rate</TableHead>
                <TableHead>Last Checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((prov) => (
                <TableRow key={prov.name}>
                  <TableCell className="font-medium text-sm">{prov.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{prov.service}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[prov.status]}>
                      {prov.status === 'Operational' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {prov.status === 'Degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {prov.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{prov.availability}%</TableCell>
                  <TableCell className="text-right tabular-nums">{prov.latency}ms</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={prov.errorRate > 1 ? 'text-[var(--status-warning)]' : ''}>
                      {prov.errorRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{prov.lastChecked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Incidents</CardTitle>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium text-sm">{inc.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inc.service}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityStyles[inc.severity]}>
                      {inc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inc.started}</TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{inc.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inc.status === 'Resolved'
                          ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
                          : inc.status === 'Monitoring'
                          ? 'border-blue-500/30 text-blue-500'
                          : 'border-[var(--status-warning)]/30 text-[var(--status-warning)]'
                      }
                    >
                      {inc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <IncidentDetailDialog incident={inc} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}