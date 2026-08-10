import { Shell } from '@/components/layout/shell'
import { UserList } from '@/components/platform/user-list'

export const metadata = { title: 'Users — VoiceAI Platform' }

export default function UsersPage() {
  return (
    <Shell>
      <UserList />
    </Shell>
  )
}
