'use client'

import { useState } from 'react'
import { contacts, contactLists, campaigns, type Contact, type ContactStatus, type ContactCallOutcome } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users, Plus, Search, MoreHorizontal, Upload, Download, Pencil,
  Trash2, PhoneOutgoing, UserPlus, Tag, CheckCircle2, XCircle,
  PhoneMissed, Voicemail, Clock, Ban, ChevronRight, Building2,
  Mail, Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<ContactStatus, { label: string; className: string }> = {
  active:      { label: 'Active',     className: 'border-[var(--status-active)]/30 text-[var(--status-active)]' },
  dnc:         { label: 'DNC',        className: 'border-destructive/30 text-destructive' },
  'opted-out': { label: 'Opted Out',  className: 'border-destructive/30 text-destructive' },
  invalid:     { label: 'Invalid',    className: 'border-border text-muted-foreground' },
}

const outcomeConfig: Record<ContactCallOutcome, { label: string; icon: React.ElementType; color: string }> = {
  contacted:  { label: 'Contacted',  icon: CheckCircle2, color: 'text-[var(--status-active)]' },
  voicemail:  { label: 'Voicemail',  icon: Voicemail,    color: 'text-[var(--status-warning)]' },
  'no-answer':{ label: 'No Answer',  icon: PhoneMissed,  color: 'text-muted-foreground' },
  busy:       { label: 'Busy',       icon: PhoneOutgoing,color: 'text-muted-foreground' },
  failed:     { label: 'Failed',     icon: XCircle,      color: 'text-destructive' },
  pending:    { label: 'Pending',    icon: Clock,        color: 'text-muted-foreground' },
  dnc:        { label: 'DNC',        icon: Ban,          color: 'text-destructive' },
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ContactsManager() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [listFilter, setListFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = contacts.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchList = listFilter === 'all' || c.contactListIds.includes(listFilter)
    const matchOutcome = outcomeFilter === 'all' || c.lastOutcome === outcomeFilter
    return matchSearch && matchStatus && matchList && matchOutcome
  })

  const totalActive = contacts.filter((c) => c.status === 'active').length
  const totalDnc = contacts.filter((c) => c.status === 'dnc' || c.status === 'opted-out').length
  const totalContacted = contacts.filter((c) => c.lastOutcome === 'contacted').length

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage contact lists, audience segments, and campaign assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'text-primary' },
          { label: 'Active', value: totalActive, icon: CheckCircle2, color: 'text-[var(--status-active)]' },
          { label: 'DNC / Opted Out', value: totalDnc, icon: Ban, color: 'text-destructive' },
          { label: 'Contacted (All Time)', value: totalContacted, icon: PhoneOutgoing, color: 'text-muted-foreground' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn('h-4 w-4', s.color)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Contact Lists Summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Contact Lists</p>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New List
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {contactLists.map((list) => (
            <button
              key={list.id}
              onClick={() => setListFilter(listFilter === list.id ? 'all' : list.id)}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors',
                listFilter === list.id
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground',
              )}
            >
              <Users className="h-3 w-3" />
              <span>{list.name}</span>
              <span className="font-mono font-medium">{list.totalContacts.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, company..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="dnc">DNC</SelectItem>
            <SelectItem value="opted-out">Opted Out</SelectItem>
            <SelectItem value="invalid">Invalid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v ?? 'all')}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Last Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="voicemail">Voicemail</SelectItem>
            <SelectItem value="no-answer">No Answer</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-1.5 ml-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <span className="text-xs text-muted-foreground">{filtered.length} contacts</span>
      </div>

      {/* Table + Detail Panel */}
      <div className={cn('flex gap-4', selected && 'items-start')}>
        <div className={cn('rounded-lg border border-border bg-card flex-1 min-w-0', selected && 'max-w-[calc(100%-320px)]')}>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Lists</TableHead>
                <TableHead>Last Outcome</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isSelected={selected?.id === contact.id}
                  onSelect={() => setSelected(selected?.id === contact.id ? null : contact)}
                />
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No contacts match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <ContactDetailPanel contact={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      <AddContactDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <ImportContactsDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}

function ContactRow({
  contact: c, isSelected, onSelect,
}: { contact: Contact; isSelected: boolean; onSelect: () => void }) {
  const sc = statusConfig[c.status]
  const oc = outcomeConfig[c.lastOutcome]
  const OcIcon = oc.icon

  return (
    <TableRow
      className={cn('border-border cursor-pointer', isSelected && 'bg-primary/5')}
      onClick={onSelect}
    >
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {c.firstName[0]}{c.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
            <p className="text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{c.phone}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{c.company ?? '—'}</TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {c.contactListIds.slice(0, 2).map((lid) => {
            const list = contactLists.find((l) => l.id === lid)
            return list ? (
              <span key={lid} className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-muted-foreground">
                {list.name.split(' ').slice(0, 2).join(' ')}
              </span>
            ) : null
          })}
          {c.contactListIds.length > 2 && (
            <span className="text-[10px] text-muted-foreground">+{c.contactListIds.length - 2}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className={cn('flex items-center gap-1.5 text-xs', oc.color)}>
          <OcIcon className="h-3.5 w-3.5 shrink-0" />
          {oc.label}
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{fmtDate(c.lastContactedAt)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit Contact</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Tag className="h-3.5 w-3.5" /> Manage Tags</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><PhoneOutgoing className="h-3.5 w-3.5" /> Assign to Campaign</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2"><Ban className="h-3.5 w-3.5" /> Add to DNC</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Remove Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function ContactDetailPanel({ contact: c, onClose }: { contact: Contact; onClose: () => void }) {
  const sc = statusConfig[c.status]
  const oc = outcomeConfig[c.lastOutcome]
  const OcIcon = oc.icon

  return (
    <div className="w-72 shrink-0 rounded-lg border border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <p className="text-sm font-semibold">Contact Details</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xs">
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {c.firstName[0]}{c.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{c.firstName} {c.lastName}</p>
            {c.jobTitle && <p className="text-xs text-muted-foreground">{c.jobTitle}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono">{c.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{c.email}</span>
          </div>
          {c.company && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>{c.company}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
          <div className={cn('flex items-center gap-1 text-xs', oc.color)}>
            <OcIcon className="h-3.5 w-3.5" />
            {oc.label}
          </div>
        </div>

        <Separator />

        {/* Tags */}
        {c.tags.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1">
              {c.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Call History */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Call History</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/40 p-2">
              <p className="text-[10px] text-muted-foreground">Total Calls</p>
              <p className="text-sm font-semibold tabular-nums">{c.totalCalls}</p>
            </div>
            <div className="rounded-md bg-muted/40 p-2">
              <p className="text-[10px] text-muted-foreground">Last Contacted</p>
              <p className="text-xs font-medium">{fmtDate(c.lastContactedAt)}</p>
            </div>
          </div>
        </div>

        {/* Campaigns */}
        {c.campaignIds.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Campaigns</p>
            {c.campaignIds.map((cid) => {
              const camp = campaigns.find((x) => x.id === cid)
              return camp ? (
                <div key={cid} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{camp.name}</span>
                </div>
              ) : null
            })}
          </div>
        )}

        {/* Business Attributes */}
        {Object.keys(c.attributes).length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Attributes</p>
              <div className="flex flex-col gap-1">
                {Object.entries(c.attributes).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 w-full">
            <Pencil className="h-3.5 w-3.5" /> Edit Contact
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 w-full">
            <PhoneOutgoing className="h-3.5 w-3.5" /> Assign to Campaign
          </Button>
        </div>
      </div>
    </div>
  )
}

function AddContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>First Name</Label>
              <Input placeholder="Jane" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Last Name</Label>
              <Input placeholder="Smith" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone Number</Label>
            <Input placeholder="+1 (555) 000-0000" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email Address</Label>
            <Input type="email" placeholder="jane.smith@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Company</Label>
              <Input placeholder="Acme Corp" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Job Title</Label>
              <Input placeholder="VP of Engineering" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contact List</Label>
            <Select defaultValue="">
              <SelectTrigger><SelectValue placeholder="Assign to list" /></SelectTrigger>
              <SelectContent>
                {contactLists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <Input placeholder="Comma-separated tags (e.g. enterprise, warm)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Add Contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportContactsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Target Contact List</Label>
            <Select defaultValue="">
              <SelectTrigger><SelectValue placeholder="Select or create list" /></SelectTrigger>
              <SelectContent>
                {contactLists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
                <SelectItem value="new">+ Create New List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Upload File</Label>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Drop a CSV or XLSX file here</p>
              <p className="text-xs text-muted-foreground">or</p>
              <Button size="sm" variant="outline">Browse Files</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Required columns: <span className="font-mono">first_name, last_name, phone</span>. Optional: email, company, job_title, tags.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Duplicate Handling</Label>
            <Select defaultValue="skip">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip duplicates</SelectItem>
                <SelectItem value="update">Update existing records</SelectItem>
                <SelectItem value="error">Fail on duplicates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gap-1.5">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
