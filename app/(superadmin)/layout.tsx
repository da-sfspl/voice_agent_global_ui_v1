'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/topnav'

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - full height on the left */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      {/* Right side: TopNav + Main content stacked vertically */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopNav at the top */}
        <TopNav />
        
        {/* Main content below TopNav */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}