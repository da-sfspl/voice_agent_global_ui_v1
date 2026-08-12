'use client'

import { Bell, Search, ChevronDown, CircleHelp, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
export function TopNav() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-5">
      {/* Workspace - Static Display */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
          AC
        </span>
        <span className="text-foreground">Acme Corp</span>
        <Badge variant="secondary" className="text-[10px]">Active</Badge>
      </div>

      {/* Search */}
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search agents, campaigns, calls..."
          className="h-8 w-full max-w-sm rounded-md border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Help */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <CircleHelp className="h-4 w-4" />
        </button>

        {/* Settings */}
        {/* <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
        </button> */}

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        {/* Divider */}
        <div className="mx-2 h-5 w-px bg-border" />

        {/* User - Static Display */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium leading-tight text-foreground">James Dalton</span>
            <span className="text-[11px] text-muted-foreground leading-tight">james.dalton@acme.com</span>
          </div>
        </div>
      </div>
    </header>
  )
}