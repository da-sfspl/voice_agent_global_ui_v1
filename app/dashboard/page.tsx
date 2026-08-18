import { AppShell } from '@/components/layout/shell'
import { StatCard } from '@/components/dashboard/stat-card'
import { CallVolumeChart } from '@/components/dashboard/call-volume-chart'
import { AgentStatusWidget } from '@/components/dashboard/agent-status-widget'
import { RecentCallsTable } from '@/components/dashboard/recent-calls-table'
import { SystemHealthWidget } from '@/components/dashboard/system-health-widget'
import { ActiveCampaignsWidget } from '@/components/dashboard/active-campaigns-widget'
import { LiveCallsWidget } from '@/components/dashboard/live-calls-widget'
import {
  PhoneCall,
  Bot,
  Clock,
  TrendingUp,
  Megaphone,
  Users,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Platform overview — Acme Corp &middot; Thursday, Aug 7, 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-border bg-card px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
        </div>

        {/* KPI stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Calls Today"
            value="2,494"
            delta="+12.4% vs yesterday"
            deltaType="up"
            icon={PhoneCall}
            iconColor="bg-primary/10 text-primary"
            subtext="1,648 inbound · 846 outbound"
          />
          <StatCard
            label="Active Agents"
            value="4 / 6"
            delta="2 paused or draft"
            deltaType="neutral"
            icon={Bot}
            iconColor="bg-emerald-100 text-emerald-700"
            subtext="Last deployed 2h ago"
          />
          <StatCard
            label="Avg. Handle Time"
            value="3m 41s"
            delta="-8s vs last week"
            deltaType="up"
            icon={Clock}
            iconColor="bg-sky-100 text-sky-700"
            subtext="P95: 9m 12s"
          />
          <StatCard
            label="Resolution Rate"
            value="91.2%"
            delta="+1.8% vs last week"
            deltaType="up"
            icon={ThumbsUp}
            iconColor="bg-violet-100 text-violet-700"
            subtext="Target: 90%"
          />
        </div>

        {/* Second row of KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Running Campaigns"
            value="3"
            delta="2,000 contacts each"
            deltaType="neutral"
            icon={Megaphone}
            iconColor="bg-amber-100 text-amber-700"
            subtext="1 completing today"
          />
          <StatCard
            label="Active Contacts (CRM)"
            value="184,320"
            delta="+2,140 this week"
            deltaType="up"
            icon={Users}
            iconColor="bg-teal-100 text-teal-700"
            subtext="Across 3 workspaces"
          />
          <StatCard
            label="LLM Cost Today"
            value="$148.72"
            delta="+$22 vs avg"
            deltaType="down"
            icon={TrendingUp}
            iconColor="bg-orange-100 text-orange-700"
            subtext="Budget: $250 / day"
          />
          <StatCard
            label="Open Alerts"
            value="5"
            delta="1 critical · 4 warnings"
            deltaType="down"
            icon={AlertTriangle}
            iconColor="bg-red-100 text-red-700"
            subtext="Last triggered 6m ago"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CallVolumeChart />
          </div>
          <div>
            <LiveCallsWidget />
          </div>
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AgentStatusWidget />
          <ActiveCampaignsWidget />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentCallsTable />
          </div>
          <div>
            <SystemHealthWidget />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
