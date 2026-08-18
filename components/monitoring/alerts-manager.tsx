'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { alertsData, type Alert, type AlertSeverity, type AlertStatus } from '@/lib/monitoring-data'
import {
  Search, RefreshCw, X, CheckCheck, Eye, ScrollText, Activity,
  AlertTriangle, XCircle, Info, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const severityConfig: Record<AlertSeverity, { label: string; badge: string; row: string; icon: React.ElementType }> = {
  critical:      { label: 'Critical',      badge: 'text-red-800 bg-red-100 border-red-300',         row: 'bg-red-50/40',    icon: XCircle },
  high:          { label: 'High',          badge: 'text-red-700 bg-red-50 border-red-200',           row: 'bg-red-50/20',    icon: AlertTriangle },
  medium:        { label: 'Medium',        badge: 'text-amber-700 bg-amber-50 border-amber-200',     row: 'bg-amber-50/20',  icon: AlertTriangle },
  low:           { label: 'Low',           badge: 'text-blue-700 bg-blue-50 border-blue-200',        row: '',                icon: Info },
  informational: { label: 'Informational', badge: 'text-muted-foreground bg-muted border-border',    row: '',                icon: Info },
}

const statusConfig: Record<AlertStatus, { label: string; badge: string }> = {
  active:       { label: 'Active',       badge: 'text-red-700 bg-red-50 border-red-200' },
  acknowledged: { label: 'Acknowledged', badge: 'text-amber-700 bg-amber-50 border-amber-200' },
  resolved:     { label: 'Resolved',     badge: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function AlertDetailDialog({ alert: a, open, onClose, onAck, onResolve }: {
  alert: Alert; open: boolean; onClose: () => void
  onAck: () => void; onResolve: () => void
}) {
  const sev = severityConfig[a.severity]
  const sta = statusConfig[a.status]
  const SevIcon = sev.icon
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <SevIcon className={cn('h-5 w-5 mt-0.5 shrink-0', a.severity === 'critical' || a.severity === 'high' ? 'text-red-600' : a.severity === 'medium' ? 'text-amber-600' : 'text-muted-foreground')} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold leading-snug">{a.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{a.service}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="outline" className={cn('text-[10px]', sev.badge)}>{sev.label}</Badge>
              <Badge variant="outline" className={cn('text-[10px]', sta.badge)}>{sta.label}</Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Trigger Condition', value: a.triggerCondition },
              { label: 'Current Value',     value: a.currentValue },
              { label: 'Threshold',         value: a.threshold },
              { label: 'Occurrences',       value: String(a.occurrences) },
              { label: 'First Detected',    value: formatTs(a.firstDetected) },
              { label: 'Last Detected',     value: formatTs(a.lastDetected) },
              ...(a.assignedTeam ? [{ label: 'Assigned Team', value: a.assignedTeam }] : []),
              ...(a.acknowledgedBy ? [{ label: 'Acknowledged By', value: `${a.acknowledgedBy} at ${formatTs(a.acknowledgedAt!)}` }] : []),
              ...(a.resolvedAt ? [{ label: 'Resolved At', value: formatTs(a.resolvedAt) }] : []),
            ].map(r => (
              <div key={r.label} className="rounded-md border border-border bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{r.label}</p>
                <p className="mt-0.5 text-xs">{r.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1 flex-wrap">
            {a.status === 'active' && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={onAck}>
                <CheckCheck className="h-3.5 w-3.5" /> Acknowledge
              </Button>
            )}
            {a.status !== 'resolved' && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={onResolve}>
                <CheckCheck className="h-3.5 w-3.5" /> Mark Resolved
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
              <ScrollText className="h-3.5 w-3.5" /> View Related Logs
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" /> View Service Health
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>(alertsData)
  const [selected, setSelected] = useState<Alert | null>(null)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => alerts.filter(a => {
    if (severity !== 'all' && a.severity !== severity) return false
    if (status !== 'all' && a.status !== status) return false
    if (search) {
      const q = search.toLowerCase()
      return a.name.toLowerCase().includes(q) || a.service.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    }
    return true
  }), [alerts, search, severity, status])

  const activeCount = alerts.filter(a => a.status === 'active').length

  const ack = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged', acknowledgedBy: 'Current User', acknowledgedAt: new Date().toISOString() } : a))
  const resolve = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a))

  const hasFilters = severity !== 'all' || status !== 'all' || search !== ''
  const clearFilters = () => { setSeverity('all'); setStatus('all'); setSearch('') }

  const summaryBySeverity = (['critical', 'high', 'medium', 'low', 'informational'] as AlertSeverity[]).map(s => ({
    severity: s,
    active: alerts.filter(a => a.severity === s && a.status === 'active').length,
    total: alerts.filter(a => a.severity === s).length,
  }))

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              Alerts
              {activeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Alert management and incident monitoring · {filtered.length} alerts</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summaryBySeverity.map(({ severity: sev, active, total }) => {
          const cfg = severityConfig[sev]
          const SevIcon = cfg.icon
          return (
            <button
              key={sev}
              onClick={() => setSeverity(severity === sev ? 'all' : sev)}
              className={cn(
                'rounded-lg border bg-card p-4 flex flex-col gap-2 text-left transition-colors hover:bg-muted/40',
                severity === sev ? 'ring-2 ring-primary' : ''
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{cfg.label}</span>
                <SevIcon className={cn('h-3.5 w-3.5', active > 0 ? (sev === 'critical' || sev === 'high' ? 'text-red-600' : sev === 'medium' ? 'text-amber-600' : 'text-muted-foreground') : 'text-muted-foreground/40')} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tabular-nums">{active}</span>
                <span className="text-xs text-muted-foreground">/ {total} total</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts…" className="h-8 pl-8 text-xs w-64" />
        </div>
        <Select value={severity} onValueChange={v => v && setSeverity(v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="informational">Informational</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={v => v && setStatus(v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Alerts table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Alert', 'Severity', 'Status', 'Service', 'Current Value', 'Threshold', 'Occurrences', 'Last Detected', 'Team', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    No alerts match the current filters.
                  </td>
                </tr>
              ) : filtered.map(a => {
                const sev = severityConfig[a.severity]
                const sta = statusConfig[a.status]
                const SevIcon = sev.icon
                return (
                  <tr key={a.id} className={cn('border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors', a.status !== 'resolved' ? sev.row : '')}>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex items-start gap-2">
                        <SevIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', a.severity === 'critical' || a.severity === 'high' ? 'text-red-600' : a.severity === 'medium' ? 'text-amber-600' : 'text-muted-foreground')} />
                        <span className="text-xs font-medium leading-snug">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-[10px]', sev.badge)}>{sev.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-[10px]', sta.badge)}>{sta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{a.service}</td>
                    <td className="px-4 py-3 text-xs tabular-nums whitespace-nowrap">{a.currentValue}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.threshold}</td>
                    <td className="px-4 py-3 text-xs tabular-nums text-center">{a.occurrences}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTs(a.lastDetected)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.assignedTeam ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1" onClick={() => setSelected(a)}>
                          <Eye className="h-3 w-3" /> View
                        </Button>
                        {a.status === 'active' && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-amber-700 hover:text-amber-800" onClick={() => ack(a.id)}>
                            <CheckCheck className="h-3 w-3" /> Ack
                          </Button>
                        )}
                        {a.status !== 'resolved' && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-emerald-700 hover:text-emerald-800" onClick={() => resolve(a.id)}>
                            <CheckCheck className="h-3 w-3" /> Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <AlertDetailDialog
          alert={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onAck={() => { ack(selected.id); setSelected(prev => prev ? { ...prev, status: 'acknowledged' } : null) }}
          onResolve={() => { resolve(selected.id); setSelected(prev => prev ? { ...prev, status: 'resolved' } : null) }}
        />
      )}
    </div>
  )
}
