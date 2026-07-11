import { useState, useEffect, useRef } from 'react'
import { Search, Plus, User, Baby, HeartPulse, PersonStanding, Activity, Loader2 } from 'lucide-react'
import { wargaService, Warga } from '@/features/warga/services/wargaService'
import { calculateAgeInMonths } from '@/utils/age'
import { useNavigate } from 'react-router-dom'
import { MonthlyRecordForm } from '@/features/pemeriksaan/components/MonthlyRecordForm'

export function GlobalPatientSearch() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Warga[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [detectedCategory, setDetectedCategory] = useState<string>('')
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 2) {
        setLoading(true)
        try {
          const res = await wargaService.getWargaList({ search, limit: 10 })
          setResults(res.data)
          setIsOpen(true)
        } catch (error) {
          console.error("Failed to search", error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const determineCategory = (warga: Warga) => {
    const ageMonths = calculateAgeInMonths(warga.tanggal_lahir)
    if (ageMonths < 24) return { id: 'baduta', label: 'Baduta', icon: <Baby className="w-4 h-4 text-sky-500" /> }
    if (ageMonths < 60) return { id: 'balita', label: 'Balita', icon: <Baby className="w-4 h-4 text-blue-500" /> }
    if (warga.status_kehamilan === 'HAMIL') return { id: 'bumil', label: 'Ibu Hamil', icon: <HeartPulse className="w-4 h-4 text-pink-500" /> }
    if (warga.status_kehamilan === 'PASCA_PERSALINAN') return { id: 'pasca_persalinan', label: 'Pasca Salin', icon: <Activity className="w-4 h-4 text-rose-500" /> }
    if (ageMonths >= 720) return { id: 'lansia', label: 'Lansia', icon: <PersonStanding className="w-4 h-4 text-amber-500" /> }
    
    return { id: 'umum', label: 'Umum', icon: <User className="w-4 h-4 text-slate-500" /> }
  }

  const handleSelectWarga = (warga: Warga) => {
    setIsOpen(false)
    const cat = determineCategory(warga)
    
    if (cat.id === 'umum') {
      // Navigate to profile if no specific recording form
      navigate(`/warga/${warga.id}`)
      return
    }

    setDetectedCategory(cat.id)
    setSelectedWarga(warga)
    setShowForm(true)
  }

  return (
    <div className="relative w-full z-50 mb-8" ref={wrapperRef}>
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {loading ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-400" />}
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner text-lg"
            placeholder="Cari Nama Pasien atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (search.length >= 2) setIsOpen(true) }}
          />
          
          {isOpen && results.length > 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">
              {results.map((warga) => {
                const cat = determineCategory(warga)
                return (
                  <button
                    key={warga.id}
                    onClick={() => handleSelectWarga(warga)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-base">{warga.nama}</div>
                      <div className="text-xs text-slate-500 mt-0.5">NIK: {warga.nik}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-full group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                      {cat.icon}
                      <span className="text-xs font-medium text-slate-700">{cat.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          
          {isOpen && results.length === 0 && search.length >= 2 && !loading && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 text-center">
              <p className="text-slate-500 text-sm">Warga tidak ditemukan.</p>
            </div>
          )}
        </div>
        
        <div className="flex shrink-0 gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/warga?add=true')} 
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 rounded-xl px-6 py-4 font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Tambah Warga
          </button>
        </div>
      </div>

      <MonthlyRecordForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) {
            setTimeout(() => setSelectedWarga(null), 300)
          }
        }}
        kategori={detectedCategory}
        wargaId={selectedWarga?.id || ''}
        initialData={null}
      />
    </div>
  )
}
