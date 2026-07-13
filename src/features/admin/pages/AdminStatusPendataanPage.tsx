import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetAdminStatusPendataan, useGetPendataanStatus, useSubmitPendataan } from '@/features/pendataan/hooks/usePendataanBulanan'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { CheckCircle2, CircleDashed, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function AdminStatusPendataanPage() {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const userPosyanduId = useAuthStore(state => state.posyandu?.id)

  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(currentDate.toISOString().split('T')[0])

  const { data, isLoading, isError, refetch } = useGetAdminStatusPendataan(selectedYear)
  const { data: pendataanStatus, refetch: refetchStatus } = useGetPendataanStatus(currentMonth, currentDate.getFullYear(), userPosyanduId || undefined)
  const { mutate: submitPendataan, isPending: isSubmitting } = useSubmitPendataan()
  const filteredData = data?.filter(posyandu => 
    posyandu.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    posyandu.kode.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).sort((a, b) => {
    if (a.id === userPosyanduId) return -1
    if (b.id === userPosyanduId) return 1
    return 0
  })

  const renderStatusBadge = (status?: string) => {
    if (status === 'selesai') {
      return (
        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100 mx-auto">
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          <span className="text-xs font-semibold">Selesai</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-fit border border-slate-200 mx-auto">
        <CircleDashed className="w-4 h-4 mr-1.5" />
        <span className="text-xs font-medium">Draft/Belum</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Status Pendataan Posyandu</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Pantau status pengisian data bulanan dari seluruh Posyandu
            </p>
          </div>
          
          <div className="flex items-center gap-3">

            <Select value={selectedYear.toString()} onValueChange={(v) => { if(v) setSelectedYear(parseInt(v)) }}>
              <SelectTrigger className="w-[100px] h-10 border-slate-200 font-medium">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Cari Posyandu..." 
            className="pl-9 h-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : isError ? (
          <ErrorState message="Gagal memuat data status pendataan" onRetry={refetch} />
        ) : (
          <div className="w-full overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs w-[250px] sticky left-0 bg-slate-50">Posyandu</th>
                  {MONTHS.map((m, i) => (
                    <th key={i} className="px-4 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-center min-w-[100px]">
                      {m.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData?.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-500">
                      Tidak ada data posyandu ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData?.map(posyandu => {
                    const isUserPosyandu = posyandu.id === userPosyanduId
                    return (
                    <tr key={posyandu.id} className={`${isUserPosyandu ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50/50'} transition-colors`}>
                      <td className={`px-4 py-4 sticky left-0 ${isUserPosyandu ? 'bg-[#f0f6ff]' : 'bg-white'}`}>
                        <div className="font-semibold text-slate-800">
                          {posyandu.nama}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{posyandu.kode}</div>
                      </td>
                      {MONTHS.map((_, index) => {
                        const monthNum = index + 1
                        const s = posyandu.status.find(st => st.bulan === monthNum)?.status
                        return (
                          <td key={index} className="px-4 py-4 text-center align-middle">
                            {renderStatusBadge(s)}
                          </td>
                        )
                      })}
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunci Pendataan Bulan Ini</DialogTitle>
            <DialogDescription>
              Tentukan tanggal pelaksanaan Posyandu. Semua data pemeriksaan yang baru diinput akan disimpan dengan tanggal ini. Data yang sudah dikunci tidak dapat diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_pelaksanaan">Tanggal Pelaksanaan Posyandu</Label>
              <Input
                id="tanggal_pelaksanaan"
                type="date"
                value={tanggalPelaksanaan}
                onChange={(e) => setTanggalPelaksanaan(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => {
                if (!tanggalPelaksanaan || !pendataanStatus?.id) return
                submitPendataan(
                  { id: pendataanStatus.id, tanggal_pelaksanaan: new Date(tanggalPelaksanaan).toISOString() },
                  { onSuccess: () => {
                    setIsSubmitOpen(false)
                    refetch() // Refresh table
                    refetchStatus() // Refresh status
                  }},
                )
              }}
              disabled={isSubmitting || !tanggalPelaksanaan || !pendataanStatus?.id}
            >
              Ya, Kunci Pendataan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
