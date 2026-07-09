import { Warga } from '@/features/warga/services/wargaService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetImunisasiByWarga } from '@/features/warga/hooks/useImunisasi'

interface PatientProfileCardProps {
  warga: Warga
  kategori?: string
}

export function PatientProfileCard({ warga, kategori }: PatientProfileCardProps) {
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const { data: imunisasiList = [] } = useGetImunisasiByWarga(isBalita ? warga.id : '')

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
            <span className="text-muted-foreground block text-xs">NIK</span>
            <span className="font-medium">{warga.nik}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">No. HP</span>
            <span className="font-medium">{warga.nomor || 'Tidak ada'}</span>
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
                    {warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan && (
            <div>
              <span className="text-muted-foreground block text-xs">Tanggal Persalinan</span>
              <span className="font-medium">
                {new Date(warga.pemeriksaan_pasca_persalinan[0].tanggal_persalinan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block text-xs">Jenis Kelamin</span>
            <span className="font-medium">{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
          {isBalita && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground block text-xs mb-1">Riwayat Imunisasi</span>
              <div className="flex flex-wrap gap-1">
                {imunisasiList.length > 0 ? (
                  imunisasiList.map((item: any) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20"
                    >
                      {item.jenis_vaksin}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 font-medium text-xs">Belum ada data imunisasi</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
