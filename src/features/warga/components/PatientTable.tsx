import { useState } from 'react'
import { Warga } from '../services/wargaService'
import { pemeriksaanService } from '../services/pemeriksaanService'
import { ActivitySquare, Edit3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateWarga } from '../hooks/useWarga'
import { ImunisasiCell } from './ImunisasiCell'

interface PatientTableProps {
  data: Warga[]
  kategori: string
  onView: (id: string) => void
  isReadOnly?: boolean
}

export function calculateAge(birthDate: string | Date, checkDate: string | Date): string {
  if (!birthDate || !checkDate) return '-'
  const dob = new Date(birthDate)
  const check = new Date(checkDate)
  let months = (check.getFullYear() - dob.getFullYear()) * 12 + (check.getMonth() - dob.getMonth())
  if (check.getDate() < dob.getDate()) {
    months--
  }
  
  if (months < 0) return '0 bln'
  if (months < 12) return `${months} bln`
  
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  
  if (years >= 5) {
     return `${years} thn`
  }
  return remainingMonths > 0 ? `${years} thn ${remainingMonths} bln` : `${years} thn`
}

interface RowState {
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

const emptyRow = (): RowState => ({
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

function parseTd(td: string): { s: number; d: number } | null {
  const parts = td.split('/')
  if (parts.length !== 2) return null
  const s = parseInt(parts[0])
  const d = parseInt(parts[1])
  if (isNaN(s) || isNaN(d)) return null
  return { s, d }
}

function Cell({
  value,
  onChange,
  placeholder,
  type = 'text',
  width = 'w-[80px]',
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  width?: string
  disabled?: boolean
}) {
  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        disabled={disabled}
        rows={1}
        className={`${width} px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300 transition-colors disabled:bg-slate-100 disabled:text-slate-400 resize-y min-h-[34px]`}
      />
    )
  }

  if (type === 'td') {
    const parts = value.split('/')
    const s = parts[0] || ''
    const d = parts[1] || ''
    return (
      <div className={`flex items-center gap-1 ${width}`}>
        <input
          type="number"
          value={s}
          onChange={(e) => onChange(`${e.target.value}${d ? '/' + d : ''}`)}
          placeholder="120"
          disabled={disabled}
          className="w-full min-w-0 px-1 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 disabled:bg-slate-100 placeholder:text-slate-300"
        />
        <span className="text-slate-400 font-medium">/</span>
        <input
          type="number"
          value={d}
          onChange={(e) => onChange(`${s || '0'}/${e.target.value}`)}
          placeholder="80"
          disabled={disabled}
          className="w-full min-w-0 px-1 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 disabled:bg-slate-100 placeholder:text-slate-300"
        />
      </div>
    )
  }

  if (type === 'checkbox') {
    return (
      <div className={`flex items-center justify-center ${width}`}>
        <input
          type="checkbox"
          checked={value as unknown as boolean}
          onChange={(e) => onChange(e.target.checked as unknown as string)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-primary"
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '—'}
      disabled={disabled}
      className={`${width} px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300 transition-colors disabled:bg-slate-100 disabled:text-slate-400`}
    />
  )
}

export function PatientTable({ data, kategori, onView, isReadOnly }: PatientTableProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateWarga } = useUpdateWarga()
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')

  const getRow = (id: string): RowState => rows[id] ?? emptyRow()

  const set = (id: string, field: keyof RowState, value: any) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyRow()), [field]: value },
    }))
  }

  const reset = (id: string) => {
    setRows((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

  const invalidateAfterPemeriksaanChange = () => {
    queryClient.invalidateQueries({ queryKey: ['warga'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['pendataan'] })
    queryClient.invalidateQueries({ queryKey: ['history', kategori] })
    queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list', kategori] })
  }

  const handleSave = async (warga: Warga) => {
    const row = getRow(warga.id)
    setSaving((p) => ({ ...p, [warga.id]: true }))
    try {
      if (kategori === 'bumil') {
        await pemeriksaanService.createBumil({
          warga_id: warga.id,
          tanggal_kunjungan: row.tanggal,
          bb: parseFloat(row.bb) || 0,
          tb: parseFloat(row.tfuTb) || 0,
          lingkar_perut: parseFloat(row.lingkar_perut) || 0,
          lingkar_lengan_atas: parseFloat(row.lilaGds) || 0,
          usia_kehamilan_minggu: parseInt(row.usia) || 0,
          hpht: row.hpht || row.tanggal,
          htp: row.htp || row.tanggal,
          jumlah_anak: parseInt(row.jumlah_anak) || undefined,
          riwayat_penyakit: row.riwayat_penyakit || undefined,
          kadar_hemoglobin: parseFloat(row.kadar_hemoglobin) || undefined,
          berat_janin: parseFloat(row.berat_janin) || undefined,
          terpapar_rokok: row.terpapar_rokok,
          kie: row.kie,
          suplemen_tambah_darah: row.suplemen_tambah_darah,
          tanggal_kunjungan_berikut: row.tanggal_kunjungan_berikut || undefined,
          catatan: row.catatan || undefined,
        })
      } else if (kategori === 'lansia') {
        const td = parseTd(row.td)
        if (!td) { toast.error('Format tekanan darah tidak valid (contoh: 120/80)'); return }
        await pemeriksaanService.createLansia({
          warga_id: warga.id,
          tanggal_kunjungan: row.tanggal,
          bb: parseFloat(row.bb) || 0,
          tb: parseFloat(row.tfuTb) || 0,
          tekanan_darah_sistolik: td.s,
          tekanan_darah_diastolik: td.d,
          gula_darah_sewaktu: parseFloat(row.lilaGds) || 0,
          catatan: row.catatan || undefined,
        })
      } else if (kategori === 'pasca_persalinan') {
        const td = parseTd(row.td)
        if (!td) { toast.error('Format tekanan darah tidak valid (contoh: 120/80)'); return }
        await pemeriksaanService.createPasca({
          warga_id: warga.id,
          tanggal_kunjungan: row.tanggal,
          tanggal_persalinan: row.tanggal_persalinan,
          bb: parseFloat(row.bb) || 0,
          tekanan_darah_sistolik: td.s,
          tekanan_darah_diastolik: td.d,
          suhu_tubuh: parseFloat(row.suhu_tubuh) || 0,
          kondisi_ibu: row.kondisi_ibu || undefined,
          tinggi_badan_bayi: parseFloat(row.tinggi_badan_bayi) || undefined,
          berat_badan_bayi: parseFloat(row.berat_badan_bayi) || undefined,
          kie: row.kie,
          fasilitasi_rujukan: row.fasilitasi_rujukan,
          fasilitasi_bantuan_sosial: row.fasilitasi_bantuan_sosial,
          tanggal_kunjungan_berikut: row.tanggal_kunjungan_berikut || undefined,
          catatan: row.catatan || undefined,
        })
      } else {
        // balita, batita, anak_sekolah
        await pemeriksaanService.createBalita({
          warga_id: warga.id,
          tanggal_kunjungan: row.tanggal,
          bb: parseFloat(row.bb) || 0,
          tb: parseFloat(row.tfuTb) || 0,
          lingkar_kepala: parseFloat(row.lingkar_kepala) || 0,
          lingkar_lengan_atas: parseFloat(row.lilaGds) || 0,
          kondisi: row.kondisi || undefined,
          asi_eksklusif: row.asi_eksklusif,
          fasilitasi_bantuan_sosial: row.fasilitasi_bantuan_sosial,
          tanggal_kunjungan_berikut: row.tanggal_kunjungan_berikut || undefined,
          nama_ayah: row.nama_ayah || undefined,
          nama_ibu: row.nama_ibu || undefined,
          catatan: row.catatan || undefined,
        })
      }

      toast.success(`Data ${warga.nama} tersimpan`)
      reset(warga.id)
      invalidateAfterPemeriksaanChange()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data')
    } finally {
      setSaving((p) => ({ ...p, [warga.id]: false }))
    }
  }

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'

  return (
    <>
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 pb-4">
      <table className="w-full min-w-[1400px] text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-[160px]">NIK</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-[190px]">Nama</th>

            <th colSpan={isBalita ? 12 : isBumil ? 16 : isPasca ? 12 : 6} className="px-4 py-3 border-l border-slate-100">
              <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                <ActivitySquare className="w-4 h-4 mr-2" />
                Record Pemeriksaan
              </div>
            </th>
            {!isReadOnly && (
                <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-l border-slate-100 w-[160px]">Aksi</th>
            )}
          </tr>
          <tr className="border-b-2 border-primary bg-primary/5">
            <th colSpan={2}></th>

            <th className="px-3 py-3 font-semibold text-primary text-xs">Usia</th>
            {isBumil && (
              <th className="px-3 py-3 font-semibold text-primary text-xs">Usia Kandungan (mgg) <span className="text-red-500">*</span></th>
            )}
            <th className="px-3 py-3 font-semibold text-primary text-xs">
              {isBalita ? 'Berat Badan Anak' : isBumil || isPasca ? 'Berat Badan Ibu' : 'Berat Badan Lansia'} (kg) <span className="text-red-500">*</span>
            </th>

            {isBalita && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi/Panjang Badan Anak (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Kepala (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Lengan Atas (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kondisi</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">ASI<br/>Eksklusif</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Bantuan<br/>Sosial</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Imunisasi</th>
              </>
            )}

            {isBumil && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Jumlah<br/>Anak</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan Ibu (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Perut (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">LILA (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">HPHT <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">HTP <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Riwayat<br/>Penyakit</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kadar<br/>Hb</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat<br/>Janin</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Rokok</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">KIE</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">TTD</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isLansia && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan Lansia (cm) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Gula Darah Sewaktu (mg/dL) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isPasca && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Suhu Tubuh (°C) <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kondisi Ibu <span className="text-red-500">*</span></th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi<br/>Bayi</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat<br/>Bayi</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">KIE</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Rujukan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Bansos</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {!isLansia && (
              <th className="px-3 py-3 font-semibold text-primary text-xs">Tgl Kunjungan<br/>Berikutnya</th>
            )}

            <th className="border-l border-slate-100"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((warga) => {
            const latestBumil = warga.pemeriksaan_bumil?.[0]
            const latestBalita = warga.pemeriksaan_balita_baduta?.[0]
            const latestLansia = warga.pemeriksaan_lansia?.[0]
            const latestPasca = warga.pemeriksaan_pasca_persalinan?.[0]

            // Build last-record display as placeholder hints
            let lastBb = ''

            let lastTfuTb = ''
            let lastLingkarPerut = ''
            let lastLilaGds = ''

            if (latestBumil) {
              lastBb = latestBumil.bb?.toString()
              lastTfuTb = latestBumil.tb?.toString()
              lastLingkarPerut = latestBumil.lingkar_perut?.toString()
              lastLilaGds = latestBumil.lingkar_lengan_atas?.toString()
            } else if (latestBalita) {
              lastBb = latestBalita.bb?.toString()
              lastTfuTb = latestBalita.tb?.toString()
              lastLilaGds = latestBalita.lingkar_lengan_atas?.toString()
            } else if (latestLansia) {
              lastBb = latestLansia.bb?.toString()

              lastTfuTb = latestLansia.tb?.toString()
              lastLilaGds = latestLansia.gula_darah_sewaktu?.toString()
            } else if (latestPasca) {
              lastBb = latestPasca.bb?.toString()

              lastTfuTb = latestPasca.suhu_tubuh?.toString()
            }

            const row = getRow(warga.id)
            const isSaving = saving[warga.id] || false

            return (
              <tr key={warga.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{warga.nik}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800 text-sm">{warga.nama}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                </td>


                {/* Usia */}
                <td className="px-3 py-3">
                  <span className="text-sm font-medium text-slate-700 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 whitespace-nowrap inline-block min-w-[70px] text-center">
                    {calculateAge(warga.tanggal_lahir, row.tanggal)}
                  </span>
                </td>

                {/* Usia Kandungan */}
                {isBumil && (
                  <td className="px-3 py-3">
                    <Cell
                      type="number"
                      value={row.usia}
                      onChange={(v) => set(warga.id, 'usia', v)}
                      placeholder="28"
                      width="w-[80px]"
                      disabled={isReadOnly}
                    />
                  </td>
                )}

                {/* BB */}
                <td className="px-3 py-3">
                  <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || (isBalita ? '8.5' : isBumil ? '55.5' : isPasca ? '62' : '58')} width="w-[70px]" disabled={isReadOnly} />
                </td>

                {isBalita && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || '72'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lingkar_kepala} onChange={(v) => set(warga.id, 'lingkar_kepala', v)} placeholder="44" width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || '13.5'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.kondisi} onChange={(v) => set(warga.id, 'kondisi', v)} placeholder="Sehat" width="w-[80px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.asi_eksklusif as any} onChange={(v) => set(warga.id, 'asi_eksklusif', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.fasilitasi_bantuan_sosial as any} onChange={(v) => set(warga.id, 'fasilitasi_bantuan_sosial', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder="catatan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <ImunisasiCell wargaId={warga.id} disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isBumil && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.jumlah_anak} onChange={(v) => set(warga.id, 'jumlah_anak', v)} placeholder="1" width="w-[60px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || '155'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lingkar_perut} onChange={(v) => set(warga.id, 'lingkar_perut', v)} placeholder={lastLingkarPerut || '85'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || '24'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="date" value={row.hpht} onChange={(v) => set(warga.id, 'hpht', v)} width="w-[130px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="date" value={row.htp} onChange={(v) => set(warga.id, 'htp', v)} width="w-[130px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.riwayat_penyakit} onChange={(v) => set(warga.id, 'riwayat_penyakit', v)} placeholder="-" width="w-[90px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.kadar_hemoglobin} onChange={(v) => set(warga.id, 'kadar_hemoglobin', v)} placeholder="12" width="w-[60px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.berat_janin} onChange={(v) => set(warga.id, 'berat_janin', v)} placeholder="1500" width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.terpapar_rokok as any} onChange={(v) => set(warga.id, 'terpapar_rokok', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.kie as any} onChange={(v) => set(warga.id, 'kie', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.suplemen_tambah_darah as any} onChange={(v) => set(warga.id, 'suplemen_tambah_darah', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder="catatan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isLansia && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || '160'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="td" value={row.td} onChange={(v) => set(warga.id, 'td', v)} width="w-[140px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || '120'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder="catatan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isPasca && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="td" value={row.td} onChange={(v) => set(warga.id, 'td', v)} width="w-[140px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.suhu_tubuh} onChange={(v) => set(warga.id, 'suhu_tubuh', v)} placeholder={lastTfuTb || '36.5'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.kondisi_ibu} onChange={(v) => set(warga.id, 'kondisi_ibu', v)} placeholder="Baik, tidak ada keluhan" width="w-[150px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tinggi_badan_bayi} onChange={(v) => set(warga.id, 'tinggi_badan_bayi', v)} placeholder="50" width="w-[60px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.berat_badan_bayi} onChange={(v) => set(warga.id, 'berat_badan_bayi', v)} placeholder="3.2" width="w-[60px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.kie as any} onChange={(v) => set(warga.id, 'kie', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.fasilitasi_rujukan as any} onChange={(v) => set(warga.id, 'fasilitasi_rujukan', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={row.fasilitasi_bantuan_sosial as any} onChange={(v) => set(warga.id, 'fasilitasi_bantuan_sosial', v)} width="w-full" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder="catatan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {!isLansia && (
                  <td className="px-3 py-3">
                    <Cell type="date" value={row.tanggal_kunjungan_berikut} onChange={(v) => set(warga.id, 'tanggal_kunjungan_berikut', v)} width="w-[130px]" disabled={isReadOnly} />
                  </td>
                )}

                {/* Aksi */}
                {!isReadOnly && (
                  <td className="px-4 py-3 border-l border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white h-8 px-3 text-xs"
                        disabled={isSaving}
                        onClick={() => handleSave(warga)}
                      >
                        {isSaving ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Menyimpan</>
                        ) : 'Simpan'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-slate-200 text-slate-500 hover:bg-slate-50"
                        onClick={() => onView(warga.id)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />Riwayat
                      </Button>
                      {isBumil && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-semibold"
                          onClick={() => setConfirmId(warga.id)}
                        >
                          Telah Bersalin
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={12} className="px-4 py-10 text-center text-slate-400 text-sm">
                Tidak ada pasien ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      <Dialog open={!!confirmId} onOpenChange={(open) => {
        if (!open) {
          setConfirmId(null)
          setTempatPersalinan('')
        }
      }}>
        <DialogContent>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConfirmId(null)
              setTempatPersalinan('')
            }}>
              Batal
            </Button>
            <Button 
              onClick={async () => {
                if (!tanggalPersalinan || !tempatPersalinan || !confirmId) return;
                try {
                  await updateWarga({ id: confirmId, payload: { status_kehamilan: 'PASCA_PERSALINAN', tempat_persalinan: tempatPersalinan } })
                  await pemeriksaanService.createPasca({
                    warga_id: confirmId,
                    tanggal_kunjungan: new Date().toISOString().split('T')[0],
                    tanggal_persalinan: tanggalPersalinan,
                    bb: 0,
                    tekanan_darah_sistolik: 120,
                    tekanan_darah_diastolik: 80,
                    suhu_tubuh: 36.5,
                  })
                  toast.success('Berhasil dipindahkan ke Pasca Persalinan')
                  invalidateAfterPemeriksaanChange()
                } catch (e: any) {
                  toast.error('Gagal menyimpan data persalinan')
                }
                setConfirmId(null)
                setTempatPersalinan('')
              }}
              disabled={!tanggalPersalinan || !tempatPersalinan}
            >
              Ya, Pindahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
