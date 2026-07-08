import * as XLSX from 'xlsx'
import { Warga } from '@/features/warga/services/wargaService'

export function exportWargaToExcel(wargaList: Warga[], filename: string = 'Laporan_Warga.xlsx', pemeriksaanList: any[] = [], kategoriFilter: string = '') {
  // Use pemeriksaanList if provided, otherwise fallback to wargaList
  const usePemeriksaan = pemeriksaanList && pemeriksaanList.length > 0
  
  const dataToExport = usePemeriksaan ? pemeriksaanList : wargaList

  if (!dataToExport || dataToExport.length === 0) {
    throw new Error('Data laporan kosong.')
  }

  // Format data for Excel dynamically based on category
  const formattedData = dataToExport.map((item, index) => {
    if (!usePemeriksaan) {
      // Basic Warga Export
      const warga = item as Warga
      return {
        No: index + 1,
        NIK: warga.nik,
        'No KK': warga.no_kk,
        Nama: warga.nama,
        'Jenis Kelamin': warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': warga.tempat_lahir,
        'Tanggal Lahir': new Date(warga.tanggal_lahir).toLocaleDateString('id-ID'),
        Alamat: `${warga.alamat} RT ${warga.rt} RW ${warga.rw}`,
        Kategori: warga.kategori,
        'Status Pernikahan': warga.status_pernikahan,
      }
    }

    const warga = item.warga || {}
    let ageText = '-'
    if (warga.tanggal_lahir) {
      if (kategoriFilter === 'baduta' || kategoriFilter === 'balita') {
        const ageMonths = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    const baseData = {
      No: index + 1,
      Nama: warga.nama || '-',
    }

    switch (kategoriFilter) {
      case 'baduta':
      case 'balita':
        return {
          ...baseData,
          'Umur (Bulan)': ageText,
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'Lingkar Kepala (cm)': item.lingkar_kepala || '-',
          'Status Gizi': item.status_gizi || '-',
        }
      case 'bumil':
        return {
          ...baseData,
          'Usia Kehamilan (Minggu)': item.usia_kehamilan_minggu || '-',
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'LILA (cm)': item.lingkar_lengan_atas || '-',
          'Lingkar Perut (cm)': item.lingkar_perut || '-',
        }
      case 'pasca_persalinan':
        return {
          ...baseData,
          'Tanggal Persalinan': item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Kondisi Ibu': item.kondisi_ibu || '-',
          'Keluhan': item.keluhan || '-',
        }
      case 'lansia':
        return {
          ...baseData,
          'Umur (Tahun)': ageText,
          'Berat Badan (kg)': item.bb || '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Gula Darah (mg/dL)': item.gula_darah_sewaktu || '-',
          'Keluhan': item.keluhan || '-',
        }
      default:
        return { ...baseData, Data: 'N/A' }
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Laporan')

  // Export
  XLSX.writeFile(workbook, filename)
}
