'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Eye, ShieldCheck } from 'lucide-react'

const mockAudit = [
  { id: '1', time: '2024-05-12 14:30:00', actor: 'Superadmin (Alex)', org: 'Platform', action: 'Provider Enabled', resource: 'AI Providers / OpenAI', changes: { status: { before: 'inactive', after: 'active' } }, source: 'Web UI' },
  { id: '2', time: '2024-05-12 13:15:22', actor: 'Superadmin (Sarah)', org: 'Nova Healthcare', action: 'Organization Suspended', resource: 'Organizations / Nova', changes: { status: { before: 'active', after: 'suspended' } }, source: 'Web UI' },
  { id: '3', time: '2024-05-12 11:05:10', actor: 'System', org: 'Platform', action: 'Routing Policy Changed', resource: 'Routing / LLM Fallback', changes: { fallback: { before: 'Anthropic', after: 'Google Vertex' } }, source: 'API' },
  { id: '4', time: '2024-05-12 09:00:00', actor: 'Superadmin (Alex)', org: 'Platform', action: 'Platform Setting Updated', resource: 'Settings / Security', changes: { mfa_enforced: { before: 'false', after: 'true' } }, source: 'Web UI' },
]

export default function PlatformAuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const filtered = mockAudit.filter(a => 
    (a.actor.toLowerCase().includes(search.toLowerCase()) || a.resource.toLowerCase().includes(search.toLowerCase())) &&
    (actionFilter === 'all' || a.action.toLowerCase().includes(actionFilter.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> Platform Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">Review administrative changes and security events across the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search actor or resource..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-64" />
              </div>
              <Select value={actionFilter} onValueChange={(v) => v && setActionFilter(v)}>
                <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Action Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="changed">Changed</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.time}</TableCell>
                  <TableCell className="text-xs font-medium">{log.actor}</TableCell>
                  <TableCell className="text-xs">{log.org}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.resource}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.source}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                    <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                        <Eye className="h-4 w-4" />
                    </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Change Details</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">Actor:</span> <span className="font-medium">{log.actor}</span></div>
                            <div><span className="text-muted-foreground">Timestamp:</span> <span className="font-mono text-xs">{log.time}</span></div>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2">Changes Made</p>
                            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                              {Object.entries(log.changes).map(([key, val]: [string, any]) => (
                                <div key={key} className="flex items-center gap-2 text-xs font-mono">
                                  <span className="text-muted-foreground w-32">{key}:</span>
                                  <Badge variant="outline" className="text-destructive">{val.before}</Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge variant="outline" className="text-[var(--status-active)]">{val.after}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

function Separator() {
  return <div className="h-px w-full bg-border" />
}