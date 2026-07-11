import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SpeedDialNavigation } from '@/components/navigation/SpeedDialNavigation'

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user)

  if ((user as any)?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <Outlet />
          <SpeedDialNavigation />
        </main>
      </div>
    </div>
  )
}
