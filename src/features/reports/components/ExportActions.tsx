import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { exportWargaToPdf } from '../utils/exportPdf'
import { exportWargaToExcel } from '../utils/exportExcel'
import { Warga } from '@/features/warga/services/wargaService'
import { toast } from 'sonner'

interface ExportActionsProps {
  wargaList: Warga[]
  pemeriksaanList?: any[]
  isLoading: boolean
  kategoriFilter: string
  setKategoriFilter: (val: string) => void
}

export function ExportActions({ wargaList, pemeriksaanList = [], isLoading, kategoriFilter, setKategoriFilter }: ExportActionsProps) {
  const getFilteredWarga = () => {
    return wargaList.filter(w => w.kategori.toLowerCase().includes(kategoriFilter.toLowerCase()))
  }

  const handleExportPdf = () => {
    try {
      // Pass the pemeriksaanList to the PDF exporter, along with the category
      exportWargaToPdf(getFilteredWarga(), `Laporan_${kategoriFilter}_${new Date().toISOString().split('T')[0]}.pdf`, pemeriksaanList, kategoriFilter)
      toast.success('Laporan PDF berhasil diunduh.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengekspor PDF.')
    }
  }

  const handleExportExcel = () => {
    try {
      // Pass the pemeriksaanList to the Excel exporter
      exportWargaToExcel(getFilteredWarga(), `Laporan_${kategoriFilter}_${new Date().toISOString().split('T')[0]}.xlsx`, pemeriksaanList, kategoriFilter)
      toast.success('Laporan Excel berhasil diunduh.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengekspor Excel.')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <select 
        value={kategoriFilter}
        onChange={(e) => setKategoriFilter(e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background w-full sm:w-auto"
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
        disabled={isLoading || !wargaList || wargaList.length === 0}
        className="w-full sm:w-auto"
      >
        <FileText className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
      <Button 
        variant="default"
        onClick={handleExportExcel}
        disabled={isLoading || !wargaList || wargaList.length === 0}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Download Excel
      </Button>
    </div>
  )
}
