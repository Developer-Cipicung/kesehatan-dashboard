import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Posyandu {
  id: string
  nama: string
  kelurahan: string
  kecamatan: string
}

export function PosyanduSelector() {
  const { posyandu, selectedPosyanduId, setSelectedPosyanduId } = useAuthStore()

  const { data: posyandus, isLoading } = useQuery({
    queryKey: ['posyandus'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data as Posyandu[]
    },
    // Only fetch if posyandu exists (logged in)
    enabled: !!posyandu,
  })

  // If user is not logged in or data is loading, show default posyandu
  if (!posyandu) return null
  if (isLoading) return <div className="h-8 w-32 animate-pulse bg-slate-200 rounded"></div>

  // Initialize selected posyandu id if it's null
  const currentId = selectedPosyanduId || posyandu.id

  const handleSelect = (value: string | null) => {
    if (value) {
      setSelectedPosyanduId(value)
    }
  }

  const selectedPosyandu = posyandus?.find((p) => p.id === currentId) || posyandu

  return (
    <Select value={currentId} onValueChange={handleSelect}>
      <SelectTrigger className="w-[200px] border-none bg-transparent hover:bg-slate-50 focus:ring-0 shadow-none -ml-2 font-semibold text-slate-800 text-sm">
        <SelectValue>
          <div className="flex flex-col text-left">
            <span className="leading-none">{selectedPosyandu.nama}</span>
            {(selectedPosyandu.kelurahan || selectedPosyandu.kecamatan) && (
              <span className="text-slate-500 text-xs mt-1 leading-none font-normal">
                {[selectedPosyandu.kelurahan, selectedPosyandu.kecamatan].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {posyandus?.map((p) => (
          <SelectItem key={p.id} value={p.id} className="text-sm">
            {p.nama}
            {(p.kelurahan || p.kecamatan) && (
              <span className="text-slate-500 text-xs ml-1 font-normal">
                ({[p.kelurahan, p.kecamatan].filter(Boolean).join(', ')})
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
