'use client'

import { useState } from 'react'
import { roles, permissionGroups, type Role } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  Plus,
  Users,
  Lock,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react'

export function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0])

  // Simulated permissions per role (for display)
  const activePerms: Record<string, string[]> = {
    'role-001': permissionGroups.flatMap((g) => g.permissions.map((p) => p.key)),
    'role-002': ['agents:read', 'agents:create', 'agents:update', 'agents:publish', 'agents:config', 'analytics:read'],
    'role-003': ['campaigns:read', 'campaigns:create', 'campaigns:update', 'campaigns:delete', 'campaigns:launch', 'analytics:read', 'analytics:export'],
    'role-004': ['analytics:read', 'analytics:export'],
    'role-005': ['agents:read', 'agents:create', 'agents:update', 'agents:config', 'campaigns:read', 'analytics:read'],
    'role-006': ['analytics:read'],
  }

  const current = activePerms[selectedRole.id] ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define roles and control which actions each role can perform within this workspace.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Role
        </Button>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Role List */}
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                selectedRole.id === role.id
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <ShieldCheck className={cn('h-4 w-4 shrink-0', selectedRole.id === role.id ? 'text-primary' : '')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{role.name}</span>
                  {role.system && (
                    <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{role.users} users</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{role.permissions} perms</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="flex flex-col gap-0 rounded-lg border border-border bg-card overflow-hidden">
          {/* Role Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{selectedRole.name}</h2>
                  {selectedRole.system && (
                    <Badge variant="outline" className="text-[10px] px-1.5">System Role</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{selectedRole.users} assigned users</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit Role
              </Button>
              {!selectedRole.system && (
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Permission Groups */}
          <div className="divide-y divide-border overflow-y-auto">
            {permissionGroups.map((group) => (
              <div key={group.group} className="px-5 py-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {group.permissions.map((perm) => {
                    const enabled = current.includes(perm.key)
                    return (
                      <div
                        key={perm.key}
                        className={cn(
                          'flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors',
                          enabled ? 'border-border bg-accent/30' : 'border-border/50 bg-card',
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium">{perm.label}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{perm.key}</p>
                        </div>
                        <Switch
                          checked={enabled}
                          disabled={selectedRole.system}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {!selectedRole.system && (
            <div className="border-t border-border px-5 py-3 flex justify-end gap-2">
              <Button variant="outline" size="sm">Discard Changes</Button>
              <Button size="sm">Save Permissions</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
