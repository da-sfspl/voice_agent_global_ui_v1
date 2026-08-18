import { Shell } from '@/components/layout/shell'
import { RolesPermissions } from '@/components/platform/roles-permissions'

export const metadata = { title: 'Roles & Permissions — VoiceAI Platform' }

export default function RolesPage() {
  return (
    <Shell>
      <RolesPermissions />
    </Shell>
  )
}
