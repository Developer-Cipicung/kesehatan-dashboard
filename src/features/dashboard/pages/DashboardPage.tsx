import { useDashboardStats } from '../hooks/useDashboardStats'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useAuthStore } from '@/stores/authStore'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'




export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardStats()
  const user = useAuthStore(state => state.user)
  const posyandu = useAuthStore(state => state.posyandu)
  
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        message="Terjadi kesalahan saat mengambil data ringkasan."
        onRetry={() => refetch()}
      />
    )
  }

  const {
    total_warga,
    total_lansia,
    kategori_breakdown,
    kunjungan_6_bulan
  } = data

  const totalIbu = kategori_breakdown.ibu_hamil + kategori_breakdown.pasca_persalinan
  const totalAnak = kategori_breakdown.baduta + kategori_breakdown.balita

  return (
    <div className="flex flex-col max-w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
          Selamat Datang, {(user as any)?.nama || 'Petugas'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {currentDate} · {posyandu ? `Posyandu ${posyandu.nama}` : 'Pusat Pendataan Kesehatan Cipicung'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-primary-dark p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{total_warga}</div>
            <div className="font-semibold text-slate-700 text-sm">Total Terdaftar</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            semua kategori
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-primary p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{totalIbu}</div>
            <div className="font-semibold text-slate-700 text-sm">Ibu-ibu</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="block text-slate-500">Ibu Hamil</span>
              <span className="font-semibold text-slate-700">{kategori_breakdown.ibu_hamil}</span>
            </div>
            <div>
              <span className="block text-slate-500">Pasca Salin</span>
              <span className="font-semibold text-slate-700">{kategori_breakdown.pasca_persalinan}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-primary-light p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{total_lansia}</div>
            <div className="font-semibold text-slate-700 text-sm">Lansia</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2 text-xs">
            <div>
              <span className="block text-slate-500">Terdaftar Aktif</span>
              <span className="font-semibold text-slate-700">{kategori_breakdown.lansia}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-accent p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{totalAnak}</div>
            <div className="font-semibold text-slate-700 text-sm">Anak-anak</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="block text-slate-500">Baduta</span>
              <span className="font-semibold text-slate-700">{kategori_breakdown.baduta}</span>
            </div>
            <div>
              <span className="block text-slate-500">Balita</span>
              <span className="font-semibold text-slate-700">{kategori_breakdown.balita}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-6">Pemeriksaan 6 Bulan Terakhir</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kunjungan_6_bulan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Bar dataKey="ibu" name="Ibu-ibu" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lansia" name="Lansia" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="anak" name="Anak-anak" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
