import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  ChevronDown,
  ChevronRight,
  Heart,
  Users,
  Baby,
  BarChart2,
  Stethoscope,
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubNavItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href?: string
  icon?: any
  isHeader?: boolean
  subItems?: SubNavItem[]
}

const navigation: NavItem[] = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'KATEGORI PASIEN', isHeader: true },
  {
    name: 'Ibu-ibu',
    icon: Heart,
    subItems: [
      { name: 'Ibu Hamil', href: '/bumil' },
      { name: 'Ibu Pasca Persalinan', href: '/pasca-persalinan' },
    ],
  },
  { name: 'Lansia', href: '/lansia', icon: Users },
  {
    name: 'Anak-anak',
    icon: Baby,
    subItems: [
      { name: 'Baduta', href: '/baduta' },
      { name: 'Balita', href: '/balita' },
    ],
  },
  { name: 'LAPORAN', isHeader: true },
  { name: 'Status Pendataan', href: '/status-pendataan', icon: ClipboardList },
  { name: 'Rekapitulasi Bulanan', href: '/laporan', icon: BarChart2 },
]

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Ibu-ibu': true,
    'Anak-anak': false,
  })

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className={cn('flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300', className)}>
      <div className="flex h-[72px] items-center px-6 border-b border-slate-800 gap-3">
        <div className="bg-white rounded-full p-2 flex items-center justify-center shrink-0">
          <img src='/logo-cipicung.webp' alt="Logo" className="w-10 h-10" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white leading-tight">Pusat Pendataan</span>
          <span className="text-xs text-primary/70">Kesehatan Cipicung</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          if (item.isHeader) {
            return (
              <div key={item.name} className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.name}
              </div>
            )
          }

          if (item.subItems) {
            const isOpen = openSections[item.name]
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.name)}
                  className="w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />}
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="pl-11 space-y-1 mt-1">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.href}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          )
                        }
                        onClick={onClose}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.name}
              to={item.href!}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-slate-800 hover:text-white'
                )
              }
              onClick={onClose}
            >
              {item.icon && (
                <item.icon
                  className={cn("mr-3 h-5 w-5 shrink-0", 
                    window.location.pathname === item.href ? "text-white" : "text-slate-400"
                  )}
                  aria-hidden="true"
                />
              )}
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <p className="text-xs text-slate-500 leading-tight">Posyandu Desa Cipicung</p>
        <p className="text-[10px] text-slate-600">v1.0 · 2026</p>
      </div>
    </div>
  )
}
