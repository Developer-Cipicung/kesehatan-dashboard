import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { pemeriksaanService } from '../services/pemeriksaanService'
import { toast } from 'sonner'
import ExcelJS from 'exceljs'
import { useAuthStore } from '@/stores/authStore'

interface ImportHealthRecordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: string
  onSuccess?: () => void
}

export function ImportHealthRecordModal({ open, onOpenChange, kategori, onSuccess }: ImportHealthRecordModalProps) {
  const { posyandu } = useAuthStore()
  const currentPosyanduName = posyandu?.nama || ''

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [tanggalKunjungan, setTanggalKunjungan] = useState<string>(new Date().toISOString().split('T')[0])
  const [previewStats, setPreviewStats] = useState<{ total: number; valid: number; errors: string[] } | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = async (uploadedFile: File) => {
    if (!uploadedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Gagal membaca file', { description: 'Pastikan file berformat .xls atau .xlsx' })
      return
    }

    if (!tanggalKunjungan) {
      toast.error('Tanggal kunjungan kosong', { description: 'Pilih tanggal kunjungan terlebih dahulu sebelum unggah file' })
      return
    }

    setFile(uploadedFile)
    setLoading(true)
    setPreviewStats(null)

    try {
      const rows: any[] = []
      const errors: string[] = []
      const warnings: string[] = []

      // Helper for NIK extraction
      const extractNik = (rawNik: string) => {
        let nik = rawNik.replace(/&nbsp;/g, '').replace(/[^0-9]/g, '')
        if (nik.length < 16) {
          nik = nik.padEnd(16, '0') // Pad just in case, similar to warga logic
        } else if (nik.length > 16) {
          nik = nik.substring(0, 16)
        }
        return nik
      }

      const parseFloatSafe = (val: string | null | undefined): number | undefined => {
        if (!val) return undefined
        const parsed = parseFloat(val.replace(',', '.'))
        if (isNaN(parsed)) return undefined
        return parsed
      }

      if (uploadedFile.name.endsWith('.xls')) {
        // Fallback for HTML tables (e-PPGBM)
        const text = await uploadedFile.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const table = doc.querySelector('table')
        
        if (!table) throw new Error('Tidak dapat menemukan tabel data dalam file .xls (pastikan format HTML valid)')
        
        const trs = Array.from(table.querySelectorAll('tr'))
        let headerIdx = -1
        
        // Col indices
        let colNik = -1
        let colBb = -1
        let colTb = -1
        let colLila = -1
        let colLk = -1
        let colTgl = -1
        let colPosyandu = -1
        
        // Find header row and columns
        trs.forEach((tr, idx) => {
          if (headerIdx !== -1) return
          const textContent = tr.textContent?.toLowerCase() || ''
          if (textContent.includes('nik') || textContent.includes('nama')) {
             headerIdx = idx
             const ths = Array.from(tr.querySelectorAll('td, th'))
             ths.forEach((th, colIdx) => {
               const thText = th.textContent?.toLowerCase() || ''
               if (thText === 'nik') colNik = colIdx
               if (thText.includes('berat badan')) colBb = colIdx
               if (thText.includes('tinggi badan') || thText.includes('panjang badan')) colTb = colIdx
               if (thText.includes('lila') || thText.includes('lingkar lengan')) colLila = colIdx
               if (thText.includes('lingkar kepala')) colLk = colIdx
               if (thText.includes('tgl pengukuran') || thText.includes('tanggal pengukuran') || thText.includes('tgl kunjungan') || thText.includes('tanggal kunjungan')) colTgl = colIdx
               if (thText === 'posyandu') colPosyandu = colIdx
             })
          }
        })

        if (headerIdx === -1) throw new Error('Tidak menemukan baris Header (yang mengandung NIK/Nama)')
        if (colNik === -1) throw new Error('Kolom NIK tidak ditemukan di Header')

        trs.forEach((tr, idx) => {
          if (idx <= headerIdx) return
          const tds = Array.from(tr.querySelectorAll('td, th'))
          if (tds.length <= colNik) return

          const rawNik = tds[colNik]?.textContent || ''
          if (!rawNik.trim()) return

          const posyanduCell = colPosyandu !== -1 ? tds[colPosyandu]?.textContent?.trim() : ''
          if (posyanduCell && currentPosyanduName) {
            const cleanExcel = posyanduCell.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            const cleanCurrent = currentPosyanduName.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            if (cleanExcel !== cleanCurrent) {
              throw new Error(`File ini berisi data untuk posyandu ${posyanduCell.toUpperCase()}, sedangkan Anda sedang aktif di posyandu ${currentPosyanduName.toUpperCase()}.`)
            }
          }

          const processedNik = extractNik(rawNik)
          
          if (processedNik.length === 16) {
            let rowDate = tanggalKunjungan
            if (colTgl !== -1) {
              const rawDate = tds[colTgl]?.textContent?.trim()
              if (rawDate) {
                // Try parsing DD-MM-YYYY or YYYY-MM-DD
                const parts = rawDate.split(/[-/]/)
                if (parts.length === 3) {
                  if (parts[0].length === 4) {
                    rowDate = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`
                  } else {
                    rowDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
                  }
                }
              }
            }

            rows.push({
              nik: processedNik, // Will be mapped to warga_id in backend
              tanggal_kunjungan: rowDate, 
              bb: colBb !== -1 ? parseFloatSafe(tds[colBb]?.textContent) : undefined,
              tb: colTb !== -1 ? parseFloatSafe(tds[colTb]?.textContent) : undefined,
              lingkar_lengan_atas: colLila !== -1 ? parseFloatSafe(tds[colLila]?.textContent) : undefined,
              lingkar_kepala: colLk !== -1 ? parseFloatSafe(tds[colLk]?.textContent) : undefined,
              // Backend will set defaults for missing required fields like usia_kehamilan_minggu
            })
          }
        })

      } else {
        // Normal .xlsx parsing using exceljs
        const buffer = await uploadedFile.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)
        
        const worksheet = workbook.worksheets[0]
        if (!worksheet) throw new Error('Worksheet tidak ditemukan')

        let headerRowIdx = -1
        let colNik = -1
        let colBb = -1
        let colTb = -1
        let colLila = -1
        let colLk = -1
        let colTgl = -1
        let colPosyandu = -1
        
        worksheet.eachRow((row, rowNumber) => {
          if (headerRowIdx !== -1) return
          const rowValues = row.values as any[]
          const rowStr = rowValues.join('').toLowerCase()
          if (rowStr.includes('nik') || rowStr.includes('nama')) {
            headerRowIdx = rowNumber
            rowValues.forEach((val, colIdx) => {
               if (!val) return
               const thText = val.toString().toLowerCase()
               if (thText === 'nik') colNik = colIdx
               if (thText.includes('berat badan')) colBb = colIdx
               if (thText.includes('tinggi badan') || thText.includes('panjang badan')) colTb = colIdx
               if (thText.includes('lila') || thText.includes('lingkar lengan')) colLila = colIdx
               if (thText.includes('lingkar kepala')) colLk = colIdx
               if (thText.includes('tgl pengukuran') || thText.includes('tanggal pengukuran') || thText.includes('tgl kunjungan') || thText.includes('tanggal kunjungan')) colTgl = colIdx
               if (thText === 'posyandu') colPosyandu = colIdx
            })
          }
        })

        if (headerRowIdx === -1) throw new Error('Tidak dapat menemukan baris Header (NIK, Nama, dll) di Excel.')
        if (colNik === -1) throw new Error('Kolom NIK tidak ditemukan di Header')

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber <= headerRowIdx) return // Skip header
          
          const rowValues = row.values as any[]
          
          const rawNik = rowValues[colNik] ? rowValues[colNik].toString() : ''
          if (!rawNik) return

          const posyanduCell = colPosyandu !== -1 && rowValues[colPosyandu] ? rowValues[colPosyandu].toString().trim() : ''
          if (posyanduCell && currentPosyanduName) {
            const cleanExcel = posyanduCell.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            const cleanCurrent = currentPosyanduName.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            if (cleanExcel !== cleanCurrent) {
              throw new Error(`File ini berisi data untuk posyandu ${posyanduCell.toUpperCase()}, sedangkan Anda sedang aktif di posyandu ${currentPosyanduName.toUpperCase()}.`)
            }
          }

          const processedNik = extractNik(rawNik)
          
          if (processedNik.length === 16) {
             let rowDate = tanggalKunjungan
             if (colTgl !== -1 && rowValues[colTgl]) {
               const rawDate = rowValues[colTgl].toString().trim()
               if (rawDate) {
                 // Try parsing DD-MM-YYYY or YYYY-MM-DD
                 const parts = rawDate.split(/[-/]/)
                 if (parts.length === 3) {
                   if (parts[0].length === 4) {
                     rowDate = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`
                   } else {
                     rowDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
                   }
                 } else if (!isNaN(Date.parse(rawDate))) {
                   // Fallback for real date objects from exceljs
                   rowDate = new Date(rawDate).toISOString().split('T')[0]
                 }
               }
             }

             rows.push({
              nik: processedNik, 
              tanggal_kunjungan: rowDate,
              bb: colBb !== -1 ? parseFloatSafe(rowValues[colBb]?.toString()) : undefined,
              tb: colTb !== -1 ? parseFloatSafe(rowValues[colTb]?.toString()) : undefined,
              lingkar_lengan_atas: colLila !== -1 ? parseFloatSafe(rowValues[colLila]?.toString()) : undefined,
              lingkar_kepala: colLk !== -1 ? parseFloatSafe(rowValues[colLk]?.toString()) : undefined,
            })
          }
        })
      }

      setParsedData(rows)
      setPreviewStats({
        total: rows.length + errors.length + warnings.length,
        valid: rows.length,
        errors: [...errors, ...warnings].slice(0, 5) // Tampilkan maks 5 pesan error/warning
      })

    } catch (error: any) {
      toast.error('Gagal memproses Excel', { description: error.message })
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setLoading(true)
    try {
      const res = await pemeriksaanService.bulkCreate(kategori, parsedData)
      toast.success('Import Berhasil!', { description: res.message || `${parsedData.length} data pemeriksaan masuk.` })
      if (onSuccess) onSuccess()
      handleClose()
    } catch (error: any) {
      toast.error('Gagal Import Data', { description: error.response?.data?.message || 'Terjadi kesalahan internal. NIK mungkin tidak valid.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewStats(null)
    setParsedData([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> 
            Import Riwayat Kesehatan (e-PPGBM)
          </DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) atau file e-PPGBM (.xls) untuk menambahkan data riwayat periksa bulanan secara massal. NIK digunakan untuk mencocokkan pasien.
          </DialogDescription>
        </DialogHeader>

        {!previewStats ? (
          <div className="py-4 space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kunjungan / Pemeriksaan (Default)</label>
              <Input 
                 type="date" 
                 value={tanggalKunjungan}
                 onChange={(e) => setTanggalKunjungan(e.target.value)}
                 className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Tanggal ini hanya digunakan jika file Excel tidak memiliki kolom "Tanggal Pengukuran" atau "Tanggal Kunjungan".</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleChange}
              />
              
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Klik untuk unggah atau *Drag & Drop*</p>
                  <p className="text-sm text-slate-500 mt-1">Format .xlsx atau .xls didukung.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex shrink-0 items-center justify-center text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{file?.name}</h4>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-emerald-600 font-medium">{previewStats.valid} Data Valid</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-rose-500 font-medium">{previewStats.total - previewStats.valid} Error</span>
                </div>
              </div>
            </div>

            {previewStats.errors.length > 0 && (
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                <div className="flex items-center gap-2 text-rose-700 font-medium mb-2 text-sm">
                  <AlertCircle className="w-4 h-4" /> Beberapa baris memiliki masalah:
                </div>
                <ul className="list-disc list-inside text-xs text-rose-600 space-y-1">
                  {previewStats.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {previewStats.total - previewStats.valid > 5 && (
                    <li className="text-slate-500 list-none italic mt-1">...dan {(previewStats.total - previewStats.valid) - 5} baris lainnya</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>Hanya NIK yang sudah terdaftar di sistem yang akan ditambahkan riwayat pemeriksaannya. NIK yang tidak terdaftar akan dilewati.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewStats(null)}>
                Batal
              </Button>
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleImport}
                disabled={loading || previewStats.valid === 0}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Import {previewStats.valid} Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
