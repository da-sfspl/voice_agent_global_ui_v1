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
  Save, Copy, Eye, Play,
  Calendar, Clock, Sparkles,
  Headphones, CreditCard, ShieldAlert, Users
} from 'lucide-react'

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'


// ─── Types ──────────────────────────────────────────────────────────────────
type NodeType = 'trigger' | 'message' | 'condition' | 'action' | 'end'
type PatternType = 'appointment-booking' | 'customer-support' | 'lead-qualification' | 'payment-collection' | 'complaint-handling'

type FlowNode = {
  id: string
  type: NodeType
  label: string
  description: string
  next?: string[]
  // For condition nodes
  yesBranch?: string
  noBranch?: string
  decision?: string
  // For trigger nodes
  triggerEvent?: string
  // For end nodes
  completionOutcome?: string
}

type ConversationPattern = {
  id: PatternType
  name: string
  description: string
  icon: React.ElementType
  nodes: FlowNode[]
}

// ─── Conversation Patterns (Business Journey Templates) ─────────────────────
const conversationPatterns: ConversationPattern[] = [
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Schedule appointments by collecting preferences and checking availability',
    icon: Calendar,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Start', description: 'Appointment request or booking intent detected.', triggerEvent: 'Booking Intent Detected', next: ['n2'] },
      { id: 'n2', type: 'message', label: 'Identify Requirement', description: 'Determine the type of appointment and service needed.', next: ['n3'] },
      { id: 'n3', type: 'message', label: 'Collect Preferences', description: 'Collect preferred date, time, and appointment details.', next: ['n4'] },
      { id: 'n4', type: 'condition', label: 'Requirements Complete?', description: 'Check if all required booking information is collected.', decision: 'Are all appointment details available?', yesBranch: 'n5', noBranch: 'n3', next: ['n5', 'n3'] },
      { id: 'n5', type: 'action', label: 'Check Availability', description: 'Check available slots using configured scheduling capability.', next: ['n6'] },
      { id: 'n6', type: 'condition', label: 'Slot Available?', description: 'Determine if suitable appointment slots are available.', decision: 'Are there available slots?', yesBranch: 'n7', noBranch: 'n9', next: ['n7', 'n9'] },
      { id: 'n7', type: 'message', label: 'Present Options', description: 'Present available appointment options to customer.', next: ['n8'] },
      { id: 'n8', type: 'condition', label: 'Customer Confirms?', description: 'Check if customer confirms the appointment.', decision: 'Does customer confirm?', yesBranch: 'n10', noBranch: 'n3', next: ['n10', 'n3'] },
      { id: 'n9', type: 'message', label: 'Alternative Options', description: 'Discuss alternative dates or times.', next: ['n3'] },
      { id: 'n10', type: 'action', label: 'Complete Booking', description: 'Finalize the appointment booking.', next: ['n11'] },
      { id: 'n11', type: 'message', label: 'Confirmation', description: 'Confirm appointment details with customer.', next: ['n12'] },
      { id: 'n12', type: 'end', label: 'Complete', description: 'Appointment booking workflow complete.', completionOutcome: 'Booking Completed', next: [] },
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Handle customer issues from identification to resolution',
    icon: Headphones,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Start', description: 'Support request or issue reported.', triggerEvent: 'Support Request Received', next: ['n2'] },
      { id: 'n2', type: 'message', label: 'Identify Issue', description: 'Understand what problem the customer is experiencing.', next: ['n3'] },
      { id: 'n3', type: 'message', label: 'Diagnose', description: 'Gather information to diagnose the root cause.', next: ['n4'] },
      { id: 'n4', type: 'message', label: 'Determine Resolution', description: 'Identify the appropriate solution or next steps.', next: ['n5'] },
      { id: 'n5', type: 'action', label: 'Resolve', description: 'Execute the resolution using available capabilities.', next: ['n6'] },
      { id: 'n6', type: 'message', label: 'Confirm Satisfaction', description: 'Verify the issue is resolved to customer satisfaction.', next: ['n7'] },
      { id: 'n7', type: 'end', label: 'Complete', description: 'Support case resolved.', completionOutcome: 'Issue Resolved', next: [] },
    ]
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification',
    description: 'Qualify leads and determine next steps based on criteria',
    icon: Users,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Start', description: 'New lead or inquiry received.', triggerEvent: 'Lead Inquiry Received', next: ['n2'] },
      { id: 'n2', type: 'message', label: 'Establish Requirement', description: 'Understand the prospect needs and requirements.', next: ['n3'] },
      { id: 'n3', type: 'message', label: 'Qualification Questions', description: 'Ask qualifying questions to assess fit.', next: ['n4'] },
      { id: 'n4', type: 'condition', label: 'Qualified?', description: 'Evaluate if lead meets qualification criteria.', decision: 'Does lead meet qualification criteria?', yesBranch: 'n5', noBranch: 'n6', next: ['n5', 'n6'] },
      { id: 'n5', type: 'action', label: 'Schedule Follow-up', description: 'Schedule next steps or demo with qualified lead.', next: ['n7'] },
      { id: 'n6', type: 'action', label: 'Close', description: 'Politely close with unqualified lead.', next: ['n7'] },
      { id: 'n7', type: 'end', label: 'Complete', description: 'Lead qualification complete.', completionOutcome: 'Qualification Complete', next: [] },
    ]
  },
  {
    id: 'payment-collection',
    name: 'Loan / Payment Collection',
    description: 'Collect outstanding payments through structured conversation',
    icon: CreditCard,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Start', description: 'Payment collection call initiated.', triggerEvent: 'Collection Call Started', next: ['n2'] },
      { id: 'n2', type: 'message', label: 'Customer Identification', description: 'Verify customer identity and account.', next: ['n3'] },
      { id: 'n3', type: 'message', label: 'Account Status', description: 'Review outstanding balance and payment history.', next: ['n4'] },
      { id: 'n4', type: 'message', label: 'Discuss Outstanding Amount', description: 'Discuss the outstanding amount and payment options.', next: ['n5'] },
      { id: 'n5', type: 'message', label: 'Payment Intent', description: 'Gauge customer intent and ability to pay.', next: ['n6'] },
      { id: 'n6', type: 'action', label: 'Commitment / Payment', description: 'Secure payment commitment or process payment.', next: ['n7'] },
      { id: 'n7', type: 'message', label: 'Confirmation', description: 'Confirm payment details and next steps.', next: ['n8'] },
      { id: 'n8', type: 'end', label: 'Complete', description: 'Payment collection complete.', completionOutcome: 'Payment Processed', next: [] },
    ]
  },
  {
    id: 'complaint-handling',
    name: 'Complaint Handling',
    description: 'Handle customer complaints with appropriate escalation',
    icon: ShieldAlert,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Start', description: 'Customer complaint received.', triggerEvent: 'Complaint Received', next: ['n2'] },
      { id: 'n2', type: 'message', label: 'Identify Complaint', description: 'Understand the nature of the complaint.', next: ['n3'] },
      { id: 'n3', type: 'message', label: 'Capture Details', description: 'Gather all relevant details about the issue.', next: ['n4'] },
      { id: 'n4', type: 'condition', label: 'Resolution Available?', description: 'Determine if resolution can be provided immediately.', decision: 'Can this be resolved now?', yesBranch: 'n5', noBranch: 'n6', next: ['n5', 'n6'] },
      { id: 'n5', type: 'action', label: 'Resolve', description: 'Provide immediate resolution to the complaint.', next: ['n7'] },
      { id: 'n6', type: 'action', label: 'Escalate', description: 'Escalate to appropriate team or manager.', next: ['n7'] },
      { id: 'n7', type: 'message', label: 'Confirmation', description: 'Confirm resolution or escalation details.', next: ['n8'] },
      { id: 'n8', type: 'end', label: 'Complete', description: 'Complaint handling complete.', completionOutcome: 'Complaint Addressed', next: [] },
    ]
  },
]

