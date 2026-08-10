import { Shell } from '@/components/layout/shell'
import { RoutingFallback } from '@/components/providers/routing-fallback'

export default function RoutingPage() {
  return (
    <Shell>
      <RoutingFallback />
    </Shell>
  )
}
