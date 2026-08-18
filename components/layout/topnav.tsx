'use client'

import { Search, CircleHelp, Bell, Layers } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function TopNav() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-5">
      {/* Platform Context */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Layers className="h-4 w-4 text-primary-foreground" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium">
            Platform Administration
          </span>
          <span className="text-[11px] text-muted-foreground">
            Superadmin
          </span>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />

        <input
          type="search"
          placeholder="Search organizations, users, providers..."
          className="h-8 w-full max-w-sm rounded-md border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">

        {/* Help */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <CircleHelp className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <div className="mx-2 h-5 w-px bg-border" />

        {/* Superadmin User */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              SA
            </AvatarFallback>
          </Avatar>

          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium">
              Platform Administrator
            </span>
            <span className="text-[11px] text-muted-foreground">
              superadmin@platform.com
            </span>
          </div>
        </div>

      </div>
    </header>
  )
}