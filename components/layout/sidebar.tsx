'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Bot,
  FileText,
  MessageSquareText,
  Brain,
  BookOpen,
  Mic2,
  PhoneIncoming,
  PhoneOutgoing,
  Server,
  Radio,
  Megaphone,
  Contact,
  CalendarClock,
  Cpu,
  AudioLines,
  Volume2,
  GitBranch,
  BarChart3,
  Gauge,
  LineChart,
  DollarSign,
  Activity,
  ScrollText,
  BellDot,
  Settings2,
  Palette,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Layers,
  Workflow,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type NavItem = {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  badge?: string
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: '',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  // {
  //   group: 'Platform',
  //   items: [
  //     {
  //       label: 'Platform',
  //       icon: Layers,
  //       children: [
  //         { label: 'Workspace Management', href: '/platform/workspaces', icon: Building2 },
  //         { label: 'Users', href: '/platform/users', icon: Users },
  //         { label: 'Roles & Permissions', href: '/platform/roles', icon: ShieldCheck },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   group: 'AI Agents',
  //   items: [
  //     {
  //       label: 'AI Agents',
  //       icon: Bot,
  //       children: [
  //         { label: 'Agents', href: '/agents', icon: Bot },
  //         { label: 'Agent Templates', href: '/agents/templates', icon: FileText },
  //         { label: 'Prompt Management', href: '/agents/prompts', icon: MessageSquareText },
  //         { label: 'Conversation Flow', href: '/agents/flows', icon: Workflow },
  //         { label: 'Knowledge Base', href: '/agents/knowledge', icon: BookOpen },
  //         { label: 'Voice Configuration', href: '/agents/voice', icon: Mic2 },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   group: 'Telephony',
  //   items: [
  //     {
  //       label: 'Telephony',
  //       icon: PhoneIncoming,
  //       children: [
  //         { label: 'Inbound Calls', href: '/telephony/inbound', icon: PhoneIncoming },
  //         { label: 'Outbound Calls', href: '/telephony/outbound', icon: PhoneOutgoing },
  //         { label: 'SIP Configuration', href: '/telephony/sip', icon: Server },
  //         { label: 'Live Calls', href: '/telephony/live', icon: Radio, badge: '3' },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   group: 'Campaigns',
  //   items: [
  //     {
  //       label: 'Campaigns',
  //       icon: Megaphone,
  //       children: [
  //         { label: 'Campaign Management', href: '/campaigns', icon: Megaphone },
  //         { label: 'Contacts', href: '/campaigns/contacts', icon: Contact },
  //         { label: 'Scheduling', href: '/campaigns/scheduling', icon: CalendarClock },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   group: 'AI Providers',
  //   items: [
  //     {
  //       label: 'AI Providers',
  //       icon: Cpu,
  //       children: [
  //         { label: 'LLM Providers', href: '/providers/llm', icon: Brain },
  //         { label: 'STT Providers', href: '/providers/stt', icon: AudioLines },
  //         { label: 'TTS Providers', href: '/providers/tts', icon: Volume2 },
  //         { label: 'Routing & Fallback', href: '/providers/routing', icon: GitBranch },
  //       ],
  //     },
  //   ],
  // },
  {
    group: 'Analytics',
    items: [
      {
        label: 'Analytics',
        icon: BarChart3,
        children: [
          { label: 'Calls', href: '/analytics/calls', icon: Gauge },
          { label: 'AI Performance', href: '/analytics/ai', icon: LineChart },
          { label: 'Campaign Reports', href: '/analytics/campaigns', icon: BarChart3 },
          { label: 'Cost Analytics', href: '/analytics/costs', icon: DollarSign },
        ],
      },
    ],
  },
  // {
  //   group: 'Monitoring',
  //   items: [
  //     {
  //       label: 'Monitoring',
  //       icon: Activity,
  //       children: [
  //         { label: 'System Health', href: '/monitoring/health', icon: Activity },
  //         { label: 'Logs', href: '/monitoring/logs', icon: ScrollText },
  //         { label: 'Alerts', href: '/monitoring/alerts', icon: BellDot, badge: '5' },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   group: 'Administration',
  //   items: [
  //     {
  //       label: 'Administration',
  //       icon: Settings2,
  //       children: [
  //         { label: 'Settings', href: '/admin/settings', icon: Settings2 },
  //         { label: 'Notifications', href: '/admin/notifications', icon: BellDot },
  //         { label: 'Branding', href: '/admin/branding', icon: Palette },
  //         { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
  //       ],
  //     },
  //   ],
  // },
]

function NavItemRow({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem
  collapsed: boolean
  depth?: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(() => {
    if (!item.children) return false
    return item.children.some((c) => c.href === pathname)
  })

  const isActive = item.href === pathname
  const Icon = item.icon

  if (item.children) {
    return (
      <div>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              className={cn(
                'flex w-full items-center justify-center rounded-md px-2 py-2 text-sm transition-colors',
                'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
              )}
              onClick={() => setOpen(!open)}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <button
              onClick={() => setOpen(!open)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="flex-1 text-left">{item.label}</span>
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              )}
            </button>
            {open && (
              <div className="mt-0.5 ml-2 border-l border-[var(--sidebar-border)] pl-3 space-y-0.5">
                {item.children.map((child) => (
                  <NavItemRow key={child.href} item={child} collapsed={false} depth={depth + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={
            <Link
              href={item.href ?? '#'}
              className={cn(
                'flex w-full items-center justify-center rounded-md px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                  : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
              )}
            />
          }>
            <Icon className="h-4 w-4 shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Link
          href={item.href ?? '#'}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] font-medium'
              : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
          )}
        >
          <Icon className="h-4 w-4 shrink-0 opacity-80" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
              {item.badge}
            </span>
          )}
        </Link>
      )}
    </>
  )
}

export function Sidebar({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean
  onCollapse: (v: boolean) => void
}) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        'flex h-14 shrink-0 items-center border-b border-[var(--sidebar-border)]',
        collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--sidebar-primary)]">
          <Mic2 className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">VoiceAI</span>
            <span className="text-[10px] text-[var(--sidebar-foreground)]/50 uppercase tracking-wider">Platform</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3 scrollbar-thin [scrollbar-width:thin] [scrollbar-color:var(--sidebar-border)_transparent]">
        <nav className={cn('space-y-4', collapsed ? 'px-1.5' : 'px-2')}>
          {navGroups.map((group) => (
            <div key={group.group}>
              {group.group && !collapsed && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-foreground)]/40">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow key={item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-[var(--sidebar-border)] p-2">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-xs text-[var(--sidebar-foreground)]/60 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