// ─── Styles & Config ────────────────────────────────────────────────────────
const nodeStyles: Record<NodeType, { border: string; bg: string; icon: React.ElementType; color: string }> = {
  trigger:   { border: 'border-[var(--status-active)]/40',   bg: 'bg-[var(--status-active)]/8',   icon: Sparkles,     color: 'text-[var(--status-active)]' },
  message:   { border: 'border-[var(--sidebar-primary)]/35', bg: 'bg-[var(--sidebar-primary)]/7', icon: MessageSquare, color: 'text-[var(--sidebar-primary)]' },
  condition: { border: 'border-[var(--status-warning)]/40',  bg: 'bg-[var(--status-warning)]/8',  icon: GitBranch,    color: 'text-[var(--status-warning)]' },
  action:    { border: 'border-border',                       bg: 'bg-muted/60',                   icon: Zap,          color: 'text-muted-foreground' },
  end:       { border: 'border-destructive/30',               bg: 'bg-destructive/8',              icon: CheckCircle2, color: 'text-destructive' },
}

const typeLabelStyle: Record<NodeType, string> = {
  trigger:   'text-[var(--status-active)] border-[var(--status-active)]/25',
  message:   'text-[var(--sidebar-primary)] border-[var(--sidebar-primary)]/25',
  condition: 'text-[var(--status-warning)] border-[var(--status-warning)]/25',
  action:    'text-muted-foreground border-border',
  end:       'text-destructive border-destructive/25',
}

