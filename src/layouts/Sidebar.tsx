import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Baby,
  PersonStanding,
  GraduationCap,
  HeartPulse,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ibu Hamil', href: '/ibu-hamil', icon: HeartPulse },
  { name: 'Pasca Persalinan', href: '/pasca-persalinan', icon: PersonStanding },
  { name: 'Balita', href: '/balita', icon: Baby },
  { name: 'Anak Sekolah', href: '/anak-sekolah', icon: GraduationCap },
  { name: 'Lansia', href: '/lansia', icon: Users },
  { name: 'Laporan', href: '/laporan', icon: FileText },
  { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-64 flex-col bg-card border-r', className)}>
      <div className="flex h-16 items-center px-6 font-bold text-xl text-primary border-b">
        Posyandu Cipicung
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon
              className="mr-3 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
