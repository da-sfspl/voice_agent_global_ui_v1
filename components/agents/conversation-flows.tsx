'use client'

import { useState } from 'react'
import { agents } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Workflow,
  Plus,
  Phone,
  MessageSquare,
  GitBranch,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  User,
  PhoneOff,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react'

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

type NodeType = 'trigger' | 'message' | 'condition' | 'action' | 'end'

type FlowNode = {
  id: string
  type: NodeType
  label: string
  description: string
  next?: string[]
}

const flowNodes: FlowNode[] = [
  { id: 'n1',  type: 'trigger',   label: 'Call Starts',              description: 'Inbound call received on configured DID',                 next: ['n2'] },
  { id: 'n2',  type: 'message',   label: 'Welcome Message',          description: 'Play welcome prompt and ask for customer name',            next: ['n3'] },
  { id: 'n3',  type: 'condition', label: 'Identity Verified?',       description: 'Check if customer identity can be confirmed via account lookup', next: ['n4', 'n8'] },
  { id: 'n4',  type: 'message',   label: 'Greet by Name',            description: 'Acknowledge the customer by name and ask for their issue',  next: ['n5'] },
  { id: 'n5',  type: 'condition', label: 'Intent Classified',        description: 'NLU classifies intent: Order, Refund, Technical, General',  next: ['n6', 'n7', 'n9'] },
  { id: 'n6',  type: 'action',    label: 'Lookup Order / Account',   description: 'API call to CRM or order management system',               next: ['n7'] },
  { id: 'n7',  type: 'message',   label: 'Provide Resolution',       description: 'Deliver answer, provide next steps, confirm satisfaction',  next: ['n10'] },
  { id: 'n8',  type: 'action',    label: 'Request Verification',     description: 'Ask for DOB or order number to verify identity (max 2 attempts)', next: ['n4', 'n11'] },
  { id: 'n9',  type: 'action',    label: 'Escalate to Human Agent',  description: 'Transfer call to live agent queue with context summary',   next: ['n10'] },
  { id: 'n10', type: 'message',   label: 'Closing & CSAT',           description: 'Thank customer, collect satisfaction rating (1–5)',         next: ['n12'] },
  { id: 'n11', type: 'message',   label: 'Verification Failed',      description: 'Inform caller, offer callback or self-service options',     next: ['n12'] },
  { id: 'n12', type: 'end',       label: 'Call Ends',                description: 'Hang up, write call summary and outcomes to CRM',          next: [] },
]

const nodeStyles: Record<NodeType, { border: string; bg: string; icon: React.ElementType; color: string }> = {
  trigger:   { border: 'border-[var(--status-active)]/40',   bg: 'bg-[var(--status-active)]/8',   icon: Phone,        color: 'text-[var(--status-active)]' },
  message:   { border: 'border-[var(--sidebar-primary)]/35', bg: 'bg-[var(--sidebar-primary)]/7', icon: MessageSquare, color: 'text-[var(--sidebar-primary)]' },
  condition: { border: 'border-[var(--status-warning)]/40',  bg: 'bg-[var(--status-warning)]/8',  icon: GitBranch,    color: 'text-[var(--status-warning)]' },
  action:    { border: 'border-border',                       bg: 'bg-muted/60',                   icon: Zap,          color: 'text-muted-foreground' },
  end:       { border: 'border-destructive/30',               bg: 'bg-destructive/8',              icon: PhoneOff,     color: 'text-destructive' },
}

const typeLabelStyle: Record<NodeType, string> = {
  trigger:   'text-[var(--status-active)] border-[var(--status-active)]/25',
  message:   'text-[var(--sidebar-primary)] border-[var(--sidebar-primary)]/25',
  condition: 'text-[var(--status-warning)] border-[var(--status-warning)]/25',
  action:    'text-muted-foreground border-border',
  end:       'text-destructive border-destructive/25',
}

