import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react'
import { wargaService } from '../services/wargaService'
import { toast } from 'sonner'
import ExcelJS from 'exceljs'
import { useAuthStore } from '@/stores/authStore'

interface ImportWargaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ImportWargaModal({ open, onOpenChange, onSuccess }: ImportWargaModalProps) {
  const { posyandu } = useAuthStore()
  const currentPosyanduName = posyandu?.nama || ''

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
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

    setFile(uploadedFile)
    setLoading(true)
    setPreviewStats(null)

    try {
      const rows: any[] = []
      const errors: string[] = []
      const warnings: string[] = []
      const usedNiks = new Set<string>()

      // Helper for NIK padding and uniqueness
      const processNik = (rawNik: string, rowNumber: number) => {
        let nik = rawNik.replace(/&nbsp;/g, '').replace(/[^0-9]/g, '')
        if (nik.length < 16) {
          const original = nik
          nik = nik.padEnd(16, '0')
          // Ensure uniqueness within the file
          let counter = 0
          let tempNik = nik
          while (usedNiks.has(tempNik)) {
            counter++
            const counterStr = counter.toString()
            tempNik = nik.slice(0, 16 - counterStr.length) + counterStr
          }
          nik = tempNik
          warnings.push(`Baris ${rowNumber}: NIK "${original}" kurang dari 16 digit, otomatis diubah menjadi ${nik}.`)
        } else if (nik.length > 16) {
          nik = nik.substring(0, 16)
        }
        
        usedNiks.add(nik)
        return nik
      }

      // Helper for Date parsing (API expects YYYY-MM-DD strictly)
      const processDate = (rawTgl: any, rowNumber: number) => {
        if (rawTgl instanceof Date) {
          return rawTgl.toISOString().split('T')[0]
        }
        if (typeof rawTgl === 'string') {
          const parts = rawTgl.trim().split('-')
          if (parts.length === 3) {
            // Check if format is DD-MM-YYYY
            if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`
            // Check if already YYYY-MM-DD
            if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`
          }
        }
        errors.push(`Baris ${rowNumber}: Format Tgl Lahir tidak dikenali (${rawTgl}).`)
        return ''
      }

      if (uploadedFile.name.endsWith('.xls')) {
        // Fallback: This is usually a fake .xls which is actually an HTML table (like e-PPGBM exports)
        const text = await uploadedFile.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const table = doc.querySelector('table')
        
        if (!table) throw new Error('Tidak dapat menemukan tabel data dalam file .xls (pastikan format HTML valid)')
        
        const trs = Array.from(table.querySelectorAll('tr'))
        let headerIdx = -1
        let colNik = -1
        let colNama = -1
        let colJk = -1
        let colTglLahir = -1
        let colNamaOrtu = -1
        let colProv = -1
        let colKab = -1
        let colKec = -1
        let colDesa = -1
        let colPosyandu = -1
        let isBumilFormat = false
        
        // Find header row
        trs.forEach((tr, idx) => {
          if (headerIdx !== -1) return
          const textContent = tr.textContent?.toLowerCase() || ''
          if (textContent.includes('nik') || textContent.includes('nama')) {
            headerIdx = idx
            const ths = Array.from(tr.querySelectorAll('td, th'))
            ths.forEach((th, colIdx) => {
              const thText = th.textContent?.toLowerCase().trim() || ''
              if (thText === 'nik') colNik = colIdx
              if (thText === 'nama' || thText === 'nama anak') colNama = colIdx
              if (thText === 'jk' || thText === 'jenis kelamin') colJk = colIdx
              if (thText === 'tgl lahir' || thText === 'tanggal lahir') colTglLahir = colIdx
              if (thText === 'nama ortu' || thText === 'nama orangtua' || thText === 'nama ibu' || thText === 'nama suami') {
                colNamaOrtu = colIdx
                if (thText === 'nama suami') isBumilFormat = true
              }
              if (thText === 'prov' || thText === 'provinsi') colProv = colIdx
              if (thText === 'kab/kota' || thText === 'kabupaten/kota') colKab = colIdx
              if (thText === 'kec' || thText === 'kecamatan') colKec = colIdx
              if (thText === 'desa/kel' || thText === 'desa/kelurahan') colDesa = colIdx
              if (thText === 'posyandu') colPosyandu = colIdx
            })
          }
        })

        if (headerIdx === -1) throw new Error('Tidak menemukan Header (NIK/Nama)')

        trs.forEach((tr, idx) => {
          if (idx <= headerIdx) return
          const tds = Array.from(tr.querySelectorAll('td, th'))
          if (tds.length < 5) return

          const rawNik = colNik !== -1 ? (tds[colNik]?.textContent || '') : (tds[1]?.textContent || '')
          const rawNama = colNama !== -1 ? (tds[colNama]?.textContent?.trim() || '') : (tds[2]?.textContent?.trim() || '')
          const rawJk = colJk !== -1 ? (tds[colJk]?.textContent?.trim().toUpperCase() || '') : ''
          
          if (!rawNik && !rawNama) return

          const processedNik = processNik(rawNik, idx)
          if (!rawNama) errors.push(`Baris ${idx}: Nama kosong.`)

          let jk: 'L'|'P' = 'L'
          if (rawJk) {
            if (rawJk === 'P' || rawJk === 'PEREMPUAN') jk = 'P'
            else if (rawJk === 'L' || rawJk === 'LAKI-LAKI' || rawJk === 'LAKI') jk = 'L'
            else errors.push(`Baris ${idx}: Jenis Kelamin tidak valid (${rawJk}).`)
          } else {
            // Jika kolom JK tidak ada, tapi ada kolom nama suami / bumil format
            // Asumsikan perempuan
            jk = 'P'
          }

          const tglLahirStr = colTglLahir !== -1 ? processDate(tds[colTglLahir]?.textContent?.trim(), idx) : ''

          const namaOrtu = colNamaOrtu !== -1 ? tds[colNamaOrtu]?.textContent?.trim() || '' : ''
          const prov = colProv !== -1 ? tds[colProv]?.textContent?.trim() || '' : ''
          const kab = colKab !== -1 ? tds[colKab]?.textContent?.trim() || '' : ''
          const kec = colKec !== -1 ? tds[colKec]?.textContent?.trim() || '' : ''
          const desa = colDesa !== -1 ? tds[colDesa]?.textContent?.trim() || '' : ''
          const posyanduCell = colPosyandu !== -1 ? tds[colPosyandu]?.textContent?.trim() || '' : ''

          if (posyanduCell && currentPosyanduName) {
            const cleanExcel = posyanduCell.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            const cleanCurrent = currentPosyanduName.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            if (cleanExcel !== cleanCurrent) {
              throw new Error(`File ini berisi data untuk posyandu ${posyanduCell.toUpperCase()}, sedangkan Anda sedang aktif di posyandu ${currentPosyanduName.toUpperCase()}.`)
            }
          }

          const alamat = [posyanduCell, desa, kec, kab, prov].filter(Boolean).join(', ')

          if (processedNik.length === 16 && rawNama && tglLahirStr) {
            rows.push({
              nik: processedNik,
              nomor: processedNik,
              nama: rawNama,
              jenis_kelamin: jk,
              tanggal_lahir: tglLahirStr,
              nama_ibu: namaOrtu,
              alamat: alamat,
              status_kehamilan: isBumilFormat ? 'HAMIL' : 'TIDAK_HAMIL',
              kategori: 'warga'
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
        let colNama = -1
        let colJk = -1
        let colTglLahir = -1
        let colNamaOrtu = -1
        let colProv = -1
        let colKab = -1
        let colKec = -1
        let colDesa = -1
        let colPosyandu = -1
        let isBumilFormat = false
        
        worksheet.eachRow((row, rowNumber) => {
          if (headerRowIdx !== -1) return
          const rowValues = row.values as any[]
          const rowStr = rowValues.join('').toLowerCase()
          if (rowStr.includes('nik') || rowStr.includes('nama')) {
            headerRowIdx = rowNumber
            rowValues.forEach((val, colIdx) => {
              if (!val) return
              const thText = val.toString().toLowerCase().trim()
              if (thText === 'nik') colNik = colIdx
              if (thText === 'nama' || thText === 'nama anak') colNama = colIdx
              if (thText === 'jk' || thText === 'jenis kelamin') colJk = colIdx
              if (thText === 'tgl lahir' || thText === 'tanggal lahir') colTglLahir = colIdx
              if (thText === 'nama ortu' || thText === 'nama orangtua' || thText === 'nama ibu' || thText === 'nama suami') {
                colNamaOrtu = colIdx
                if (thText === 'nama suami') isBumilFormat = true
              }
              if (thText === 'prov' || thText === 'provinsi') colProv = colIdx
              if (thText === 'kab/kota' || thText === 'kabupaten/kota') colKab = colIdx
              if (thText === 'kec' || thText === 'kecamatan') colKec = colIdx
              if (thText === 'desa/kel' || thText === 'desa/kelurahan') colDesa = colIdx
              if (thText === 'posyandu') colPosyandu = colIdx
            })
          }
        })

        if (headerRowIdx === -1) throw new Error('Tidak dapat menemukan baris Header (NIK, Nama, dll) di Excel.')

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber <= headerRowIdx) return // Skip header
          
          const rowValues = row.values as any[]
          
          const rawNik = colNik !== -1 && rowValues[colNik] ? rowValues[colNik].toString() : ''
          const rawNama = colNama !== -1 && rowValues[colNama] ? rowValues[colNama].toString().trim() : ''
          const rawJk = colJk !== -1 && rowValues[colJk] ? rowValues[colJk].toString().trim().toUpperCase() : ''
          
          if (!rawNik && !rawNama) return

          const processedNik = processNik(rawNik, rowNumber)
          if (!rawNama) errors.push(`Baris ${rowNumber}: Nama kosong.`)

          let jk: 'L'|'P' = 'L'
          if (rawJk) {
            if (rawJk === 'P' || rawJk === 'PEREMPUAN') jk = 'P'
            else if (rawJk === 'L' || rawJk === 'LAKI-LAKI' || rawJk === 'LAKI') jk = 'L'
            else errors.push(`Baris ${rowNumber}: Jenis Kelamin tidak valid (${rawJk}).`)
          } else {
            jk = 'P'
          }

          const tglLahirStr = colTglLahir !== -1 ? processDate(rowValues[colTglLahir], rowNumber) : ''

          const namaOrtu = colNamaOrtu !== -1 && rowValues[colNamaOrtu] ? rowValues[colNamaOrtu].toString().trim() : ''
          const prov = colProv !== -1 && rowValues[colProv] ? rowValues[colProv].toString().trim() : ''
          const kab = colKab !== -1 && rowValues[colKab] ? rowValues[colKab].toString().trim() : ''
          const kec = colKec !== -1 && rowValues[colKec] ? rowValues[colKec].toString().trim() : ''
          const desa = colDesa !== -1 && rowValues[colDesa] ? rowValues[colDesa].toString().trim() : ''
          const posyanduStr = colPosyandu !== -1 && rowValues[colPosyandu] ? rowValues[colPosyandu].toString().trim() : ''

          if (posyanduStr && currentPosyanduName) {
            const cleanExcel = posyanduStr.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            const cleanCurrent = currentPosyanduName.toLowerCase().replace(/posyandu/g, '').replace(/[aeiou\s]/g, '')
            if (cleanExcel !== cleanCurrent) {
              throw new Error(`File ini berisi data untuk posyandu ${posyanduStr.toUpperCase()}, sedangkan Anda sedang aktif di posyandu ${currentPosyanduName.toUpperCase()}.`)
            }
          }

          const alamat = [posyanduStr, desa, kec, kab, prov].filter(Boolean).join(', ')

          if (processedNik.length === 16 && rawNama && tglLahirStr) {
            rows.push({
              nik: processedNik,
              nomor: processedNik,
              nama: rawNama,
              jenis_kelamin: jk,
              tanggal_lahir: tglLahirStr,
              nama_ibu: namaOrtu,
              alamat: alamat,
              status_kehamilan: isBumilFormat ? 'HAMIL' : 'TIDAK_HAMIL',
              kategori: 'warga'
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
      const res = await wargaService.addWargaBulk(parsedData)
      toast.success('Import Berhasil!', { description: res.message || `${parsedData.length} data berhasil masuk.` })
      if (onSuccess) onSuccess()
      handleClose()
    } catch (error: any) {
      toast.error('Gagal Import Data', { description: error.response?.data?.message || 'Terjadi kesalahan internal.' })
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

  const downloadTemplate = () => {
    // Generate simple excel template
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Template Warga')
    ws.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'JK (L/P)', key: 'jk', width: 10 },
      { header: 'Tgl Lahir (DD-MM-YYYY)', key: 'tgllahir', width: 22 },
      { header: 'Nama Ortu', key: 'ortu', width: 20 },
      { header: 'Provinsi', key: 'prov', width: 15 },
      { header: 'Kab/Kota', key: 'kab', width: 15 },
      { header: 'Kecamatan', key: 'kec', width: 15 },
      { header: 'Puskesmas', key: 'puskesmas', width: 15 },
      { header: 'Desa/Kel', key: 'desa', width: 15 },
      { header: 'Posyandu', key: 'posyandu', width: 15 },
    ]
    ws.addRow([1, '3201234567890123', 'John Doe', 'L', '20-04-2023', 'Jane Doe', 'Jawa Barat', 'Kab. Bogor', 'Cijeruk', 'Cijeruk', 'Cipicung', 'Melati 2'])
    
    // Style header
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }

    wb.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Template_Import_Warga.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> 
            Import Warga (Excel)
          </DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) atau file e-PPGBM (.xls) untuk menambahkan data warga secara massal. Pastikan format kolom NIK, Nama, JK, dan Tanggal Lahir sesuai.
          </DialogDescription>
        </DialogHeader>

        {!previewStats ? (
          <div className="py-4">
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

            <div className="mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-sm text-slate-600">Belum punya format Excel yang benar?</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 text-xs">
                <Download className="w-3 h-3" /> Template
              </Button>
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
               <p>Data dengan NIK yang sudah ada di sistem akan otomatis dilewati (di-skip) agar tidak terjadi duplikasi.</p>
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
