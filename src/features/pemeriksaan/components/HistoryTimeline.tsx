import { Pemeriksaan } from '../services/pemeriksaanService'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

interface HistoryTimelineProps {
  history: Pemeriksaan[]
  kategori: string
  isLocked: boolean
  onEdit: (record: Pemeriksaan) => void
  onDelete: (id: string) => void
}

export function HistoryTimeline({ history, kategori, isLocked, onEdit, onDelete }: HistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-lg bg-card">
        Belum ada riwayat pemeriksaan.
      </div>
    )
  }

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">Tanggal Kunjungan</th>
            
            {/* Dynamic Headers */}
            {isBumil && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Usia Kandungan</th>}
            
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">BB{(!isPasca) && ' / TB'}</th>
            
            {(isBalita || isBumil) && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Lingkar</th>}
            
            {isBumil && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">HPHT / HTP</th>}
            
            {(isLansia || isPasca) && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Tensi</th>}
            {isLansia && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">GDS</th>}
            {isPasca && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Suhu & Kondisi</th>}

            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Catatan</th>
            {!isLocked && (
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((record: any) => {
            const dateRaw = record.tanggal_kunjungan || record.tanggal_pemeriksaan || record.created_at
            const date = dateRaw ? new Date(dateRaw).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : 'Tanggal Tidak Diketahui'

            const bb = record.bb || record.berat_badan
            const tb = record.tb || record.tinggi_badan
            const lk = record.lingkar_kepala
            const lp = record.lingkar_perut
            const lila = record.lingkar_lengan_atas || record.lingkar_lengan
            const td = (record.tekanan_darah_sistolik && record.tekanan_darah_diastolik) 
              ? `${record.tekanan_darah_sistolik}/${record.tekanan_darah_diastolik} mmHg` 
              : (record.tekanan_darah || '-')

            const renderHphtHtp = () => {
              const parseDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-'
              return (
                <div className="text-xs">
                  <div><span className="text-muted-foreground">HPHT:</span> {parseDate(record.hpht)}</div>
                  <div className="mt-0.5"><span className="text-muted-foreground">HTP:</span> {parseDate(record.htp)}</div>
                </div>
              )
            }

            return (
              <tr key={record.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{date}</td>
                
                {isBumil && (
                  <td className="px-4 py-3 text-slate-600">
                    {record.usia_kehamilan_minggu !== undefined ? `${record.usia_kehamilan_minggu} Minggu` : '-'}
                  </td>
                )}
                
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {bb !== undefined && bb !== null ? `${bb} kg` : '-'}
                  {(!isPasca && tb !== undefined && tb !== null) ? ` / ${tb} cm` : ''}
                </td>
                
                {(isBalita || isBumil) && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {lk !== undefined && lk !== null && <div className="text-xs"><span className="text-muted-foreground">Kepala:</span> {lk} cm</div>}
                    {lp !== undefined && lp !== null && <div className="text-xs"><span className="text-muted-foreground">Perut:</span> {lp} cm</div>}
                    {lila !== undefined && lila !== null && <div className="text-xs"><span className="text-muted-foreground">LiLA:</span> {lila} cm</div>}
                    {(lk === undefined && lp === undefined && lila === undefined) && '-'}
                  </td>
                )}
                
                {isBumil && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {renderHphtHtp()}
                  </td>
                )}

                {(isLansia || isPasca) && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {td}
                  </td>
                )}

                {isLansia && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {record.gula_darah_sewaktu !== undefined && record.gula_darah_sewaktu !== null ? `${record.gula_darah_sewaktu} mg/dL` : '-'}
                  </td>
                )}

                {isPasca && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {record.suhu_tubuh !== undefined && record.suhu_tubuh !== null && <div className="text-xs"><span className="text-muted-foreground">Suhu:</span> {record.suhu_tubuh}°C</div>}
                    {record.kondisi_ibu && <div className="text-xs mt-0.5"><span className="text-muted-foreground">Kondisi:</span> {record.kondisi_ibu}</div>}
                    {(record.suhu_tubuh === undefined && !record.kondisi_ibu) && '-'}
                  </td>
                )}

                <td className="px-4 py-3 text-slate-600 max-w-[200px]">
                  {record.catatan
                    ? <span className="text-xs">{record.catatan}</span>
                    : <span className="text-slate-300">-</span>
                  }
                </td>
                
                {!isLocked && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(record)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
