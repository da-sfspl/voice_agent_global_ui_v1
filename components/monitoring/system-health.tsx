'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { serviceHealthData, type ServiceHealth, type ServiceStatus } from '@/lib/monitoring-data'
import {
  CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  RefreshCw, ExternalLink, ScrollText, BellDot, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const statusConfig: Record<ServiceStatus, { label: string; icon: React.ElementType; badge: string; row: string }> = {
  healthy:  { label: 'Healthy',  icon: CheckCircle2,   badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', row: '' },
  degraded: { label: 'Degraded', icon: AlertTriangle,   badge: 'text-amber-700 bg-amber-50 border-amber-200',       row: 'bg-amber-50/40' },
  down:     { label: 'Down',     icon: XCircle,         badge: 'text-red-700 bg-red-50 border-red-200',             row: 'bg-red-50/40' },
  unknown:  { label: 'Unknown',  icon: HelpCircle,      badge: 'text-muted-foreground bg-muted border-border',      row: '' },
}

const statusIconColor: Record<ServiceStatus, string> = {
  healthy:  'text-emerald-600',
  degraded: 'text-amber-500',
  down:     'text-red-600',
  unknown:  'text-muted-foreground',
}

const groupLabels: Record<string, string> = {
  'voice-ai':     'Voice & AI Services',
  'platform':     'Platform Services',
  'integrations': 'External Integrations',
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function ServiceDetailDialog({ svc, open, onClose }: { svc: ServiceHealth; open: boolean; onClose: () => void }) {
  const cfg = statusConfig[svc.status]
  const Icon = cfg.icon
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Icon className={cn('h-5 w-5', statusIconColor[svc.status])} />
            <div>
              <h2 className="text-base font-semibold">{svc.name}</h2>
              <p className="text-xs text-muted-foreground">{groupLabels[svc.group]}</p>
            </div>
            <Badge variant="outline" className={cn('ml-auto text-xs', cfg.badge)}>{cfg.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Uptime', value: svc.uptime },
              { label: 'Response Latency', value: svc.latencyMs != null ? `${svc.latencyMs}ms` : '—' },
              { label: 'Error Rate', value: svc.errorRate },
              { label: 'Last Health Check', value: formatTs(svc.lastCheck) },
            ].map(r => (
              <div key={r.label} className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className="mt-0.5 text-sm font-medium">{r.value}</p>
              </div>
            ))}
          </div>
          {svc.activity && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Current Activity</p>
              <p className="mt-0.5 text-sm">{svc.activity}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs flex-1">
              <ScrollText className="h-3.5 w-3.5" /> View Logs
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs flex-1">
              <BellDot className="h-3.5 w-3.5" /> View Alerts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SystemHealthDashboard() {
  const [selected, setSelected] = useState<ServiceHealth | null>(null)
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toLocaleTimeString())

  const healthy  = serviceHealthData.filter(s => s.status === 'healthy').length
  const degraded = serviceHealthData.filter(s => s.status === 'degraded').length
  const down     = serviceHealthData.filter(s => s.status === 'down').length
  const total    = serviceHealthData.length
  const activeIncidents = degraded + down
  const overallStatus: ServiceStatus = down > 0 ? 'down' : degraded > 0 ? 'degraded' : 'healthy'
  const avgLatency = Math.round(
    serviceHealthData.filter(s => s.latencyMs != null).reduce((a, s) => a + (s.latencyMs ?? 0), 0) /
    serviceHealthData.filter(s => s.latencyMs != null).length
  )

  const kpis = [
    { label: 'Overall Status',       value: statusConfig[overallStatus].label, color: overallStatus === 'healthy' ? 'text-emerald-700' : overallStatus === 'degraded' ? 'text-amber-700' : 'text-red-700' },
    { label: 'Services Operational', value: `${healthy} / ${total}`,           color: 'text-foreground' },
    { label: 'Active Incidents',     value: String(activeIncidents),            color: activeIncidents > 0 ? 'text-amber-700' : 'text-emerald-700' },
    { label: 'Avg Platform Latency', value: `${avgLatency}ms`,                 color: 'text-foreground' },
  ]

  const groups = ['voice-ai', 'platform', 'integrations'] as const

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">System Health</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Platform service status and operational health · Last refreshed {lastRefresh}</p>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setLastRefresh(new Date().toLocaleTimeString())}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{k.label}</span>
            <span className={cn('text-2xl font-semibold tabular-nums', k.color)}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Overall status banner */}
      {activeIncidents > 0 && (
        <div className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
          overallStatus === 'down' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'
        )}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {activeIncidents} service{activeIncidents > 1 ? 's' : ''} {overallStatus === 'down' ? 'down' : 'degraded'} —
          </span>
          <span>Some platform capabilities may be affected. See details below.</span>
        </div>
      )}

      {/* Service tables by group */}
      {groups.map(group => {
        const services = serviceHealthData.filter(s => s.group === group)
        return (
          <div key={group} className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold">{groupLabels[group]}</h3>
              <span className="text-xs text-muted-foreground">
                {services.filter(s => s.status === 'healthy').length}/{services.length} healthy
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Service', 'Status', 'Uptime', 'Latency', 'Error Rate', 'Last Check', 'Activity', ''].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => {
                    const cfg = statusConfig[svc.status]
                    const Icon = cfg.icon
                    return (
                      <tr key={svc.id} className={cn('border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors', cfg.row)}>
                        <td className="px-5 py-3 text-sm font-medium whitespace-nowrap">{svc.name}</td>
                        <td className="px-5 py-3">
                          <span className={cn('inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium', cfg.badge)}>
                            <Icon className="h-3 w-3" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs tabular-nums">{svc.uptime}</td>
                        <td className="px-5 py-3 text-xs tabular-nums">
                          {svc.latencyMs != null
                            ? <span className={svc.latencyMs > 300 ? 'text-amber-700 font-medium' : ''}>{svc.latencyMs}ms</span>
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-xs tabular-nums">
                          <span className={parseFloat(svc.errorRate) > 1 ? 'text-amber-700 font-medium' : ''}>{svc.errorRate}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTs(svc.lastCheck)}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{svc.activity ?? '—'}</td>
                        <td className="px-5 py-3">
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs px-2" onClick={() => setSelected(svc)}>
                            <ExternalLink className="h-3 w-3" /> Details
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Uptime visualization */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">Service Availability Overview</h3>
        <p className="text-xs text-muted-foreground mb-4">Current uptime across all monitored services</p>
        <div className="flex flex-col gap-3">
          {serviceHealthData.map(svc => {
            const pct = parseFloat(svc.uptime)
            const cfg = statusConfig[svc.status]
            const barColor = svc.status === 'healthy' ? 'bg-emerald-500' : svc.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
            return (
              <div key={svc.id} className="flex items-center gap-3">
                <span className="w-52 text-xs text-foreground truncate shrink-0">{svc.name}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
                </div>
                <span className={cn('w-16 text-right text-xs font-medium tabular-nums', cfg.badge.split(' ')[0])}>{svc.uptime}</span>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <ServiceDetailDialog svc={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
