'use client'

import { useState } from 'react'
import { users, roles, type User } from '@/lib/data'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  Pencil,
  Trash2,
  UserX,
  Mail,
  KeyRound,
} from 'lucide-react'

const statusStyle: Record<string, string> = {
  active: 'border-[var(--status-active)]/30 text-[var(--status-active)]',
  inactive: 'border-border text-muted-foreground',
  pending: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
  if (iso === '—') return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function UserList() {
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspace members, roles, and access permissions.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Active', value: users.filter((u) => u.status === 'active').length },
          { label: 'Pending Invites', value: users.filter((u) => u.status === 'pending').length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
              <TableHead className="w-[220px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    {user.role}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyle[user.status]}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium ${user.mfaEnabled ? 'text-[var(--status-active)]' : 'text-muted-foreground'}`}>
                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit User</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Change Role</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Mail className="h-3.5 w-3.5" /> Resend Invite</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><KeyRound className="h-3.5 w-3.5" /> Reset Password</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <UserX className="h-3.5 w-3.5" /> Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Full Name</Label>
            <Input placeholder="Jane Smith" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email Address</Label>
            <Input type="email" placeholder="jane.smith@company.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select defaultValue="role-004">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Require MFA on first login</p>
              <p className="text-xs text-muted-foreground">User must set up multi-factor authentication</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
