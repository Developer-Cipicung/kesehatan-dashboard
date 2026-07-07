import { Warga } from '@/features/warga/services/wargaService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PatientProfileCardProps {
  warga: Warga
}

export function PatientProfileCard({ warga }: PatientProfileCardProps) {
  const isMale = warga.jenis_kelamin === 'L'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>{warga.nama}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">No. HP</span>
            <span className="font-medium">{warga.no_hp || 'Tidak ada'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">NIK</span>
            <span className="font-medium">{warga.nik}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Tanggal Lahir</span>
            <span className="font-medium">
              {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Jenis Kelamin</span>
            <span className="font-medium">{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
