import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PendataanStatus {
  kategori: string
  status: 'draft' | 'selesai'
}

interface MonthlySummaryWidgetProps {
  bulan: number
  tahun: number
  statuses: PendataanStatus[]
  totalWarga: number
  totalBalita: number
  totalBumil: number
  totalLansia: number
}

export function MonthlySummaryWidget({
  bulan,
  tahun,
  statuses,
  totalWarga,
  totalBalita,
  totalBumil,
  totalLansia,
}: MonthlySummaryWidgetProps) {
  const allCompleted = statuses.every((s) => s.status === 'selesai')
  const totalCompleted = statuses.filter((s) => s.status === 'selesai').length

  const categoriesMap: Record<string, string> = {
    bumil: 'Ibu Hamil',
    pasca_persalinan: 'Pasca Persalinan',
    batita: 'Batita',
    balita: 'Balita',
    lansia: 'Lansia',
    imunisasi: 'Imunisasi',
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Ringkasan Bulan {bulan}/{tahun}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <span className="block text-sm text-muted-foreground">Total Warga</span>
            <span className="text-2xl font-bold">{totalWarga}</span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <span className="block text-sm text-muted-foreground">Total Balita</span>
            <span className="text-2xl font-bold">{totalBalita}</span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <span className="block text-sm text-muted-foreground">Total Ibu Hamil</span>
            <span className="text-2xl font-bold">{totalBumil}</span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <span className="block text-sm text-muted-foreground">Total Lansia</span>
            <span className="text-2xl font-bold">{totalLansia}</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Status Pendataan Kategori</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statuses.map((stat) => (
              <div key={stat.kategori} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium">{categoriesMap[stat.kategori] || stat.kategori}</span>
                <Badge variant={stat.status === 'selesai' ? 'default' : 'outline'} className={stat.status === 'selesai' ? 'bg-primary' : ''}>
                  {stat.status === 'selesai' ? 'Selesai' : 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
