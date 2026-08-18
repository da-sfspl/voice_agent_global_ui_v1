'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Search, Eye } from 'lucide-react'

const mockLogs = [
  { id: '1', time: '2024-05-12 14:32:01', sev: 'error', svc: 'AI Routing', org: 'Acme Corp', event: 'AI provider timeout: OpenAI gpt-4o exceeded 5000ms', corr: 'req-8a7b9c', status: 'failed' },
  { id: '2', time: '2024-05-12 14:31:45', sev: 'warn', svc: 'AI Routing', org: 'Acme Corp', event: 'Provider fallback triggered: OpenAI -> Anthropic', corr: 'req-8a7b9c', status: 'recovered' },
  { id: '3', time: '2024-05-12 14:28:12', sev: 'info', svc: 'Admin API', org: 'Nova Healthcare', event: 'Organization configuration changed: Updated TTS provider', corr: 'req-1f2e3d', status: 'success' },
  { id: '4', time: '2024-05-12 14:15:00', sev: 'error', svc: 'Telephony', org: 'Zenith Finance', event: 'Call processing failure: SIP trunk unavailable', corr: 'req-9z8y7x', status: 'failed' },
]

export default function PlatformLogsPage() {
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')

  const filtered = mockLogs.filter(l => 
    l.event.toLowerCase().includes(search.toLowerCase()) &&
    (sevFilter === 'all' || l.sev === sevFilter)
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Logs</h1>
        <p className="text-sm text-muted-foreground">Platform-wide event logs across all services and organizations.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Stream</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-64" />
              </div>
              <Select value={sevFilter} onValueChange={(v) => v && setSevFilter(v)}>
                <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
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
                <TableHead>Severity</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Correlation ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      log.sev === 'error' ? 'border-destructive/30 text-destructive' : 
                      log.sev === 'warn' ? 'border-[var(--status-warning)]/30 text-[var(--status-warning)]' : 
                      'text-muted-foreground'
                    }>
                      {log.sev}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{log.svc}</TableCell>
                  <TableCell className="text-xs">{log.org}</TableCell>
                  <TableCell className="text-xs max-w-md truncate">{log.event}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.corr}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Details</DialogTitle>
                          <DialogDescription>Full details for this platform event.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-4 text-sm">
                          <div><span className="font-medium">Event:</span> {log.event}</div>
                          <div><span className="font-medium">Correlation ID:</span> <code className="bg-muted px-1 rounded">{log.corr}</code></div>
                          <div><span className="font-medium">Status:</span> {log.status}</div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Raw Payload (Mock)</p>
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">{`{\n  "service": "${log.svc}",\n  "org_id": "org_${log.id}",\n  "timestamp": "${log.time}",\n  "trace_id": "${log.corr}"\n}`}</pre>
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