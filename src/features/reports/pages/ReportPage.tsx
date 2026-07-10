import { useState } from 'react'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useGetPendataanGlobalStatus, useGetAdminStatusPendataan } from '@/features/pendataan/hooks/usePendataanBulanan'
import { useGetWargaList } from '@/features/warga/hooks/useWarga'
import { MonthlySummaryWidget } from '../components/MonthlySummaryWidget'
import { ExportActions } from '../components/ExportActions'
import { MonthlyReportTable } from '../components/MonthlyReportTable'
import { useGetPemeriksaanList } from '@/features/pemeriksaan/hooks/usePemeriksaan'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'

export function ReportPage() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [posyanduFilter, setPosyanduFilter] = useState<'my' | 'all'>('my')
  const [kategoriFilter, setKategoriFilter] = useState<string>('baduta')
  const posyanduIdParam = posyanduFilter === 'all' ? 'all' : undefined

  // Fetch Dashboard Stats for numbers
  const { data: dashboard, isLoading: isDashboardLoading, error: dashboardError } = useDashboardStats(posyanduIdParam)
  
  // Fetch Pendataan Status for completion state
  const { isLoading: isStatusLoading } = useGetPendataanGlobalStatus(currentMonth, currentYear)

  // Fetch all posyandus status if filter is 'all'
  const { data: allPosyanduData } = useGetAdminStatusPendataan(currentYear)

  // Fetch Warga List for exports — filter by kategori so backend only returns relevant rows
  const { data: wargaData, isLoading: isWargaLoading } = useGetWargaList({ kategori: kategoriFilter, limit: 10000, posyanduId: posyanduIdParam })

  // Fetch Pemeriksaan List for the selected category, month, and year
  const { data: pemeriksaanData, isLoading: isPemeriksaanLoading } = useGetPemeriksaanList(kategoriFilter, {
    bulan: currentMonth,
    tahun: currentYear,
    limit: 10000,
    posyanduId: posyanduIdParam,
  })

  // Compute baduta vs balita filter dynamically
  const filteredPemeriksaanList = (() => {
    const list = pemeriksaanData?.data || []
    if (kategoriFilter === 'baduta') {
      return list.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        const ageMonths = (new Date(tglKunjungan).getTime() - new Date(item.warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        return ageMonths < 24
      })
    } else if (kategoriFilter === 'balita') {
      return list.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        const ageMonths = (new Date(tglKunjungan).getTime() - new Date(item.warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        return ageMonths >= 24 && ageMonths < 60
      })
    }
    return list
  })()

  if (isDashboardLoading || isStatusLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Laporan Posyandu</h2>
        <SkeletonCard />
      </div>
    )
  }

  if (dashboardError) {
    return (
      <ErrorState
        title="Gagal memuat ringkasan laporan"
        message="Terjadi kesalahan saat memuat data laporan dari server."
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Format statuses from dashboard object or global status API
  const statuses = []
  if (dashboard?.pendataan) {
    for (const [key, value] of Object.entries(dashboard.pendataan)) {
      statuses.push({ kategori: key, status: value as 'draft' | 'selesai' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan & Rekapitulasi</h2>
          <p className="text-muted-foreground">Unduh laporan pasien bulanan dalam format PDF atau Excel.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border rounded-md p-1 shadow-sm shrink-0">
          <button
            onClick={() => setPosyanduFilter('my')}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              posyanduFilter === 'my' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Posyandu Saya
          </button>
          <button
            onClick={() => setPosyanduFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              posyanduFilter === 'all' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Posyandu
          </button>
        </div>
      </div>

      <MonthlySummaryWidget
        bulan={currentMonth}
        tahun={currentYear}
        statuses={statuses}
        totalWarga={dashboard?.total_warga || 0}
        totalBalita={dashboard?.total_balita || 0}
        totalBumil={dashboard?.total_bumil || 0}
        totalLansia={dashboard?.total_lansia || 0}
      />

      <div className="bg-card p-6 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Export Data Pasien</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unduh rekapitulasi daftar pasien dalam format PDF atau Excel.
          </p>
        </div>
        
        <ExportActions 
          wargaList={wargaData?.data || []} 
          pemeriksaanList={filteredPemeriksaanList}
          isLoading={isWargaLoading || isPemeriksaanLoading} 
          kategoriFilter={kategoriFilter}
          setKategoriFilter={setKategoriFilter}
        />
      </div>

      <div className="bg-card p-6 rounded-lg border mt-6 overflow-hidden">
        <h3 className="text-lg font-bold mb-4 capitalize">Data Laporan {kategoriFilter.replace('_', ' ')} Bulan Ini</h3>
        <MonthlyReportTable 
          kategori={kategoriFilter} 
          data={filteredPemeriksaanList} 
          isLoading={isPemeriksaanLoading} 
        />
      </div>

      {posyanduFilter === 'all' && allPosyanduData && (
        <div className="bg-card p-6 rounded-lg border mt-6">
          <h3 className="text-lg font-bold mb-4">Status Pendataan Posyandu (Bulan Ini)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPosyanduData.map((posyandu) => {
              const currentMonthStatus = posyandu.status.find(s => s.bulan === currentMonth)?.status || 'draft'
              return (
                <div key={posyandu.id} className="p-4 border rounded-md flex justify-between items-center bg-slate-50/50">
                  <div className="font-medium">{posyandu.nama}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    currentMonthStatus === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {currentMonthStatus === 'selesai' ? 'Selesai' : 'Draft'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
