'use client'

import { useState } from 'react'
import { Building2, Search, Download, Filter, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const mockOrgs = [
  { id: '1', name: 'Acme Corporation', status: 'active', agents: 24, calls: 145200, mins: 42450, stt: 12400, tts: 11800, llm: 890000, cost: 450000 },
  { id: '2', name: 'Nova Healthcare', status: 'active', agents: 12, calls: 89400, mins: 31200, stt: 8900, tts: 8500, llm: 450000, cost: 285000 },
  { id: '3', name: 'Zenith Finance', status: 'active', agents: 18, calls: 112000, mins: 28500, stt: 9200, tts: 8800, llm: 620000, cost: 340000 },
  { id: '4', name: 'Bright Retail', status: 'warning', agents: 8, calls: 45000, mins: 12400, stt: 4100, tts: 3900, llm: 210000, cost: 125000 },
  { id: '5', name: 'Vertex Logistics', status: 'inactive', agents: 0, calls: 0, mins: 0, stt: 0, tts: 0, llm: 0, cost: 0 },
]

export default function OrganizationUsagePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = mockOrgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || o.status === statusFilter)
  )

  const totals = mockOrgs.reduce((acc, o) => ({
    calls: acc.calls + o.calls,
    mins: acc.mins + o.mins,
    cost: acc.cost + o.cost
  }), { calls: 0, mins: 0, cost: 0 })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organization Usage</h1>
          <p className="text-sm text-muted-foreground">Monitor usage and resource consumption across all organizations on the platform.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Organizations</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5</div><p className="text-xs text-muted-foreground">4 Active, 1 Inactive</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Calls (30d)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totals.calls.toLocaleString()}</div><p className="text-xs text-[var(--status-active)]">+12.5% from last month</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Call Minutes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totals.mins.toLocaleString()}</div><p className="text-xs text-muted-foreground">Avg 4.2 min/call</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Platform Cost (30d)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{(totals.cost).toLocaleString()}</div><p className="text-xs text-[var(--status-warning)]">+8.2% from last month</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organization Breakdown</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-64" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Agents</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Minutes</TableHead>
                <TableHead className="text-right">STT (min)</TableHead>
                <TableHead className="text-right">TTS (chars)</TableHead>
                <TableHead className="text-right">LLM (tokens)</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={org.status === 'active' ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : org.status === 'warning' ? 'border-[var(--status-warning)]/30 text-[var(--status-warning)]' : 'text-muted-foreground'}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{org.agents}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.calls.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.mins.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.stt.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.tts.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{org.llm.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">₹{org.cost.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}