const nodeStats: Record<string, { label: string; value: string }[]> = {
  n3:  [{ label: 'Completion rate', value: '94%' }, { label: 'Avg duration', value: '38s' }],
  n4:  [{ label: 'Pass rate', value: '89%' }, { label: 'Retry rate', value: '11%' }],
  n6:  [{ label: 'Availability rate', value: '76%' }, { label: 'Avg decision time', value: '4s' }],
  n8:  [{ label: 'Confirmation rate', value: '71%' }, { label: 'Drop-off', value: '29%' }],
}

const triggerEvents = [
  'Call Started',
  'Intent Detected',
  'Campaign Started',
  'Workflow Invoked',
  'Booking Intent Detected',
  'Support Request Received',
  'Lead Inquiry Received',
  'Collection Call Started',
  'Complaint Received',
]

const completionOutcomes = [
  'Booking Completed',
  'Issue Resolved',
  'Qualification Complete',
  'Payment Processed',
  'Complaint Addressed',
  'Workflow Completed',
  'Unable to Complete',
  'Escalated',
]

// ─── Main Component ─────────────────────────────────────────────────────────
export function ConversationFlows() {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('appointment-booking')
  const [agentId, setAgentId] = useState('agt-001')
  const [selected, setSelected] = useState<FlowNode | null>(null)
  const [nodes, setNodes] = useState<FlowNode[]>(conversationPatterns[0].nodes)
  const [flowStatus, setFlowStatus] = useState<'draft' | 'published'>('draft')

  // Add/Edit Node Dialog state
  const [showNodeDialog, setShowNodeDialog] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [nodeForm, setNodeForm] = useState({
    label: '',
    type: 'message' as NodeType,
    description: '',
    connectAfterId: '',
    decision: '',
    yesBranchId: '',
    noBranchId: '',
    triggerEvent: 'Intent Detected',
    completionOutcome: 'Workflow Completed',
  })

  const currentPattern = conversationPatterns.find(p => p.id === selectedPattern)

  // ─── Pattern Change Handler ───────────────────────────────────────────────
  function handlePatternChange(patternId: PatternType) {
    setSelectedPattern(patternId)
    const pattern = conversationPatterns.find(p => p.id === patternId)
    if (pattern) {
      setNodes(pattern.nodes)
      setSelected(null)
    }
  }

  // ─── Open Add Node Dialog ─────────────────────────────────────────────────
  function openAddNodeDialog() {
    setEditingNodeId(null)
    setNodeForm({
      label: '',
      type: 'message',
      description: '',
      connectAfterId: '',
      decision: '',
      yesBranchId: '',
      noBranchId: '',
      triggerEvent: 'Intent Detected',
      completionOutcome: 'Workflow Completed',
    })
    setShowNodeDialog(true)
  }

  // ─── Open Edit Node Dialog ────────────────────────────────────────────────
  function openEditNodeDialog(node: FlowNode) {
    setEditingNodeId(node.id)
    setNodeForm({
      label: node.label,
      type: node.type,
      description: node.description,
      connectAfterId: '',
      decision: node.decision || '',
      yesBranchId: node.yesBranch || '',
      noBranchId: node.noBranch || '',
      triggerEvent: node.triggerEvent || 'Intent Detected',
      completionOutcome: node.completionOutcome || 'Workflow Completed',
    })
    setShowNodeDialog(true)
  }

  // ─── Save Node Logic ──────────────────────────────────────────────────────
  function handleSaveNode() {
    if (!nodeForm.label) return
    
    const isEditing = editingNodeId !== null
    const nodeId = isEditing ? editingNodeId : `n${Date.now()}`
    
    const nodeData: FlowNode = {
      id: nodeId,
      type: nodeForm.type,
      label: nodeForm.label,
      description: nodeForm.description,
      next: [],
    }

    // Add type-specific fields
    if (nodeForm.type === 'condition') {
      nodeData.decision = nodeForm.decision
      nodeData.yesBranch = nodeForm.yesBranchId || undefined
      nodeData.noBranch = nodeForm.noBranchId || undefined
      nodeData.next = [nodeForm.yesBranchId, nodeForm.noBranchId].filter(Boolean)
    } else if (nodeForm.type === 'trigger') {
      nodeData.triggerEvent = nodeForm.triggerEvent
    } else if (nodeForm.type === 'end') {
      nodeData.completionOutcome = nodeForm.completionOutcome
    }

    if (isEditing) {
      // Update existing node
      setNodes(prevNodes => prevNodes.map(n => n.id === nodeId ? nodeData : n))
    } else {
      // Add new node
      if (!nodeForm.connectAfterId) return
      
      setNodes(prevNodes => {
        const newNodes = [...prevNodes]
        const connectIndex = newNodes.findIndex(n => n.id === nodeForm.connectAfterId)
        
        if (connectIndex !== -1) {
          const previousNode = newNodes[connectIndex]
          
          if (previousNode.type !== 'condition') {
            nodeData.next = previousNode.next ? [...previousNode.next] : []
            previousNode.next = [nodeId]
          }
          
          newNodes.splice(connectIndex + 1, 0, nodeData)
        }
        return newNodes
      })
    }

    setShowNodeDialog(false)
    setEditingNodeId(null)
    setNodeForm({
      label: '',
      type: 'message',
      description: '',
      connectAfterId: '',
      decision: '',
      yesBranchId: '',
      noBranchId: '',
      triggerEvent: 'Intent Detected',
      completionOutcome: 'Workflow Completed',
    })
  }

  // ─── Delete Node ──────────────────────────────────────────────────────────
  function handleDeleteNode(nodeId: string) {
    setNodes(prevNodes => {
      // Remove node and update references
      const newNodes = prevNodes.filter(n => n.id !== nodeId)
      return newNodes.map(n => ({
        ...n,
        next: n.next?.filter(id => id !== nodeId),
        yesBranch: n.yesBranch === nodeId ? undefined : n.yesBranch,
        noBranch: n.noBranch === nodeId ? undefined : n.noBranch,
      }))
    })
    if (selected?.id === nodeId) setSelected(null)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Workflow className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <h1 className="text-xl font-semibold">Conversation Flow</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Define reusable business and conversation patterns that agents can optionally follow.
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {currentPattern && <currentPattern.icon className="h-3 w-3" />}
                <span>{currentPattern?.name}</span>
              </div>
              <Badge variant="outline" className={cn(
                'text-[10px] px-1.5 py-0 h-4',
                flowStatus === 'published' 
                  ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' 
                  : 'border-border text-muted-foreground'
              )}>
                {flowStatus === 'published' ? 'Published' : 'Draft'}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last updated: 2 hours ago
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setFlowStatus('published')}>
            <Play className="h-4 w-4" />
            Publish
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Info Note */}
      <div className="rounded-lg border border-border bg-accent/30 p-4 text-xs text-muted-foreground">
        <p className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--status-warning)]" />
          <span>
            This flow is optional. Agents without an assigned flow operate autonomously using their configured objective, instructions, knowledge, tools, rules, and policies.
          </span>
        </p>
      </div>

      {/* Pattern & Agent Selection */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Pattern:</Label>
          <Select value={selectedPattern} onValueChange={(v) => v && handlePatternChange(v as PatternType)}>
            <SelectTrigger className="h-8 text-sm w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conversationPatterns.map((pattern) => (
                <SelectItem key={pattern.id} value={pattern.id}>
                  <div className="flex items-center gap-2">
                    <pattern.icon className="h-3.5 w-3.5" />
                    <span>{pattern.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Assigned Agent:</Label>
          <Select value={agentId} onValueChange={(v) => v && setAgentId(v)}>
            <SelectTrigger className="h-8 text-sm w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agents.filter((a) => a.status !== 'archived').map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" className="gap-2 ml-auto" onClick={openAddNodeDialog}>
          <Plus className="h-4 w-4" />
          Add Stage
        </Button>
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
                  {type === 'message' ? 'Conversation Stage' : 
                   type === 'action' ? 'Process Stage' : type}
                </div>
              )
            })}
          </div>
          <Separator className="mb-5" />

          {/* Node list */}
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
                          {node.type === 'message' ? 'conversation' : 
                           node.type === 'action' ? 'process' : node.type}
                        </Badge>
                        {node.type === 'condition' && node.yesBranch && node.noBranch && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[var(--status-warning)] border-[var(--status-warning)]/25">
                            2 branches
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
                        onClick={(e) => { e.stopPropagation(); openEditNodeDialog(node) }}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-background/80 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id) }}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-background/80 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Connector */}
                  {i < nodes.length - 1 && (
                    <div className="flex items-center gap-2 pl-[46px] py-0.5">
                      {node.type === 'condition' && node.yesBranch && node.noBranch ? (
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-[var(--status-active)]" />
                            Yes → {nodes.find(n => n.id === node.yesBranch)?.label}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-destructive" />
                            No → {nodes.find(n => n.id === node.noBranch)?.label}
                          </span>
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
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stage Details</span>
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
                      <span className="text-muted-foreground">Stage Type</span>
                      <span className="capitalize font-medium">
                        {selected.type === 'message' ? 'Conversation Stage' : 
                         selected.type === 'action' ? 'Process Stage' : selected.type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Description</span>
                      <span className="leading-relaxed text-foreground">{selected.description}</span>
                    </div>
                    {selected.type === 'condition' && selected.decision && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Decision Point</span>
                        <span className="leading-relaxed text-foreground italic">{selected.decision}</span>
                      </div>
                    )}
                    {selected.type === 'trigger' && selected.triggerEvent && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Trigger Event</span>
                        <span className="font-medium">{selected.triggerEvent}</span>
                      </div>
                    )}
                    {selected.type === 'end' && selected.completionOutcome && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Completion Outcome</span>
                        <span className="font-medium">{selected.completionOutcome}</span>
                      </div>
                    )}
                    {selected.next && selected.next.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Next Stages</span>
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
                        <AlertTriangle className="h-3 w-3" /> Branches
                      </span>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-[var(--status-active)] shrink-0" />
                          <span className="text-muted-foreground">Yes → {nodes.find(n => n.id === selected.yesBranch)?.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-destructive shrink-0" />
                          <span className="text-muted-foreground">No → {nodes.find(n => n.id === selected.noBranch)?.label}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button size="sm" className="w-full gap-2" onClick={() => openEditNodeDialog(selected)}>
                    <Edit className="h-3.5 w-3.5" />
                    Edit Stage
                  </Button>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Add/Edit Node Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNodeId ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
            <DialogDescription>
              {editingNodeId 
                ? 'Update the conversation or process stage details.'
                : 'Define a new stage in the conversation flow pattern.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Stage Type */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Stage Type *</Label>
              <Select 
                value={nodeForm.type} 
                onValueChange={(v) => {
                  if (v) {
                    setNodeForm(f => ({ ...f, type: v as NodeType }))
                  }
                }}
                disabled={editingNodeId !== null}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trigger">Trigger (Start)</SelectItem>
                  <SelectItem value="message">Conversation Stage</SelectItem>
                  <SelectItem value="condition">Decision Point</SelectItem>
                  <SelectItem value="action">Process Stage</SelectItem>
                  <SelectItem value="end">End (Complete)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {nodeForm.type === 'message' && 'A conversational stage where the agent interacts with the customer.'}
                {nodeForm.type === 'action' && 'A business process stage that executes a capability.'}
                {nodeForm.type === 'condition' && 'A decision point that branches based on evaluation.'}
                {nodeForm.type === 'trigger' && 'The event that starts this flow pattern.'}
                {nodeForm.type === 'end' && 'The completion point of this flow pattern.'}
              </p>
            </div>

            {/* Stage Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Stage Name *</Label>
              <Input 
                placeholder={
                  nodeForm.type === 'message' ? 'e.g. Collect Preferences, Identify Issue' :
                  nodeForm.type === 'action' ? 'e.g. Check Availability, Process Payment' :
                  nodeForm.type === 'condition' ? 'e.g. Requirements Complete?, Slot Available?' :
                  nodeForm.type === 'trigger' ? 'e.g. Start' :
                  'e.g. Complete'
                } 
                value={nodeForm.label} 
                onChange={(e) => setNodeForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Stage Description</Label>
              <textarea 
                placeholder="What happens in this stage? Describe the objective or activity."
                value={nodeForm.description}
                onChange={(e) => setNodeForm(f => ({ ...f, description: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Trigger-specific fields */}
            {nodeForm.type === 'trigger' && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Trigger Event *</Label>
                <Select 
                  value={nodeForm.triggerEvent} 
                  onValueChange={(v) => v && setNodeForm(f => ({ ...f, triggerEvent: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {triggerEvents.map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  What initiates this conversation flow pattern.
                </p>
              </div>
            )}

            {/* Condition-specific fields */}
            {nodeForm.type === 'condition' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Decision Question *</Label>
                  <Input 
                    placeholder="e.g. Are all required details available? Is the customer eligible?" 
                    value={nodeForm.decision} 
                    onChange={(e) => setNodeForm(f => ({ ...f, decision: e.target.value }))}
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <Label className="text-xs font-medium">Branches</Label>
                  
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">Yes → Next Stage</Label>
                    <Select 
                      value={nodeForm.yesBranchId} 
                      onValueChange={(v) => v && setNodeForm(f => ({ ...f, yesBranchId: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {nodes.map((n) => (
                          <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] text-muted-foreground">No → Next Stage</Label>
                    <Select 
                      value={nodeForm.noBranchId} 
                      onValueChange={(v) => v && setNodeForm(f => ({ ...f, noBranchId: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {nodes.map((n) => (
                          <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* End-specific fields */}
            {nodeForm.type === 'end' && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Completion Outcome *</Label>
                <Select 
                  value={nodeForm.completionOutcome} 
                  onValueChange={(v) => v && setNodeForm(f => ({ ...f, completionOutcome: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {completionOutcomes.map(outcome => (
                      <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  The result when this flow pattern completes.
                </p>
              </div>
            )}

            {/* Connect After (only for new nodes) */}
            {!editingNodeId && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Connect After *</Label>
                <Select 
                  value={nodeForm.connectAfterId} 
                  onValueChange={(v) => v && setNodeForm(f => ({ ...f, connectAfterId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select stage to connect after" /></SelectTrigger>
                  <SelectContent>
                    {nodes.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.label} {n.type === 'condition' && '(decision point)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {nodes.find(n => n.id === nodeForm.connectAfterId)?.type === 'condition'
                    ? 'This stage will be added as a branch. Existing branches will be preserved.'
                    : 'The new stage will be inserted into the flow after the selected stage.'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNodeDialog(false); setEditingNodeId(null) }}>Cancel</Button>
            <Button 
              onClick={handleSaveNode} 
              disabled={!nodeForm.label || (!editingNodeId && !nodeForm.connectAfterId)}
            >
              {editingNodeId ? 'Save Changes' : 'Add Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}