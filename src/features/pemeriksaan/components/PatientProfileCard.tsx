import { Warga } from '@/features/warga/services/wargaService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetImunisasiByWarga } from '@/features/warga/hooks/useImunisasi'
import { useGetWargaList } from '@/features/warga/hooks/useWarga'

interface PatientProfileCardProps {
  warga: Warga
  kategori?: string
}

export function PatientProfileCard({ warga, kategori }: PatientProfileCardProps) {
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const isIbu = kategori === 'bumil' || kategori === 'pasca_persalinan'
  const { data: imunisasiList = [] } = useGetImunisasiByWarga(isBalita ? warga.id : '')
  
  // To get list anak, we fetch all warga in the posyandu and filter by nama_ibu
  const { data: wargaListRes } = useGetWargaList({ posyanduId: warga.posyandu_id, limit: 1000 })
  const allWarga = wargaListRes?.data || []
  const listAnak = allWarga.filter(a => 
    (a.kategori === 'balita' || a.kategori === 'baduta') && 
    a.pemeriksaan_balita_baduta?.[0]?.nama_ibu === warga.nama
  )

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
          <div>
            <span className="text-muted-foreground block text-xs">Tempat Lahir</span>
            <span className="font-medium">{warga.tempat_lahir || '-'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground block text-xs">Alamat</span>
            <span className="font-medium">{warga.alamat || '-'}</span>
          </div>

          {(kategori === 'pasca_persalinan' || warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan) && (
            <div>
              <span className="text-muted-foreground block text-xs">Tanggal Persalinan</span>
              <span className="font-medium">
                {warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan ? new Date(warga.pemeriksaan_pasca_persalinan[0].tanggal_persalinan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </span>
            </div>
          )}
          
          {(kategori === 'pasca_persalinan') && (
            <div>
              <span className="text-muted-foreground block text-xs">Tempat Persalinan</span>
              <span className="font-medium">{warga.tempat_persalinan || '-'}</span>
            </div>
          )}

          {isBalita && (
            <>
              <div>
                <span className="text-muted-foreground block text-xs">Penggunaan Kontrasepsi Orang Tua</span>
                <span className="font-medium">{warga.penggunaan_kontrasepsi || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Nama Orang Tua</span>
                <span className="font-medium">
                  {warga.pemeriksaan_balita_baduta?.[0]?.nama_ayah ? `Ayah: ${warga.pemeriksaan_balita_baduta[0].nama_ayah}` : ''}
                  {warga.pemeriksaan_balita_baduta?.[0]?.nama_ayah && warga.pemeriksaan_balita_baduta?.[0]?.nama_ibu ? ', ' : ''}
                  {warga.pemeriksaan_balita_baduta?.[0]?.nama_ibu ? `Ibu: ${warga.pemeriksaan_balita_baduta[0].nama_ibu}` : ''}
                  {!warga.pemeriksaan_balita_baduta?.[0]?.nama_ayah && !warga.pemeriksaan_balita_baduta?.[0]?.nama_ibu ? '-' : ''}
                </span>
              </div>
            </>
          )}

          {isIbu && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground block text-xs">Daftar Anak (Balita/Baduta)</span>
              <div className="flex flex-col gap-1 mt-1">
                {listAnak.length > 0 ? (
                  listAnak.map((anak) => (
                    <div key={anak.id} className="text-sm border border-slate-100 bg-slate-50 rounded px-3 py-2 flex items-center justify-between">
                      <span className="font-medium">{anak.nama}</span>
                      <span className="text-xs text-slate-500">
                        {anak.tanggal_lahir ? `${Math.floor((new Date().getTime() - new Date(anak.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))} bln` : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm font-medium text-slate-400">Tidak ada data anak yang terdaftar di posyandu ini</span>
                )}
              </div>
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
                  <span className="text-slate-400 font-medium text-xs md:text-md">Belum ada data imunisasi</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
