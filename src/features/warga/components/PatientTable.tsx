import { useState } from 'react'
import { Warga } from '../services/wargaService'
import { pemeriksaanService } from '../services/pemeriksaanService'
import { ActivitySquare, Edit3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateWarga } from '../hooks/useWarga'

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
  keluhan: string
  lingkar_kepala: string
  nama_ayah: string
  nama_ibu: string
  tanggal_persalinan: string
  suhu_tubuh: string
  kondisi_ibu: string
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
  keluhan: '',
  lingkar_kepala: '',
  nama_ayah: '',
  nama_ibu: '',
  tanggal_persalinan: new Date().toISOString().slice(0, 10),
  suhu_tubuh: '',
  kondisi_ibu: '',
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

  const getRow = (id: string): RowState => rows[id] ?? emptyRow()

  const set = (id: string, field: keyof RowState, value: string) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyRow()), [field]: value },
    }))
  }

  const reset = (id: string) => {
    setRows((prev) => { const n = { ...prev }; delete n[id]; return n })
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
          keluhan: row.keluhan || undefined,
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
          keluhan: row.keluhan || undefined,
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
          keluhan: row.keluhan || undefined,
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
          nama_ayah: row.nama_ayah || undefined,
          nama_ibu: row.nama_ibu || undefined,
          keluhan: row.keluhan || undefined,
        })
      }

      toast.success(`Data ${warga.nama} tersimpan`)
      reset(warga.id)
      queryClient.invalidateQueries({ queryKey: ['warga'] })
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

            <th colSpan={isBalita ? 8 : isBumil ? 9 : 6} className="px-4 py-3 border-l border-slate-100">
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
            <th colSpan={3}></th>

            <th className="px-3 py-3 font-semibold text-primary text-xs">Usia</th>
            {isBumil && (
              <th className="px-3 py-3 font-semibold text-primary text-xs">Usia Kandungan (mgg)</th>
            )}
            <th className="px-3 py-3 font-semibold text-primary text-xs">Berat Badan (kg)</th>

            {isBalita && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Kepala (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">LILA (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Nama Ayah</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Nama Ibu</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isBumil && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Perut (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">LILA (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">HPHT</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">HTP</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isLansia && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">GDS (mg/dL)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isPasca && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Suhu Tubuh (°C)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kondisi Ibu</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
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
            let lastDate = ''
            let lastBb = ''
            let lastTd = ''
            let lastTfuTb = ''
            let lastLingkarPerut = ''
            let lastLilaGds = ''
            let lastNamaAyah = ''
            let lastNamaIbu = ''

            if (latestBumil) {
              lastDate = new Date(latestBumil.tanggal_kunjungan).toLocaleDateString('id-ID')
              lastBb = latestBumil.bb?.toString()
              lastTfuTb = latestBumil.tb?.toString()
              lastLingkarPerut = latestBumil.lingkar_perut?.toString()
              lastLilaGds = latestBumil.lingkar_lengan_atas?.toString()
            } else if (latestBalita) {
              lastDate = new Date(latestBalita.tanggal_kunjungan).toLocaleDateString('id-ID')
              lastBb = latestBalita.bb?.toString()
              lastTfuTb = latestBalita.tb?.toString()
              lastLilaGds = latestBalita.lingkar_lengan_atas?.toString()
              lastNamaAyah = latestBalita.nama_ayah || ''
              lastNamaIbu = latestBalita.nama_ibu || ''
            } else if (latestLansia) {
              lastDate = new Date(latestLansia.tanggal_kunjungan).toLocaleDateString('id-ID')
              lastBb = latestLansia.bb?.toString()
              lastTd = `${latestLansia.tekanan_darah_sistolik}/${latestLansia.tekanan_darah_diastolik}`
              lastTfuTb = latestLansia.tb?.toString()
              lastLilaGds = latestLansia.gula_darah_sewaktu?.toString()
            } else if (latestPasca) {
              lastDate = new Date(latestPasca.tanggal_kunjungan).toLocaleDateString('id-ID')
              lastBb = latestPasca.bb?.toString()
              lastTd = `${latestPasca.tekanan_darah_sistolik}/${latestPasca.tekanan_darah_diastolik}`
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
                      placeholder="mgg"
                      width="w-[80px]"
                      disabled={isReadOnly}
                    />
                  </td>
                )}

                {/* BB */}
                <td className="px-3 py-3">
                  <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || 'kg'} width="w-[70px]" disabled={isReadOnly} />
                </td>

                {isBalita && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lingkar_kepala} onChange={(v) => set(warga.id, 'lingkar_kepala', v)} placeholder="cm" width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.nama_ayah} onChange={(v) => set(warga.id, 'nama_ayah', v)} placeholder={lastNamaAyah || 'Ayah...'} width="w-[110px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.nama_ibu} onChange={(v) => set(warga.id, 'nama_ibu', v)} placeholder={lastNamaIbu || 'Ibu...'} width="w-[110px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.keluhan} onChange={(v) => set(warga.id, 'keluhan', v)} placeholder="keluhan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isBumil && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lingkar_perut} onChange={(v) => set(warga.id, 'lingkar_perut', v)} placeholder={lastLingkarPerut || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="date" value={row.hpht} onChange={(v) => set(warga.id, 'hpht', v)} width="w-[140px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="date" value={row.htp} onChange={(v) => set(warga.id, 'htp', v)} width="w-[140px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.keluhan} onChange={(v) => set(warga.id, 'keluhan', v)} placeholder="keluhan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isLansia && (
                  <>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || 'cm'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.td} onChange={(v) => set(warga.id, 'td', v)} placeholder={lastTd || '120/80'} width="w-[90px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || 'mg/dL'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.keluhan} onChange={(v) => set(warga.id, 'keluhan', v)} placeholder="keluhan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
                )}

                {isPasca && (
                  <>
                    <td className="px-3 py-3">
                      <Cell value={row.td} onChange={(v) => set(warga.id, 'td', v)} placeholder={lastTd || '120/80'} width="w-[90px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.suhu_tubuh} onChange={(v) => set(warga.id, 'suhu_tubuh', v)} placeholder={lastTfuTb || '36.5'} width="w-[70px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell value={row.kondisi_ibu} onChange={(v) => set(warga.id, 'kondisi_ibu', v)} placeholder="baik..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="textarea" value={row.keluhan} onChange={(v) => set(warga.id, 'keluhan', v)} placeholder="keluhan..." width="w-[110px]" disabled={isReadOnly} />
                    </td>
                  </>
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
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Tandai Telah Bersalin"
        description="Tandai ibu ini telah bersalin? Data akan dipindah ke Pasca Persalinan."
        confirmText="Ya, Pindahkan"
        onConfirm={async () => {
          if (confirmId) {
            await updateWarga({ id: confirmId, payload: { status_kehamilan: 'PASCA_PERSALINAN' } })
            setConfirmId(null)
          }
        }}
      />
    </>
  )
}
