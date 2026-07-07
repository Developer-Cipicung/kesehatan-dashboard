import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users } from 'lucide-react'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'

export function AdminDashboardPage() {
  const { data: posyandus, isLoading: isPosyanduLoading } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data
    },
  })

  const { data: users, isLoading: isUserLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data
    },
  })

  if (isPosyanduLoading || isUserLoading) {
    return <SkeletonCard />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan sistem manajemen Posyandu.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posyandu Terdaftar</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{posyandus?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Fasilitas pelayanan kesehatan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Akun Sistem</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Kader, Bidan, dan Admin</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
