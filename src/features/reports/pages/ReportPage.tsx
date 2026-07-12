import { useState, useEffect, lazy, Suspense } from 'react'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useNavigate } from 'react-router-dom'
import { useGetPendataanGlobalStatus, useGetAdminStatusPendataan } from '@/features/pendataan/hooks/usePendataanBulanan'


// Lazy load ExportActions to prevent loading heavy jsPDF & exceljs on page load
const ExportActions = lazy(() => import('../components/ExportActions').then(m => ({ default: m.ExportActions })))
import { MonthlyReportTable } from '../components/MonthlyReportTable'
import { useGetPemeriksaanList } from '@/features/pemeriksaan/hooks/usePemeriksaan'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age'
import { calculateIMT, classifyIMT, classifyTekananDarah } from '@/utils/kesehatan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { ReportFilterSidebar } from '../components/ReportFilterSidebar'
import { CategorySummaryCards } from '../components/CategorySummaryCards'

export function ReportPage() {
  const navigate = useNavigate()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [posyanduFilter, setPosyanduFilter] = useState<'my' | 'all'>(() => (localStorage.getItem('rekapitulasi_posyandu') as 'my' | 'all') || 'my')
  const [kategoriFilter, setKategoriFilter] = useState<string>(() => localStorage.getItem('rekapitulasi_kategori') || 'bumil')
  const [subFilters, setSubFilters] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`rekapitulasi_filters_${localStorage.getItem('rekapitulasi_kategori') || 'bumil'}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('rekapitulasi_search') || '')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const posyanduIdParam = posyanduFilter === 'all' ? 'all' : undefined

  useEffect(() => {
    localStorage.setItem(`rekapitulasi_filters_${kategoriFilter}`, JSON.stringify(subFilters))
  }, [subFilters, kategoriFilter])

  useEffect(() => {
    localStorage.setItem('rekapitulasi_posyandu', posyanduFilter)
  }, [posyanduFilter])

  useEffect(() => {
    localStorage.setItem('rekapitulasi_search', searchQuery)
  }, [searchQuery])

  // Reload subFilters when kategoriFilter changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rekapitulasi_filters_${kategoriFilter}`)
      setSubFilters(saved ? JSON.parse(saved) : {})
    } catch {
      setSubFilters({})
    }
  }, [kategoriFilter])

  // Fetch Dashboard Stats for numbers
  const { data: dashboard, isLoading: isDashboardLoading, error: dashboardError } = useDashboardStats(posyanduIdParam)
  
  // Fetch Pendataan Status for completion state
  const { isLoading: isStatusLoading } = useGetPendataanGlobalStatus(currentMonth, currentYear)

  // Fetch all posyandus status if filter is 'all'
  const { data: allPosyanduData } = useGetAdminStatusPendataan(currentYear, posyanduFilter === 'all')

  // Fetch Pemeriksaan List for the selected category, month, and year (limit 1000 for full month stats)
  const { data: pemeriksaanData, isLoading: isPemeriksaanLoading } = useGetPemeriksaanList(kategoriFilter, {
    bulan: currentMonth,
    tahun: currentYear,
    limit: 1000,
    posyanduId: posyanduIdParam,
  })

  // Compute baduta vs balita filter dynamically
  let filteredPemeriksaanList = (() => {
    const list = pemeriksaanData?.data || []
    if (kategoriFilter === 'baduta') {
      return list.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        return isBadutaByBirthDate(item.warga.tanggal_lahir, tglKunjungan)
      })
    } else if (kategoriFilter === 'balita') {
      return list.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        return isBalitaByBirthDate(item.warga.tanggal_lahir, tglKunjungan)
      })
    }
    return list
  })()

  // Apply Sub Filters
  if (Object.keys(subFilters).length > 0) {
    filteredPemeriksaanList = filteredPemeriksaanList.filter((item: any) => {
      let passed = true;
      
      // Bumil
      if (kategoriFilter === 'bumil') {
        if (subFilters.trimester) {
          const mgg = item.usia_kehamilan_minggu || 0;
          if (subFilters.trimester === '1' && mgg > 13) passed = false;
          if (subFilters.trimester === '2' && (mgg <= 13 || mgg > 27)) passed = false;
          if (subFilters.trimester === '3' && mgg <= 27) passed = false;
        }
        if (subFilters.anemia) {
          const hb = item.kadar_hemoglobin ? Number(item.kadar_hemoglobin) : 999;
          if (subFilters.anemia === 'normal' && hb < 11) passed = false;
          if (subFilters.anemia === 'ringan' && (hb >= 11 || hb < 8)) passed = false;
          if (subFilters.anemia === 'berat' && hb >= 8) passed = false;
        }
        if (subFilters.kek) {
          const lila = item.lingkar_lengan_atas ? Number(item.lingkar_lengan_atas) : 999;
          if (subFilters.kek === 'kek' && lila >= 23.5) passed = false;
          if (subFilters.kek === 'normal' && lila < 23.5) passed = false;
        }
        if (subFilters.kie) {
          if (subFilters.kie === 'ya' && !item.kie) passed = false;
          if (subFilters.kie === 'tidak' && item.kie) passed = false;
        }
        if (subFilters.imt) {
          const bb = item.bb ? Number(item.bb) : null;
          const tb = item.tb ? Number(item.tb) : null;
          const imt = calculateIMT(bb, tb);
          const klass = classifyIMT(imt).toLowerCase();
          if (klass !== subFilters.imt) passed = false;
        }
      }
      
      // Pasca / Lansia
      if (kategoriFilter.startsWith('pasca') || kategoriFilter === 'lansia') {
        if (subFilters.imt) {
          const bb = item.bb ? Number(item.bb) : null;
          const tb = item.tb ? Number(item.tb) : null;
          const imt = calculateIMT(bb, tb);
          const klass = classifyIMT(imt).toLowerCase();
          if (klass !== subFilters.imt) passed = false;
        }
        if (subFilters.tensi) {
          const tensi = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik).toLowerCase();
          if (tensi !== subFilters.tensi) passed = false;
        }
        if (subFilters.kie && kategoriFilter.startsWith('pasca')) {
          if (subFilters.kie === 'ya' && !item.kie) passed = false;
          if (subFilters.kie === 'tidak' && item.kie) passed = false;
        }
        if (kategoriFilter === 'lansia') {
          if (subFilters.gula_darah) {
            const val = item.gula_darah_sewaktu ? parseFloat(item.gula_darah_sewaktu) : null;
            if (val !== null && !isNaN(val)) {
              const isTinggi = val >= 200;
              if (subFilters.gula_darah === 'tinggi' && !isTinggi) passed = false;
              if (subFilters.gula_darah === 'normal' && isTinggi) passed = false;
            } else {
              passed = false;
            }
          }
          if (subFilters.kolesterol) {
            const val = item.kolesterol ? parseFloat(item.kolesterol) : null;
            if (val !== null && !isNaN(val)) {
              const isTinggi = val >= 200; // >= 200 means Batas Tinggi or Tinggi
              if (subFilters.kolesterol === 'tinggi' && !isTinggi) passed = false;
              if (subFilters.kolesterol === 'normal' && isTinggi) passed = false;
            } else {
              passed = false;
            }
          }
          if (subFilters.asam_urat) {
            const val = item.asam_urat ? parseFloat(item.asam_urat) : null;
            if (val !== null && !isNaN(val)) {
              const jk = item.warga?.jenis_kelamin || 'P';
              const maxNormal = jk === 'L' ? 7.0 : 6.0;
              const isTinggi = val > maxNormal;
              if (subFilters.asam_urat === 'tinggi' && !isTinggi) passed = false;
              if (subFilters.asam_urat === 'normal' && isTinggi) passed = false;
            } else {
              passed = false;
            }
          }
        }
      }

      // Balita / Baduta
      if (kategoriFilter === 'balita' || kategoriFilter === 'baduta') {
        if (subFilters.gizi) {
          const g = item.status_gizi?.kategori_bb_tb?.toLowerCase() || '';
          if (subFilters.gizi === 'baik' && !g.includes('baik')) passed = false;
          if (subFilters.gizi === 'kurang' && !g.includes('kurang') && !g.includes('buruk')) passed = false;
          if (subFilters.gizi === 'lebih' && !g.includes('lebih') && !g.includes('overweight') && !g.includes('obesitas')) passed = false;
        }
        if (subFilters.tinggi) {
          const t = item.status_gizi?.kategori_tb_u?.toLowerCase() || '';
          if (subFilters.tinggi === 'normal' && !t.includes('normal')) passed = false;
          if (subFilters.tinggi === 'pendek' && !t.includes('pendek')) passed = false;
          if (subFilters.tinggi === 'tinggi' && !t.includes('tinggi')) passed = false;
        }
        if (subFilters.berat) {
          const b = item.status_gizi?.kategori_bb_u?.toLowerCase() || '';
          if (subFilters.berat === 'normal' && !b.includes('normal')) passed = false;
          if (subFilters.berat === 'kurang' && !b.includes('kurang')) passed = false;
          if (subFilters.berat === 'lebih' && !b.includes('lebih') && !b.includes('risiko')) passed = false;
        }
        if (subFilters.imunisasi) {
          const imunisasiList = item.warga?.riwayat_imunisasi || [];
          const hasVaksin = imunisasiList.some((i: any) => i.jenis_vaksin?.toUpperCase() === subFilters.imunisasi?.toUpperCase());
          if (!hasVaksin) passed = false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nama = (item.warga?.nama || '').toLowerCase();
        const nik = (item.warga?.nik || '').toLowerCase();
        const hp = (item.warga?.no_hp || '').toLowerCase();
        if (!nama.includes(query) && !nik.includes(query) && !hp.includes(query)) {
          passed = false;
        }
      }

      return passed;
    });
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan & Rekapitulasi</h2>
          <p className="text-muted-foreground">Menampilkan data pemeriksaan terbaru dan ekspor laporan berdasarkan filter aktif.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 border p-1 rounded-md shrink-0">
          <button
            onClick={() => setPosyanduFilter('my')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors ${
              posyanduFilter === 'my' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Posyandu Saya
          </button>
          <button
            onClick={() => setPosyanduFilter('all')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors ${
              posyanduFilter === 'all' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Posyandu
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-slate-200 shadow-sm">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <select 
            value={kategoriFilter}
            onChange={(e) => {
              const val = e.target.value;
              setKategoriFilter(val);
              localStorage.setItem('rekapitulasi_kategori', val);
              try {
                const savedFilters = localStorage.getItem(`rekapitulasi_filters_${val}`);
                setSubFilters(savedFilters ? JSON.parse(savedFilters) : {});
              } catch {
                setSubFilters({});
              }
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white w-full lg:w-48 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            <option value="bumil">Ibu Hamil</option>
            <option value="pasca_persalinan">Ibu Pasca Persalinan</option>
            <option value="baduta">Baduta</option>
            <option value="balita">Balita</option>
            <option value="lansia">Lansia</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari nama / NIK / No. HP" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-10 px-4 text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter Data
            </Button>
            <Button 
              variant="ghost" 
              className="h-10 px-4 text-slate-600 hover:bg-slate-100"
              onClick={() => { setSubFilters({}); setSearchQuery(''); }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          </div>
        </div>

        <CategorySummaryCards 
          kategori={kategoriFilter} 
          data={filteredPemeriksaanList} 
        />

        {/* Export Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-t border-b mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Export & Cetak Laporan</h3>
            <p className="text-sm text-slate-500">Unduh atau cetak hasil sesuai filter aktif.</p>
          </div>
          
          <div className="flex gap-2 items-center flex-wrap">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate(`/laporan/cetak?kategori=${kategoriFilter}&bulan=${currentMonth}&tahun=${currentYear}${posyanduFilter === 'all' ? '&posyanduId=all' : ''}`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
              <span className="hidden sm:inline">Cetak Visum</span>
            </Button>

            <Suspense fallback={<div className="h-10 w-32 bg-slate-100 animate-pulse rounded-md"></div>}>
              <ExportActions 
                isLoading={isPemeriksaanLoading} 
                kategoriFilter={kategoriFilter}
                posyanduIdParam={posyanduIdParam}
                bulan={currentMonth}
                tahun={currentYear}
              />
            </Suspense>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Hasil Data {kategoriFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
          
          <MonthlyReportTable 
            kategori={kategoriFilter} 
            data={filteredPemeriksaanList} 
            isLoading={isPemeriksaanLoading} 
          />
        </div>
      </div>

      <ReportFilterSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        kategori={kategoriFilter} 
        subFilters={subFilters} 
        setSubFilters={setSubFilters} 
      />

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
