'use client'

import { useState } from 'react'
import { workspaces, type Workspace } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Bot,
  PhoneCall,
  Settings,
  Ban,
  ExternalLink,
} from 'lucide-react'

const planColors: Record<string, string> = {
  enterprise: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  professional: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  starter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export function WorkspaceList() {
  const [search, setSearch] = useState('')

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.owner.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Workspace Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspaces, plans, and tenant configuration for this organization.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Workspaces', value: workspaces.length, icon: Building2 },
          { label: 'Active', value: workspaces.filter((w) => w.status === 'active').length, icon: Building2 },
          { label: 'Total Agents', value: workspaces.reduce((a, w) => a + w.agents, 0), icon: Bot },
          { label: 'Monthly Calls', value: workspaces.reduce((a, w) => a + w.monthlyCalls, 0).toLocaleString(), icon: PhoneCall },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search workspaces..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[220px]">Workspace</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Agents</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Monthly Calls</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ws) => (
              <WorkspaceRow key={ws.id} ws={ws} />
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                  No workspaces match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function WorkspaceRow({ ws }: { ws: Workspace }) {
  return (
    <TableRow className="border-border">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-sm">
            {ws.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{ws.name}</p>
            <p className="text-xs text-muted-foreground">{ws.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{ws.owner}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${planColors[ws.plan]}`}>
          {ws.plan}
        </span>
      </TableCell>
      <TableCell className="text-sm font-mono text-muted-foreground">{ws.region}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.agents}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.users}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{ws.monthlyCalls.toLocaleString()}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            ws.status === 'active'
              ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
              : 'border-destructive/30 text-destructive'
          }
        >
          {ws.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> Open Workspace
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Users className="h-3.5 w-3.5" /> Manage Users
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Ban className="h-3.5 w-3.5" /> Suspend Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
