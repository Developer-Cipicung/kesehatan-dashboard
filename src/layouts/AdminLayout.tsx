import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, MapPin, LogOut, Menu, X, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user || (user as any).role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Status Pendataan', icon: ClipboardList, path: '/admin/status-pendataan' },
    { name: 'Data Posyandu', icon: MapPin, path: '/admin/posyandu' },
    { name: 'Manajemen User', icon: Users, path: '/admin/users' },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-foreground tracking-tight flex items-center">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
            C
          </span>
          Cicipung <span className="text-xs ml-2 px-2 py-0.5 bg-red-500 rounded-full">Admin</span>
        </h1>
        <Button variant="ghost" size="icon" aria-label="Tutup Menu" className="md:hidden text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4">
          <p className="text-sm font-medium text-white truncate">{(user as any).nama || 'Admin'}</p>
          <p className="text-xs text-slate-400 truncate">{(user as any).email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (Admin) */}
        <header className="md:hidden flex items-center p-4 border-b bg-white">
          <Button variant="ghost" size="icon" aria-label="Buka Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-lg font-bold">Admin Cicipung</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
