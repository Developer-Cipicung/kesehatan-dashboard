import { useState } from 'react'
import { Warga } from '../services/wargaService'
import { calculateAge } from './PatientTable'
import { pemeriksaanService } from '../services/pemeriksaanService'
import { Button } from '@/components/ui/button'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Edit3, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateWarga } from '../hooks/useWarga'
import { ImunisasiCell } from './ImunisasiCell'

interface PatientCardProps {
  data: Warga
  kategori: string
  onView: (id: string) => void
  isReadOnly?: boolean
}

interface FormState {
  tanggal: string
  usia: string
  bb: string
  td: string
  tfuTb: string
  djj: string
  lilaGds: string
  hb: string
  tb: string
  lingkar_perut: string
  hpht: string
  htp: string
  catatan: string
  lingkar_kepala: string
  nama_ayah: string
  nama_ibu: string
  tanggal_persalinan: string
  suhu_tubuh: string
  kondisi_ibu: string
  kondisi: string
  asi_eksklusif: boolean
  fasilitasi_bantuan_sosial: boolean
  jumlah_anak: string
  riwayat_penyakit: string
  kadar_hemoglobin: string
  berat_janin: string
  terpapar_rokok: boolean
  kie: boolean
  suplemen_tambah_darah: boolean
  tinggi_badan_bayi: string
  berat_badan_bayi: string
  fasilitasi_rujukan: boolean
  tanggal_kunjungan_berikut: string
}

const emptyForm = (): FormState => ({
  tanggal: new Date().toISOString().split('T')[0],
  usia: '',
  bb: '',
  td: '',
  tfuTb: '',
  djj: '',
  lilaGds: '',
  hb: '',
  tb: '',
  lingkar_perut: '',
  hpht: '',
  htp: '',
  catatan: '',
  lingkar_kepala: '',
  nama_ayah: '',
  nama_ibu: '',
  tanggal_persalinan: new Date().toISOString().slice(0, 10),
  suhu_tubuh: '',
  kondisi_ibu: '',
  kondisi: '',
  asi_eksklusif: false,
  fasilitasi_bantuan_sosial: false,
  jumlah_anak: '',
  riwayat_penyakit: '',
  kadar_hemoglobin: '',
  berat_janin: '',
  terpapar_rokok: false,
  kie: false,
  suplemen_tambah_darah: false,
  tinggi_badan_bayi: '',
  berat_badan_bayi: '',
  fasilitasi_rujukan: false,
  tanggal_kunjungan_berikut: '',
})

function parseTd(td: string) {
  const parts = td.split('/')
  if (parts.length !== 2) return null
  const s = parseInt(parts[0])
  const d = parseInt(parts[1])
  if (isNaN(s) || isNaN(d)) return null
  return { s, d }
}

function FieldRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-[140px]">{label}</span>
      {children}
    </div>
  )
}

function MobileInputTd({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const parts = value.split('/')
  const s = parts[0] || ''
  const d = parts[1] || ''
  return (
    <div className="flex items-center gap-1 w-full">
      <input
        type="number"
        value={s}
        onChange={(e) => onChange(`${e.target.value}${d ? '/' + d : ''}`)}
        placeholder="120"
        className="flex-1 px-2 py-1 border border-slate-200 rounded text-center text-sm text-slate-700 bg-white focus:outline-none focus:border-primary placeholder:text-slate-300 w-full min-w-0"
      />
      <span className="text-slate-400 font-medium">/</span>
      <input
        type="number"
        value={d}
        onChange={(e) => onChange(`${s || '0'}/${e.target.value}`)}
        placeholder="80"
        className="flex-1 px-2 py-1 border border-slate-200 rounded text-center text-sm text-slate-700 bg-white focus:outline-none focus:border-primary placeholder:text-slate-300 w-full min-w-0"
      />
    </div>
  )
}

function MobileInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '—'}
      className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm text-slate-700 bg-white focus:outline-none focus:border-primary placeholder:text-slate-300 w-full"
    />
  )
}

function MobileTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '—'}
      rows={2}
      className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm text-slate-700 bg-white focus:outline-none focus:border-primary placeholder:text-slate-300 w-full resize-y"
    />
  )
}

