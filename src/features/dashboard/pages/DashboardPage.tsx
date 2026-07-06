import { useDashboardStats } from '../hooks/useDashboardStats'
import { StatisticCard } from '@/components/cards/StatisticCard'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Users, Baby, HeartPulse, PersonStanding } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

const mockChartData = [
  { name: 'Jan', kunjungan: 120 },
  { name: 'Feb', kunjungan: 132 },
  { name: 'Mar', kunjungan: 101 },
  { name: 'Apr', kunjungan: 143 },
  { name: 'Mei', kunjungan: 167 },
  { name: 'Jun', kunjungan: 210 },
]

const mockRecentActivity = [
  { id: 1, action: 'Pendataan Balita', user: 'Siti Aminah', time: '2 jam yang lalu' },
  { id: 2, action: 'Pembaruan Data Ibu Hamil', user: 'Nurhayati', time: '3 jam yang lalu' },
  { id: 3, action: 'Registrasi Lansia Baru', user: 'Budi Santoso', time: '5 jam yang lalu' },
  { id: 4, action: 'Selesai Pendataan Imunisasi', user: 'Siti Aminah', time: '1 hari yang lalu' },
]

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
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

  const { total_warga, total_balita, total_bumil, total_lansia, pendataan } = data

  const statusItems = [
    { label: 'Balita', status: pendataan.balita },
    { label: 'Imunisasi', status: pendataan.imunisasi },
    { label: 'Ibu Hamil', status: pendataan.bumil },
    { label: 'Pasca Persalinan', status: pendataan.pasca_persalinan },
    { label: 'Lansia', status: pendataan.lansia },
  ]

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ringkasan</h2>
        <p className="text-muted-foreground">
          Berikut adalah ringkasan data posyandu bulan ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Warga"
          value={total_warga}
          icon={Users}
          description="Terdaftar di sistem"
        />
        <StatisticCard
          title="Total Balita"
          value={total_balita}
          icon={Baby}
          description="Bulan ini"
        />
        <StatisticCard
          title="Total Ibu Hamil"
          value={total_bumil}
          icon={HeartPulse}
          description="Bulan ini"
        />
        <StatisticCard
          title="Total Lansia"
          value={total_lansia}
          icon={PersonStanding}
          description="Bulan ini"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Kunjungan</CardTitle>
            <CardDescription>
              Jumlah kunjungan posyandu 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => String(value)}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kunjungan"
                    stroke="var(--color-primary, #000)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Pendataan</CardTitle>
              <CardDescription>Bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                        item.status === 'selesai'
                          ? 'bg-success/15 text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.status === 'selesai' ? 'Selesai' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">{activity.action}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span className="mx-1">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