const nodeStats: Record<string, { label: string; value: string }[]> = {
  n3:  [{ label: 'Pass rate', value: '91%' }, { label: 'Avg time', value: '14s' }],
  n5:  [{ label: 'Intent hit', value: '88%' }, { label: 'Fallthrough', value: '12%' }],
  n9:  [{ label: 'Escalations', value: '8%' }, { label: 'Avg wait', value: '2m 10s' }],
  n10: [{ label: 'CSAT avg', value: '4.3/5' }, { label: 'Response rate', value: '72%' }],
}

export function ConversationFlows() {
  const [agentId, setAgentId] = useState('agt-001')
  const [selected, setSelected] = useState<FlowNode | null>(null)

  const [nodes, setNodes] = useState<FlowNode[]>(flowNodes)

    //  State for the Add Node Dialog
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false)
  const [newNodeForm, setNewNodeForm] = useState({
    label: '',
    type: 'message' as NodeType,
    description: '',
    insertAfterId: '' // Which node to insert after
  })

  //  CHANGE 3: Logic to save the new node and wire up the flow connections
  function handleSaveNode() {
    if (!newNodeForm.label || !newNodeForm.insertAfterId) return
    
    const newNodeId = `n${Date.now()}`
    const newNode: FlowNode = {
      id: newNodeId,
      type: newNodeForm.type,
      label: newNodeForm.label,
      description: newNodeForm.description,
      next: []
    }

    setNodes(prevNodes => {
      const newNodes = [...prevNodes]
      const insertIndex = newNodes.findIndex(n => n.id === newNodeForm.insertAfterId)
      
      if (insertIndex !== -1) {
        const previousNode = newNodes[insertIndex]
        
        // The new node inherits the 'next' targets of the previous node
        newNode.next = previousNode.next ? [...previousNode.next] : []
        
        // The previous node now points exclusively to the new node
        previousNode.next = [newNodeId]
        
        // Insert the new node into the visual array
        newNodes.splice(insertIndex + 1, 0, newNode)
      }
      return newNodes
    })

    // Reset form and close dialog
    setShowAddNodeDialog(false)
    setNewNodeForm({ label: '', type: 'message', description: '', insertAfterId: '' })
  }



  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Conversation Flow</h1>
            <p className="text-sm text-muted-foreground">Define the decision tree and node logic for each agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={agentId} onValueChange={(v) => setAgentId(v ?? 'agt-001')}>
            <SelectTrigger className="h-8 text-sm w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agents.filter((a) => a.status !== 'archived').map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2" onClick={() => setShowAddNodeDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Node
          </Button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Flow canvas */}
        <div className="flex-1 rounded-lg border border-border bg-card p-5 overflow-x-auto">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            {(Object.entries(nodeStyles) as [NodeType, typeof nodeStyles[NodeType]][]).map(([type, s]) => {
              const Icon = s.icon
              return (
                <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                  <Icon className={cn('h-3 w-3', s.color)} />
                  {type}
                </div>
              )
            })}
          </div>
          <Separator className="mb-5" />

          {/* Node list (linear representation) */}
          <div className="flex flex-col gap-2">
            {nodes.map((node, i) => {
              const s = nodeStyles[node.type]
              const Icon = s.icon
              const stats = nodeStats[node.id]
              return (
                <div key={node.id} className="flex flex-col gap-0">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(node.id === selected?.id ? null : node)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(node.id === selected?.id ? null : node)
                      }
                    }}
                    className={cn(
                      'flex items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors hover:bg-accent cursor-pointer',
                      s.border, s.bg,
                      selected?.id === node.id && 'ring-1 ring-[var(--sidebar-primary)]/40'
                    )}
                  >
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border mt-0.5', s.border, 'bg-background/60')}>
                      <Icon className={cn('h-3.5 w-3.5', s.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{node.label}</span>
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize', typeLabelStyle[node.type])}>
                          {node.type}
                        </Badge>
                        {node.next && node.next.length > 1 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[var(--status-warning)] border-[var(--status-warning)]/25">
                            {node.next.length} branches
                          </Badge>
                        )}
                        {stats && stats.map((st) => (
                          <span key={st.label} className="text-[11px] text-muted-foreground">
                            {st.label}: <span className="text-foreground font-medium">{st.value}</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-background/80 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-background/80 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Connector */}
                  {i < flowNodes.length - 1 && (
                    <div className="flex items-center gap-2 pl-[46px] py-0.5">
                      {node.next && node.next.length > 1 ? (
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {node.type === 'condition' ? (
                            <>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-[var(--status-active)]" />
                                Yes
                              </span>
                              <ArrowRight className="h-3 w-3" />
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-destructive" />
                                No / fallback
                              </span>
                            </>
                          ) : (
                            <>
                              <GitBranch className="h-3 w-3 text-[var(--status-warning)]" />
                              <span>Branch by intent</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — node inspector */}
        {selected && (
          <div className="w-64 shrink-0 flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Node Inspector</span>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">
                Close
              </button>
            </div>
            <Separator />

            {(() => {
              const s = nodeStyles[selected.type]
              const Icon = s.icon
              return (
                <div className="flex flex-col gap-3">
                  <div className={cn('flex items-center gap-2 rounded-md border px-3 py-2', s.border, s.bg)}>
                    <Icon className={cn('h-4 w-4 shrink-0', s.color)} />
                    <span className="text-sm font-medium">{selected.label}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Node ID</span>
                      <span className="font-mono text-[11px]">{selected.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize font-medium">{selected.type}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Description</span>
                      <span className="leading-relaxed text-foreground">{selected.description}</span>
                    </div>
                    {selected.next && selected.next.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Exits to</span>
                        <div className="flex flex-wrap gap-1">
                          {selected.next.map((nId) => {
                            const target = nodes.find((n) => n.id === nId)
                            return (
                              <Badge key={nId} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {target?.label ?? nId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {nodeStats[selected.id] && (
                    <>
                      <Separator />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">Performance (30d)</span>
                        <div className="grid grid-cols-2 gap-2">
                          {nodeStats[selected.id].map((st) => (
                            <div key={st.label} className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/40 px-2 py-1.5">
                              <span className="text-[10px] text-muted-foreground">{st.label}</span>
                              <span className="text-sm font-semibold tabular-nums">{st.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {selected.type === 'condition' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Branch Rules
                      </span>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-[var(--status-active)] shrink-0" />
                          <span className="text-muted-foreground">Condition met → next primary node</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-destructive shrink-0" />
                          <span className="text-muted-foreground">Not met → fallback / retry path</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selected.type === 'action' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Action Type</span>
                      <Badge variant="outline" className="text-[10px] w-fit">API Call / Transfer</Badge>
                    </div>
                  )}

                  <Button size="sm" className="w-full gap-2">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Node
                  </Button>
                </div>
              )
            })()}
          </div>
        )}
      </div>
      {/*  CORRECTED ADD NODE DIALOG  */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
            <DialogDescription>
              Define the logic for this step in the conversation flow.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Node Label</Label>
              <Input 
                placeholder="e.g. Ask for Order Number" 
                value={newNodeForm.label} 
                onChange={(e) => setNewNodeForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Node Type</Label>
              <Select 
                value={newNodeForm.type} 
                //  FIXED: Handled the potential `null` value safely
                onValueChange={(v) => {
                  if (v) {
                    setNewNodeForm(f => ({ ...f, type: v as NodeType }))
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trigger">Trigger</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <textarea 
                placeholder="What happens in this node?"
                value={newNodeForm.description}
                onChange={(e) => setNewNodeForm(f => ({ ...f, description: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Insert After (Flow Connection)</Label>
              <Select 
                value={newNodeForm.insertAfterId} 
                //  FIXED: Handled the potential `null` value safely
                onValueChange={(v) => {
                  if (v) {
                    setNewNodeForm(f => ({ ...f, insertAfterId: v }))
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select node to insert after" /></SelectTrigger>
                <SelectContent>
                  {nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                The new node will be placed immediately after the selected node in the flow.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNodeDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNode}>Save Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}