export function PatientCard({ data, kategori, onView, isReadOnly }: PatientCardProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateWarga } = useUpdateWarga()
  const [form, setForm] = useState<FormState>(emptyForm())
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')

  const set = (field: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'

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

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isBumil) {
        await pemeriksaanService.createBumil({
          warga_id: data.id,
          tanggal_kunjungan: form.tanggal,
          bb: parseFloat(form.bb) || 0,
          tb: parseFloat(form.tfuTb) || 0,
          lingkar_perut: parseFloat(form.lingkar_perut) || 0,
          lingkar_lengan_atas: parseFloat(form.lilaGds) || 0,
          usia_kehamilan_minggu: parseInt(form.usia) || 0,
          hpht: form.hpht || form.tanggal,
          htp: form.htp || form.tanggal,
          jumlah_anak: parseInt(form.jumlah_anak) || undefined,
          riwayat_penyakit: form.riwayat_penyakit || undefined,
          kadar_hemoglobin: parseFloat(form.kadar_hemoglobin) || undefined,
          berat_janin: parseFloat(form.berat_janin) || undefined,
          terpapar_rokok: form.terpapar_rokok,
          kie: form.kie,
          suplemen_tambah_darah: form.suplemen_tambah_darah,
          tanggal_kunjungan_berikut: form.tanggal_kunjungan_berikut || undefined,
          catatan: form.catatan || undefined,
        })
      } else if (isLansia) {
        const td = parseTd(form.td)
        if (!td) { toast.error('Format tekanan darah tidak valid (contoh: 120/80)'); return }
        await pemeriksaanService.createLansia({
          warga_id: data.id,
          tanggal_kunjungan: form.tanggal,
          bb: parseFloat(form.bb) || 0,
          tb: parseFloat(form.tfuTb) || 0,
          tekanan_darah_sistolik: td.s,
          tekanan_darah_diastolik: td.d,
          gula_darah_sewaktu: parseFloat(form.lilaGds) || 0,
          catatan: form.catatan || undefined,
        })
      } else if (isPasca) {
        const td = parseTd(form.td)
        if (!td) { toast.error('Format tekanan darah tidak valid (contoh: 120/80)'); return }
        await pemeriksaanService.createPasca({
          warga_id: data.id,
          tanggal_kunjungan: form.tanggal,
          tanggal_persalinan: form.tanggal_persalinan,
          bb: parseFloat(form.bb) || 0,
          tekanan_darah_sistolik: td.s,
          tekanan_darah_diastolik: td.d,
          suhu_tubuh: parseFloat(form.suhu_tubuh) || 0,
          kondisi_ibu: form.kondisi_ibu || undefined,
          tinggi_badan_bayi: parseFloat(form.tinggi_badan_bayi) || undefined,
          berat_badan_bayi: parseFloat(form.berat_badan_bayi) || undefined,
          kie: form.kie,
          fasilitasi_rujukan: form.fasilitasi_rujukan,
          fasilitasi_bantuan_sosial: form.fasilitasi_bantuan_sosial,
          tanggal_kunjungan_berikut: form.tanggal_kunjungan_berikut || undefined,
          catatan: form.catatan || undefined,
        })
      } else {
        await pemeriksaanService.createBalita({
          warga_id: data.id,
          tanggal_kunjungan: form.tanggal,
          bb: parseFloat(form.bb) || 0,
          tb: parseFloat(form.tfuTb) || 0,
          lingkar_kepala: parseFloat(form.lingkar_kepala) || 0,
          lingkar_lengan_atas: parseFloat(form.lilaGds) || 0,
          kondisi: form.kondisi || undefined,
          asi_eksklusif: form.asi_eksklusif,
          fasilitasi_bantuan_sosial: form.fasilitasi_bantuan_sosial,
          tanggal_kunjungan_berikut: form.tanggal_kunjungan_berikut || undefined,
          nama_ayah: form.nama_ayah || undefined,
          nama_ibu: form.nama_ibu || undefined,
          catatan: form.catatan || undefined,
        })
      }

      toast.success(`Data ${data.nama} tersimpan`)
      setForm(emptyForm())
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['warga'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between p-4 gap-3">
        <div>
          <div className="font-bold text-slate-800">{data.nama}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">{data.nik}</div>
          {displayLastDate && (
            <div className="text-xs text-primary mt-1">Pemeriksaan terakhir: {displayLastDate}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-200"
            onClick={() => onView(data.id)}
          >
            <Edit3 className="w-3 h-3 mr-1" />Riwayat
          </Button>
          {isBumil && !isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold"
              onClick={() => setShowConfirm(true)}
            >
              Telah Bersalin
            </Button>
          )}
          {!isReadOnly && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 text-xs bg-primary hover:bg-primary/90 text-white rounded-md px-3 py-1.5 font-medium transition-colors"
            >
              {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Input Data
            </button>
          )}
        </div>
      </div>

      {/* Expandable Form */}
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider pt-3 pb-2">
            Data Pemeriksaan Baru
          </p>
          <div className="space-y-0">

            <FieldRow label="Usia">
              <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-sm text-slate-700 font-medium">
                {calculateAge(data.tanggal_lahir, form.tanggal)}
              </div>
            </FieldRow>



            <FieldRow label={<>Berat Badan (kg) <span className="text-red-500">*</span></>}>
              <MobileInput type="number" value={form.bb} onChange={(v) => set('bb', v)} placeholder="50.5" />
            </FieldRow>

            {isBalita && (
              <>
                <FieldRow label={<>Tinggi Badan (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.tfuTb} onChange={(v) => set('tfuTb', v)} placeholder="85.5" />
                </FieldRow>
                <FieldRow label={<>Lingkar Kepala (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.lingkar_kepala} onChange={(v) => set('lingkar_kepala', v)} placeholder="34.5" />
                </FieldRow>
                <FieldRow label={<>LILA (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.lilaGds} onChange={(v) => set('lilaGds', v)} placeholder="15" />
                </FieldRow>
                <FieldRow label="Kondisi">
                  <MobileInput value={form.kondisi} onChange={(v) => set('kondisi', v)} placeholder="Sehat" />
                </FieldRow>
                <FieldRow label="ASI Eksklusif">
                  <input type="checkbox" checked={form.asi_eksklusif} onChange={(e) => set('asi_eksklusif', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Bantuan Sosial">
                  <input type="checkbox" checked={form.fasilitasi_bantuan_sosial} onChange={(e) => set('fasilitasi_bantuan_sosial', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Catatan">
                  <MobileTextarea value={form.catatan} onChange={(v) => set('catatan', v)} placeholder="tidak ada..." />
                </FieldRow>
                <FieldRow label="Imunisasi">
                  <ImunisasiCell wargaId={data.id} disabled={isReadOnly} />
                </FieldRow>
              </>
            )}

            {isBumil && (
              <>
                <FieldRow label={<>Usia Kandungan (mgg) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.usia} onChange={(v) => set('usia', v)} placeholder="12" />
                </FieldRow>
                <FieldRow label="Jumlah Anak">
                  <MobileInput type="number" value={form.jumlah_anak} onChange={(v) => set('jumlah_anak', v)} placeholder="1" />
                </FieldRow>
                <FieldRow label={<>Tinggi Badan (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.tfuTb} onChange={(v) => set('tfuTb', v)} placeholder="160" />
                </FieldRow>
                <FieldRow label={<>Lingkar Perut (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.lingkar_perut} onChange={(v) => set('lingkar_perut', v)} placeholder="85" />
                </FieldRow>
                <FieldRow label={<>LILA (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.lilaGds} onChange={(v) => set('lilaGds', v)} placeholder="24" />
                </FieldRow>
                <FieldRow label={<>HPHT <span className="text-red-500">*</span></>}>
                  <MobileInput type="date" value={form.hpht} onChange={(v) => set('hpht', v)} />
                </FieldRow>
                <FieldRow label={<>HTP <span className="text-red-500">*</span></>}>
                  <MobileInput type="date" value={form.htp} onChange={(v) => set('htp', v)} />
                </FieldRow>
                <FieldRow label="Riwayat Penyakit">
                  <MobileInput value={form.riwayat_penyakit} onChange={(v) => set('riwayat_penyakit', v)} placeholder="Tidak ada" />
                </FieldRow>
                <FieldRow label="Kadar HB">
                  <MobileInput type="number" value={form.kadar_hemoglobin} onChange={(v) => set('kadar_hemoglobin', v)} placeholder="12" />
                </FieldRow>
                <FieldRow label="Berat Janin (g)">
                  <MobileInput type="number" value={form.berat_janin} onChange={(v) => set('berat_janin', v)} placeholder="1500" />
                </FieldRow>
                <FieldRow label="Terpapar Rokok">
                  <input type="checkbox" checked={form.terpapar_rokok} onChange={(e) => set('terpapar_rokok', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="KIE">
                  <input type="checkbox" checked={form.kie} onChange={(e) => set('kie', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Suplemen TTD">
                  <input type="checkbox" checked={form.suplemen_tambah_darah} onChange={(e) => set('suplemen_tambah_darah', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Catatan">
                  <MobileTextarea value={form.catatan} onChange={(v) => set('catatan', v)} placeholder="tidak ada..." />
                </FieldRow>
              </>
            )}

            {isLansia && (
              <>
                <FieldRow label={<>Tinggi Badan (cm) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.tfuTb} onChange={(v) => set('tfuTb', v)} placeholder="160" />
                </FieldRow>
                <FieldRow label={<>Tekanan Darah (mmHg) <span className="text-red-500">*</span></>}>
                  <MobileInputTd value={form.td} onChange={(v) => set('td', v)} />
                </FieldRow>
                <FieldRow label={<>GDS (mg/dL) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.lilaGds} onChange={(v) => set('lilaGds', v)} placeholder="110" />
                </FieldRow>
                <FieldRow label="Catatan">
                  <MobileTextarea value={form.catatan} onChange={(v) => set('catatan', v)} placeholder="tidak ada..." />
                </FieldRow>
              </>
            )}

            {isPasca && (
              <>
                <FieldRow label={<>Tekanan Darah (mmHg) <span className="text-red-500">*</span></>}>
                  <MobileInputTd value={form.td} onChange={(v) => set('td', v)} />
                </FieldRow>
                <FieldRow label={<>Suhu Tubuh (°C) <span className="text-red-500">*</span></>}>
                  <MobileInput type="number" value={form.suhu_tubuh} onChange={(v) => set('suhu_tubuh', v)} placeholder="36.5" />
                </FieldRow>
                <FieldRow label={<>Kondisi Ibu <span className="text-red-500">*</span></>}>
                  <MobileInput value={form.kondisi_ibu} onChange={(v) => set('kondisi_ibu', v)} placeholder="baik..." />
                </FieldRow>
                <FieldRow label="Tinggi Bayi (cm)">
                  <MobileInput type="number" value={form.tinggi_badan_bayi} onChange={(v) => set('tinggi_badan_bayi', v)} placeholder="50" />
                </FieldRow>
                <FieldRow label="Berat Bayi (kg)">
                  <MobileInput type="number" value={form.berat_badan_bayi} onChange={(v) => set('berat_badan_bayi', v)} placeholder="3.2" />
                </FieldRow>
                <FieldRow label="KIE">
                  <input type="checkbox" checked={form.kie} onChange={(e) => set('kie', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Fasilitasi Rujukan">
                  <input type="checkbox" checked={form.fasilitasi_rujukan} onChange={(e) => set('fasilitasi_rujukan', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Bantuan Sosial">
                  <input type="checkbox" checked={form.fasilitasi_bantuan_sosial} onChange={(e) => set('fasilitasi_bantuan_sosial', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                </FieldRow>
                <FieldRow label="Catatan">
                  <MobileTextarea value={form.catatan} onChange={(v) => set('catatan', v)} placeholder="tidak ada..." />
                </FieldRow>
              </>
            )}

            {!isLansia && (
              <FieldRow label="Kunjungan Berikutnya">
                <MobileInput type="date" value={form.tanggal_kunjungan_berikut} onChange={(v) => set('tanggal_kunjungan_berikut', v)} />
              </FieldRow>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-9 text-sm"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Menyimpan...</> : 'Simpan Data'}
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 text-sm border-slate-200"
              onClick={() => { setForm(emptyForm()); setOpen(false) }}
            >
              Batal
            </Button>
          </div>
        </div>
      )}
      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowConfirm(false)
          setTempatPersalinan('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Telah Bersalin</DialogTitle>
            <DialogDescription>
              Masukkan tanggal dan tempat persalinan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tanggal_persalinan_card" className="text-sm font-medium leading-none">
                Tanggal Persalinan <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggal_persalinan_card"
                type="date"
                value={tanggalPersalinan}
                onChange={(e) => setTanggalPersalinan(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tempat_persalinan_card" className="text-sm font-medium leading-none">
                Tempat Persalinan <span className="text-red-500">*</span>
              </label>
              <input
                id="tempat_persalinan_card"
                type="text"
                value={tempatPersalinan}
                onChange={(e) => setTempatPersalinan(e.target.value)}
                placeholder="Contoh: RSUD / Bidan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfirm(false)
              setTempatPersalinan('')
            }}>
              Batal
            </Button>
            <Button 
              onClick={async () => {
                if (!tanggalPersalinan || !tempatPersalinan) return;
                try {
                  await updateWarga({ id: data.id, payload: { status_kehamilan: 'PASCA_PERSALINAN', tempat_persalinan: tempatPersalinan } })
                  await pemeriksaanService.createPasca({
                    warga_id: data.id,
                    tanggal_kunjungan: new Date().toISOString().split('T')[0],
                    tanggal_persalinan: tanggalPersalinan,
                    bb: 0,
                    tekanan_darah_sistolik: 120,
                    tekanan_darah_diastolik: 80,
                    suhu_tubuh: 36.5,
                  })
                  toast.success('Berhasil dipindahkan ke Pasca Persalinan')
                  queryClient.invalidateQueries({ queryKey: ['warga'] })
                } catch (e: any) {
                  toast.error('Gagal menyimpan data persalinan')
                }
                setShowConfirm(false)
                setTempatPersalinan('')
              }}
              disabled={!tanggalPersalinan || !tempatPersalinan}
            >
              Ya, Pindahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
