'use client'

import { useState, useMemo } from 'react'
import { BellDot, Save, Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { notificationRules, type NotificationRule, type NotificationChannel, type NotificationSeverity } from '@/lib/admin-data'

const severityConfig: Record<NotificationSeverity, string> = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  high:     'text-orange-700 bg-orange-50 border-orange-200',
  medium:   'text-amber-700 bg-amber-50 border-amber-200',
  low:      'text-blue-700 bg-blue-50 border-blue-200',
  info:     'text-muted-foreground bg-muted border-border',
}

const channelLabel: Record<NotificationChannel, string> = {
  in_app: 'In-app',
  email:  'Email',
  sms:    'SMS',
}

const channelColor: Record<NotificationChannel, string> = {
  in_app: 'text-violet-700 bg-violet-50 border-violet-200',
  email:  'text-blue-700 bg-blue-50 border-blue-200',
  sms:    'text-emerald-700 bg-emerald-50 border-emerald-200',
}

const CATEGORIES = ['All', 'System', 'AI', 'Calls', 'Campaigns', 'Documents', 'Agents', 'Security', 'Account']

export function AdminNotifications() {
  const [rules, setRules] = useState<NotificationRule[]>(notificationRules)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [saved, setSaved] = useState(false)

  const filtered = useMemo(() => rules.filter(r => {
    if (category !== 'All' && r.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return r.event.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    }
    return true
  }), [rules, search, category])

  const toggle = (id: string) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))

  const toggleChannel = (id: string, ch: NotificationChannel) =>
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r
      const channels = r.channels.includes(ch)
        ? r.channels.filter(c => c !== ch)
        : [...r.channels, ch]
      return { ...r, channels }
    }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const hasFilters = category !== 'All' || search !== ''

  const enabledCount = rules.filter(r => r.enabled).length

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><BellDot className="h-5 w-5" /> Notifications</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{enabledCount} of {rules.length} notification rules enabled.</p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave}>
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['critical','high','medium','info'] as NotificationSeverity[]).map(sev => {
          const count = rules.filter(r => r.severity === sev && r.enabled).length
          return (
            <div key={sev} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground capitalize">{sev} alerts</p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground">enabled</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="h-8 pl-8 text-xs w-56" />
        </div>
        <Select value={category} onValueChange={v => v && setCategory(v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All categories' : c}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={() => { setSearch(''); setCategory('All') }}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} rules</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Enabled', 'Category', 'Event', 'Severity', 'Channels', 'Recipient'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No rules match the current filters.</td></tr>
              ) : filtered.map(rule => (
                <tr key={rule.id} className={cn('border-b border-border/50 last:border-0 transition-colors', rule.enabled ? 'hover:bg-muted/20' : 'opacity-50 hover:bg-muted/10')}>
                  <td className="px-4 py-3">
                    <Switch checked={rule.enabled} onCheckedChange={() => toggle(rule.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">{rule.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium">{rule.event}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('text-[10px] capitalize', severityConfig[rule.severity])}>{rule.severity}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(['in_app', 'email', 'sms'] as NotificationChannel[]).map(ch => (
                        <button
                          key={ch}
                          onClick={() => toggleChannel(rule.id, ch)}
                          className={cn(
                            'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium transition-opacity',
                            rule.channels.includes(ch) ? channelColor[ch] : 'text-muted-foreground/40 bg-muted/20 border-border/40 line-through'
                          )}
                        >
                          {channelLabel[ch]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{rule.recipient}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Click channel badges to toggle individual channels per rule. Changes take effect after saving.</p>
    </div>
  )
}
