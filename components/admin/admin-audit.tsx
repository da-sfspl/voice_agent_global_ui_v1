'use client'

import { useState, useMemo } from 'react'
import { ClipboardList, Search, X, Download, Eye, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { auditEvents, type AuditEvent } from '@/lib/admin-data'

const resultConfig = {
  success: { label: 'Success', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2, iconClass: 'text-emerald-600' },
  failure: { label: 'Failure', badge: 'text-red-700 bg-red-50 border-red-200',             icon: XCircle,       iconClass: 'text-red-600' },
  warning: { label: 'Warning', badge: 'text-amber-700 bg-amber-50 border-amber-200',       icon: AlertTriangle, iconClass: 'text-amber-600' },
}

const MODULES = ['All', 'Administration', 'AI Agents', 'AI Providers', 'Campaigns', 'Platform', 'Security', 'Telephony']
const RESULTS = ['All', 'success', 'failure', 'warning']

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function AuditDetailDialog({ event: e, open, onClose }: { event: AuditEvent; open: boolean; onClose: () => void }) {
  const res = resultConfig[e.result]
  const ResIcon = res.icon
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <ResIcon className={cn('h-5 w-5 mt-0.5 shrink-0', res.iconClass)} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">{e.action}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{formatTs(e.timestamp)}</p>
            </div>
            <Badge variant="outline" className={cn('text-[10px] shrink-0', res.badge)}>{res.label}</Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'User',        value: `${e.user} (${e.userEmail})` },
              { label: 'Module',      value: e.module },
              { label: 'Resource',    value: e.resource },
              { label: 'Resource ID', value: e.resourceId },
              { label: 'IP Address',  value: e.ip },
              { label: 'Device',      value: e.device },
            ].map(r => (
              <div key={r.label} className="rounded-md border border-border bg-muted/30 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{r.label}</p>
                <p className="mt-0.5 text-xs font-mono break-all">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminAuditLogs() {
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('All')
  const [result, setResult] = useState('All')
  const [user, setUser] = useState('All')
  const [selected, setSelected] = useState<AuditEvent | null>(null)

  const uniqueUsers = useMemo(() => ['All', ...Array.from(new Set(auditEvents.map(e => e.user)))], [])

  const filtered = useMemo(() => auditEvents.filter(e => {
    if (module !== 'All' && e.module !== module) return false
    if (result !== 'All' && e.result !== result) return false
    if (user !== 'All' && e.user !== user) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        e.action.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.resourceId.toLowerCase().includes(q)
      )
    }
    return true
  }), [search, module, result, user])

  const hasFilters = module !== 'All' || result !== 'All' || user !== 'All' || search !== ''
  const clearFilters = () => { setSearch(''); setModule('All'); setResult('All'); setUser('All') }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Audit Logs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Read-only record of administrative and configuration changes · {filtered.length} events</p>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['success','failure','warning'] as const).map(r => {
          const cfg = resultConfig[r]
          const Icon = cfg.icon
          const count = auditEvents.filter(e => e.result === r).length
          return (
            <button
              key={r}
              onClick={() => setResult(result === r ? 'All' : r)}
              className={cn('rounded-lg border bg-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-muted/30', result === r && 'ring-2 ring-primary')}
            >
              <Icon className={cn('h-5 w-5 shrink-0', cfg.iconClass)} />
              <div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <p className="text-2xl font-semibold tabular-nums">{count}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="h-8 pl-8 text-xs w-64" />
        </div>
        <Select value={module} onValueChange={v => v && setModule(v)}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            {MODULES.map(m => <SelectItem key={m} value={m}>{m === 'All' ? 'All modules' : m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={user} onValueChange={v => v && setUser(v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u === 'All' ? 'All users' : u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={result} onValueChange={v => v && setResult(v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Result" /></SelectTrigger>
          <SelectContent>
            {RESULTS.map(r => <SelectItem key={r} value={r} className="capitalize">{r === 'All' ? 'All results' : r}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Timestamp', 'User', 'Action', 'Resource', 'Module', 'Result', 'IP / Device', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No audit events match the current filters.</td></tr>
              ) : filtered.map(e => {
                const res = resultConfig[e.result]
                const ResIcon = res.icon
                return (
                  <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">{formatTs(e.timestamp)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{e.user}</p>
                      <p className="text-[10px] text-muted-foreground">{e.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{e.action}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{e.resource}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{e.resourceId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{e.module}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-[10px] gap-1', res.badge)}>
                        <ResIcon className="h-2.5 w-2.5" />{res.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-mono text-muted-foreground">{e.ip}</p>
                      <p className="text-[10px] text-muted-foreground">{e.device}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1" onClick={() => setSelected(e)}>
                        <Eye className="h-3 w-3" /> View
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <AuditDetailDialog event={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
