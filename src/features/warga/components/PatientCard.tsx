import { useState } from 'react'
import { Edit3, Plus, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Warga } from '../services/wargaService'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUpdateWarga } from '../hooks/useWarga'
import { toast } from 'sonner'
import { MonthlyRecordForm } from '@/features/pemeriksaan/components/MonthlyRecordForm'
import { pemeriksaanService } from '../services/pemeriksaanService'

interface PatientCardProps {
  data: Warga
  kategori: string
  onView: (id: string) => void
  isReadOnly?: boolean
}

export function PatientCard({ data, kategori, onView, isReadOnly }: PatientCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')
  const [addRecordWargaId, setAddRecordWargaId] = useState<string | null>(null)
  
  const { mutateAsync: updateWarga } = useUpdateWarga()

  const isBumil = kategori === 'bumil'

  // Last checkup summary
  const latestBumil = data.pemeriksaan_bumil?.[0]
  const latestLansia = data.pemeriksaan_lansia?.[0]
  const latestPasca = data.pemeriksaan_pasca_persalinan?.[0]
  const latestBalita = data.pemeriksaan_balita_baduta?.[0]

  const lastDate = latestBumil?.tanggal_kunjungan
    || latestLansia?.tanggal_kunjungan
    || latestPasca?.tanggal_kunjungan
    || latestBalita?.tanggal_kunjungan

  const displayLastDate = lastDate
    ? new Date(lastDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-3 overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col p-4 gap-3">
        <div>
          <div className="font-bold text-slate-800 text-lg">{data.nama}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">NIK: {data.nik}</div>
          {displayLastDate && (
            <div className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md mt-2 border border-emerald-100">
              Terakhir diperiksa: {displayLastDate}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-2">
          {!isReadOnly && (
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white h-10 text-sm flex items-center justify-center gap-1 shadow-sm"
              onClick={() => setAddRecordWargaId(data.id)}
            >
              <Plus className="w-4 h-4" /> Tambah Catatan Baru
            </Button>
          )}
          
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm border-slate-200 text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50"
              onClick={() => onView(data.id)}
            >
              <Edit3 className="w-4 h-4" /> Profil
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm border-blue-200 text-blue-600 flex items-center justify-center gap-1 hover:bg-blue-50"
              onClick={() => window.open(`/warga/${data.id}/kartu`, '_blank')}
            >
              <Printer className="w-4 h-4" /> Cetak Kartu
            </Button>
          </div>
          
          {isBumil && !isReadOnly && (
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold mt-1"
              onClick={() => setShowConfirm(true)}
            >
              Tandai Telah Bersalin
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowConfirm(false)
          setTempatPersalinan('')
        }
      }}>
        <DialogContent className="w-[90vw] max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Tandai Telah Bersalin</DialogTitle>
            <DialogDescription>
              Tandai ibu ini telah bersalin? Masukkan tanggal dan tempat persalinan untuk memindahkan data pasien ke Pasca Persalinan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tanggal_persalinan" className="text-sm font-medium leading-none">
                Tanggal Persalinan <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggal_persalinan"
                type="date"
                value={tanggalPersalinan}
                onChange={(e) => setTanggalPersalinan(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tempat_persalinan" className="text-sm font-medium leading-none">
                Tempat Persalinan <span className="text-red-500">*</span>
              </label>
              <input
                id="tempat_persalinan"
                type="text"
                value={tempatPersalinan}
                onChange={(e) => setTempatPersalinan(e.target.value)}
                placeholder="Contoh: RSUD / Bidan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
              setShowConfirm(false)
              setTempatPersalinan('')
            }}>
              Batal
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={async () => {
                if (!tanggalPersalinan || !tempatPersalinan) return;
                try {
                  await updateWarga({ id: data.id, payload: { status_kehamilan: 'PASCA_PERSALINAN', tempat_persalinan: tempatPersalinan } })
                  await pemeriksaanService.createPasca({
                    warga_id: data.id,
                    tanggal_kunjungan: new Date().toISOString().split('T')[0],
                    tanggal_persalinan: tanggalPersalinan,
                    bb: 0,
                    kondisi_ibu: 'Sehat',
                    tekanan_darah_sistolik: 120,
                    tekanan_darah_diastolik: 80,
                    suhu_tubuh: 36.5,
                  })
                  toast.success('Pasien berhasil ditandai telah bersalin')
                  window.location.reload()
                } catch (error) {
                  toast.error('Gagal memproses data')
                  console.error(error)
                }
                setShowConfirm(false)
                setTempatPersalinan('')
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addRecordWargaId && (
        <MonthlyRecordForm
          open={!!addRecordWargaId}
          onOpenChange={(open) => {
            if (!open) setAddRecordWargaId(null)
          }}
          kategori={kategori}
          wargaId={addRecordWargaId}
          initialData={null}
        />
      )}
    </div>
  )
}
