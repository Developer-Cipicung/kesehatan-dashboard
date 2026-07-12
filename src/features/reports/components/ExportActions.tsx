import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
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
}

export function ExportActions({ isLoading, kategoriFilter, posyanduIdParam, bulan, tahun }: ExportActionsProps) {
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
