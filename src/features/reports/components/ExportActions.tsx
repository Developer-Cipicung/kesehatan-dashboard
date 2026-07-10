import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { exportWargaToPdf } from '../utils/exportPdf'
import { exportWargaToExcel } from '../utils/exportExcel'
import { wargaService } from '@/features/warga/services/wargaService'
import { pemeriksaanService } from '@/features/pemeriksaan/services/pemeriksaanService'
import { toast } from 'sonner'
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age'

interface ExportActionsProps {
  isLoading: boolean
  kategoriFilter: string
  posyanduIdParam?: string
  bulan: number
  tahun: number
  setKategoriFilter: (val: string) => void
}

export function ExportActions({ isLoading, kategoriFilter, posyanduIdParam, bulan, tahun, setKategoriFilter }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const fetchChunkedData = async () => {
    let allWarga: any[] = [];
    let allPemeriksaan: any[] = [];
    
    let page = 1;
    let hasMore = true;
    const limit = 500;
    
    // Fetch Warga
    while (hasMore) {
      const data = await wargaService.getWargaList({ kategori: kategoriFilter, posyanduId: posyanduIdParam, limit, page });
      allWarga = [...allWarga, ...data.data];
      if (!data.metadata || page >= data.metadata.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    // Fetch Pemeriksaan
    page = 1;
    hasMore = true;
    while (hasMore) {
      const data = await pemeriksaanService.getAll(kategoriFilter, { bulan, tahun, posyanduId: posyanduIdParam, limit, page });
      allPemeriksaan = [...allPemeriksaan, ...data.data];
      if (!data.metadata || page >= data.metadata.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    // Client-side filtering if baduta vs balita
    let filteredPemeriksaan = allPemeriksaan;
    if (kategoriFilter === 'baduta' || kategoriFilter === 'balita') {
      filteredPemeriksaan = allPemeriksaan.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        if (kategoriFilter === 'baduta') return isBadutaByBirthDate(item.warga.tanggal_lahir, tglKunjungan);
        return isBalitaByBirthDate(item.warga.tanggal_lahir, tglKunjungan);
      })
    }
    
    return { allWarga, filteredPemeriksaan };
  }

  const handleExportPdf = async () => {
    try {
      setIsExporting(true)
      const { allWarga, filteredPemeriksaan } = await fetchChunkedData()
      exportWargaToPdf(allWarga, `Laporan_${kategoriFilter}_${new Date().toISOString().split('T')[0]}.pdf`, filteredPemeriksaan, kategoriFilter)
      toast.success('Laporan PDF berhasil diunduh.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengekspor PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const { allWarga, filteredPemeriksaan } = await fetchChunkedData()
      await exportWargaToExcel(allWarga, `Laporan_${kategoriFilter}_${new Date().toISOString().split('T')[0]}.xlsx`, filteredPemeriksaan, kategoriFilter)
      toast.success('Laporan Excel berhasil diunduh.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengekspor Excel.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <select 
        value={kategoriFilter}
        onChange={(e) => setKategoriFilter(e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background w-full sm:w-auto"
        disabled={isExporting}
      >
        <option value="baduta">Baduta</option>
        <option value="balita">Balita</option>
        <option value="bumil">Ibu Hamil</option>
        <option value="pasca_persalinan">Ibu Pasca Persalinan</option>
        <option value="lansia">Lansia</option>
      </select>
      <Button 
        variant="outline" 
        onClick={handleExportPdf}
        disabled={isLoading || isExporting}
        className="w-full sm:w-auto"
      >
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
        {isExporting ? 'Memproses...' : 'Download PDF'}
      </Button>
      <Button 
        variant="default"
        onClick={handleExportExcel}
        disabled={isLoading || isExporting}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
      >
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
        {isExporting ? 'Memproses...' : 'Download Excel'}
      </Button>
    </div>
  )
}
