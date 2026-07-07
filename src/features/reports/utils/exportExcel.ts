import * as XLSX from 'xlsx'
import { Warga } from '@/features/warga/services/wargaService'

export function exportWargaToExcel(wargaList: Warga[], filename: string = 'Laporan_Warga.xlsx') {
  if (!wargaList || wargaList.length === 0) {
    throw new Error('Data warga kosong.')
  }

  // Format data for Excel
  const formattedData = wargaList.map((warga, index) => ({
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
  }))

  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pasien')

  // Export
  XLSX.writeFile(workbook, filename)
}
