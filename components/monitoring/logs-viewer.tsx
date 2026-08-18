'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { logEntries, type LogEntry, type LogLevel } from '@/lib/monitoring-data'
import {
  Search, RefreshCw, Download, Filter, X, ChevronDown, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const levelConfig: Record<LogLevel, { badge: string }> = {
  INFO:  { badge: 'text-blue-700 bg-blue-50 border-blue-200' },
  WARN:  { badge: 'text-amber-700 bg-amber-50 border-amber-200' },
  ERROR: { badge: 'text-red-700 bg-red-50 border-red-200' },
  DEBUG: { badge: 'text-muted-foreground bg-muted border-border' },
}

const allServices = Array.from(new Set(logEntries.map(l => l.service))).sort()
const allComponents = Array.from(new Set(logEntries.map(l => l.component))).sort()

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function LogDetailDialog({ log, open, onClose }: { log: LogEntry; open: boolean; onClose: () => void }) {
  const cfg = levelConfig[log.level]
  const fields: [string, string | number | boolean | undefined][] = [
    ['Timestamp', formatTs(log.timestamp)],
    ['Correlation ID', log.correlationId],
    ['Service', log.service],
    ['Component', log.component],
    ['Error Code', log.errorCode],
    ['Duration', log.durationMs != null ? `${log.durationMs}ms` : undefined],
    ['Status Code', log.statusCode],
    ['Agent', log.agentName ? `${log.agentName} (${log.agentId})` : undefined],
    ['Call ID', log.callId],
    ['Session ID', log.sessionId],
    ['Workspace', log.workspaceName ? `${log.workspaceName} (${log.workspaceId})` : undefined],
  ]
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className={cn('text-xs shrink-0 mt-0.5', cfg.badge)}>{log.level}</Badge>
            <p className="text-sm font-medium leading-snug">{log.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.filter(([, v]) => v != null && v !== '').map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="mt-0.5 text-xs font-mono break-all">{String(value)}</p>
              </div>
            ))}
          </div>
          {Object.keys(log.details).length > 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Event Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {Object.entries(log.details).map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <span className="text-[11px] text-muted-foreground shrink-0">{k}</span>
                    <span className="text-xs font-mono truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LogRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState(false)
  const cfg = levelConfig[log.level]
  return (
    <>
      <tr
        className={cn('border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors', log.level === 'ERROR' && 'bg-red-50/30', log.level === 'WARN' && 'bg-amber-50/20')}
        onClick={() => setExpanded(e => !e)}
      >
        <td className="py-2.5 pl-4 pr-2">
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </td>
        <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap font-mono">{formatTs(log.timestamp)}</td>
        <td className="py-2.5 pr-4">
          <Badge variant="outline" className={cn('text-[10px]', cfg.badge)}>{log.level}</Badge>
        </td>
        <td className="py-2.5 pr-4 text-xs whitespace-nowrap">{log.service}</td>
        <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{log.component}</td>
        <td className="py-2.5 pr-4 text-xs max-w-[320px] truncate">{log.message}</td>
        <td className="py-2.5 pr-4 text-xs font-mono text-muted-foreground whitespace-nowrap">{log.correlationId}</td>
        <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{log.callId ?? '—'}</td>
        <td className="py-2.5 pr-4">
          {log.durationMs != null && (
            <span className={cn('text-xs tabular-nums', log.durationMs > 1000 ? 'text-amber-700 font-medium' : 'text-muted-foreground')}>
              {log.durationMs}ms
            </span>
          )}
        </td>
        <td className="py-2.5 pr-4">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={e => { e.stopPropagation(); setDetail(true) }}>
            View
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/50 bg-muted/20">
          <td colSpan={10} className="px-8 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
              {log.agentName && <span><span className="text-muted-foreground">Agent: </span>{log.agentName}</span>}
              {log.workspaceName && <span><span className="text-muted-foreground">Workspace: </span>{log.workspaceName}</span>}
              {log.errorCode && <span><span className="text-muted-foreground">Error Code: </span><span className="font-mono">{log.errorCode}</span></span>}
              {log.statusCode && <span><span className="text-muted-foreground">Status: </span>{log.statusCode}</span>}
              {Object.entries(log.details).slice(0, 4).map(([k, v]) => (
                <span key={k}><span className="text-muted-foreground">{k}: </span><span className="font-mono">{String(v)}</span></span>
              ))}
            </div>
          </td>
        </tr>
      )}
      {detail && <LogDetailDialog log={log} open={detail} onClose={() => setDetail(false)} />}
    </>
  )
}

export function LogsViewer() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [service, setService] = useState('all')
  const [component, setComponent] = useState('all')

  const filtered = useMemo(() => logEntries.filter(l => {
    if (level !== 'all' && l.level !== level) return false
    if (service !== 'all' && l.service !== service) return false
    if (component !== 'all' && l.component !== component) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        l.message.toLowerCase().includes(q) ||
        l.correlationId.toLowerCase().includes(q) ||
        (l.callId?.toLowerCase().includes(q) ?? false) ||
        (l.errorCode?.toLowerCase().includes(q) ?? false) ||
        (l.agentName?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  }), [search, level, service, component])

  const hasFilters = level !== 'all' || service !== 'all' || component !== 'all' || search !== ''

  const clearFilters = () => { setLevel('all'); setService('all'); setComponent('all'); setSearch('') }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Logs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Application and operational event log · {filtered.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search message, correlation ID, call ID…"
            className="h-8 pl-8 text-xs w-72"
          />
        </div>
        <Select value={level} onValueChange={v => v && setLevel(v)}>
          <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="WARN">WARN</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
            <SelectItem value="DEBUG">DEBUG</SelectItem>
          </SelectContent>
        </Select>
        <Select value={service} onValueChange={v => v && setService(v)}>
          <SelectTrigger className="h-8 w-52 text-xs"><SelectValue placeholder="Service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {allServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={component} onValueChange={v => v && setComponent(v)}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Component" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All components</SelectItem>
            {allComponents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Log level summary */}
      <div className="flex gap-3 flex-wrap">
        {(['ERROR', 'WARN', 'INFO', 'DEBUG'] as LogLevel[]).map(lvl => {
          const count = logEntries.filter(l => l.level === lvl).length
          const cfg = levelConfig[lvl]
          return (
            <button
              key={lvl}
              onClick={() => setLevel(level === lvl ? 'all' : lvl)}
              className={cn('flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-colors', cfg.badge, level === lvl ? 'ring-2 ring-offset-1 ring-current' : 'opacity-80 hover:opacity-100')}
            >
              {lvl} <span className="font-semibold">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Log table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 pl-4 pr-2 w-6" />
                {['Timestamp', 'Level', 'Service', 'Component', 'Message', 'Correlation ID', 'Call ID', 'Duration', ''].map(h => (
                  <th key={h} className="py-2.5 pr-4 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No log entries match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(log => <LogRow key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
