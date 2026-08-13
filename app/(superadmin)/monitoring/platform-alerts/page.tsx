'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, CheckCircle2 } from 'lucide-react'

const initialAlerts = [
  { id: '1', title: 'AI provider elevated latency', sev: 'warning', svc: 'AI Routing', orgs: '3 affected', triggered: '14 mins ago', status: 'active' },
  { id: '2', title: 'STT provider availability issue', sev: 'critical', svc: 'STT Gateway', orgs: '1 affected (Nova)', triggered: '1 hour ago', status: 'acknowledged' },
  { id: '3', title: 'Cost threshold exceeded', sev: 'warning', svc: 'Billing', orgs: 'Acme Corp', triggered: '3 hours ago', status: 'active' },
  { id: '4', title: 'Telephony error rate increased', sev: 'critical', svc: 'Telephony', orgs: 'All', triggered: '5 hours ago', status: 'resolved' },
]

export default function PlatformAlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [statusFilter, setStatusFilter] = useState('all')

  const updateStatus = (id: string, status: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = alerts.filter(a => statusFilter === 'all' || a.status === statusFilter)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform Alerts</h1>
          <p className="text-sm text-muted-foreground">Manage and respond to platform-wide operational alerts.</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Affected Orgs</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {a.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={a.sev === 'critical' ? 'border-destructive/30 text-destructive' : 'border-[var(--status-warning)]/30 text-[var(--status-warning)]'}>
                      {a.sev}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{a.svc}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.orgs}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.triggered}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      a.status === 'resolved' ? 'text-[var(--status-active)]' : 
                      a.status === 'acknowledged' ? 'text-primary' : 
                      'text-[var(--status-warning)]'
                    }>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'active' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(a.id, 'acknowledged')}>Acknowledge</Button>
                      )}
                      {a.status !== 'resolved' && (
                        <Button variant="ghost" size="sm" className="text-[var(--status-active)]" onClick={() => updateStatus(a.id, 'resolved')}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
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