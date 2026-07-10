import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'

export function AdminDashboardPage() {
  const { data: posyandus, isLoading: isPosyanduLoading } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: users, isLoading: isUserLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isPosyanduLoading || isUserLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col max-w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 leading-tight">Selamat Datang, Super Admin</h1>
        <p className="text-sm text-slate-500 mt-1">{currentDate} · Pusat Pendataan Kesehatan Cipicung</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-primary-dark p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{posyandus?.length || 0}</div>
            <div className="font-semibold text-slate-700 text-sm">Total Posyandu Terdaftar</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Fasilitas pelayanan kesehatan
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-primary p-6 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-2">{users?.length || 0}</div>
            <div className="font-semibold text-slate-700 text-sm">Total Akun Sistem</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Kader, Bidan, dan Admin aktif
          </div>
        </div>
      </div>
      
      {/* Additional Stats Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-8">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            Posyandu Baru Ditambahkan
          </h3>
          <div className="space-y-4">
            {posyandus?.slice(0, 4).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {p.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{p.nama}</p>
                    {p.rw && <p className="text-xs text-slate-500">RW {p.rw}</p>}
                  </div>
                </div>
              </div>
            ))}
            {(!posyandus || posyandus.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada posyandu terdaftar.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            Pengguna Terbaru
          </h3>
          <div className="space-y-4">
            {users?.slice(0, 4).map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                    {u.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{u.nama}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md capitalize">
                  {u.role}
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada pengguna terdaftar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
