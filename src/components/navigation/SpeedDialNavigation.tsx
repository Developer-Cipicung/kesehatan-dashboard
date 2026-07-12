import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Baby, HeartPulse, PersonStanding, Home, Grip, ClipboardList, Activity, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SpeedDialNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Don't show on login page
  if (location.pathname === '/login') return null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    { name: 'Kembali ke Beranda', icon: Home, path: '/', color: 'text-slate-600' },
    { name: 'Balita', icon: Baby, path: '/balita', color: 'text-blue-600' },
    { name: 'Baduta', icon: Baby, path: '/baduta', color: 'text-sky-600' },
    { name: 'Ibu Hamil', icon: HeartPulse, path: '/bumil', color: 'text-pink-600' },
    { name: 'Pasca Salin', icon: Activity, path: '/pasca-persalinan', color: 'text-rose-600' },
    { name: 'Lansia', icon: PersonStanding, path: '/lansia', color: 'text-amber-600' },
    { name: 'Rekapitulasi Bulanan', icon: BarChart2, path: '/laporan', color: 'text-indigo-600' },
    { name: 'Verifikasi Pendataan', icon: ClipboardList, path: '/verifikasi-pendataan', color: 'text-primary' },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex-col-reverse items-end gap-3 flex md:hidden pointer-events-none">
      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-900/20 pointer-events-auto",
          isOpen ? "rotate-90 scale-90 bg-slate-800" : ""
        )}
        aria-label="Speed Dial Navigation"
      >
        <Grip className={cn("w-6 h-6 transition-transform duration-300", isOpen ? "rotate-45" : "")} />
      </button>

      {/* Speed Dial Actions */}
      <div 
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 origin-bottom transform mb-2",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {actions.map((action, index) => {
          const isActive = location.pathname === action.path
          return (
            <button
              key={action.name}
              onClick={() => handleNavigate(action.path)}
              className={cn(
                "group flex items-center gap-3 transition-all duration-300 pointer-events-auto",
                isOpen ? "translate-x-0" : "translate-x-10"
              )}
              style={{ transitionDelay: `${(actions.length - index) * 30}ms` }}
            >
              <span className="px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-md whitespace-nowrap">
                {action.name}
              </span>
              <div className="w-14 flex justify-center flex-shrink-0">
                <div 
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:scale-110 transition-transform",
                    isActive ? "ring-2 ring-primary" : ""
                  )}
                >
                  <action.icon className={cn("w-5 h-5", action.color)} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
