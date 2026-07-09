import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Warga } from '@/features/warga/services/wargaService'

export function exportWargaToPdf(wargaList: Warga[], filename: string = 'Laporan_Warga.pdf', pemeriksaanList: any[] = [], kategoriFilter: string = '') {
  const usePemeriksaan = pemeriksaanList && pemeriksaanList.length > 0
  const dataToExport = usePemeriksaan ? pemeriksaanList : wargaList

  if (!dataToExport || dataToExport.length === 0) {
    throw new Error('Data laporan kosong.')
  }

  const doc = new jsPDF()

  doc.text(`Laporan Pemeriksaan ${kategoriFilter ? kategoriFilter.replace('_', ' ').toUpperCase() : 'Warga'}`, 14, 15)
  doc.setFontSize(10)
  doc.text(`Tanggal Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22)

  let tableColumn: string[] = []
  const tableRows: any[] = []

  if (!usePemeriksaan) {
    tableColumn = ['No', 'NIK', 'Nama', 'L/P', 'Usia (Thn)', 'Kategori']
    dataToExport.forEach((item, index) => {
      const warga = item as Warga
      const age = new Date().getFullYear() - new Date(warga.tanggal_lahir).getFullYear()
      tableRows.push([index + 1, warga.nik, warga.nama, warga.jenis_kelamin, age, warga.kategori])
    })
  } else {
    switch (kategoriFilter) {
      case 'baduta':
      case 'balita':
        tableColumn = ['No', 'Nama Balita', 'Umur (Bln)', 'BB (kg)', 'TB (cm)', 'Lingkar Kep.', 'Catatan', 'Imunisasi']
        break
      case 'bumil':
        tableColumn = ['No', 'Nama Ibu Hamil', 'Kehamilan (Mgg)', 'BB (kg)', 'TB (cm)', 'LILA (cm)', 'Ling. Perut']
        break
      case 'pasca_persalinan':
        tableColumn = ['No', 'Nama Ibu', 'Tgl Persalinan', 'TD', 'Kondisi Ibu', 'Catatan']
        break
      case 'lansia':
        tableColumn = ['No', 'Nama Lansia', 'Umur (Thn)', 'BB (kg)', 'TD', 'Gula Darah', 'Catatan']
        break
      default:
        tableColumn = ['No', 'Nama Warga']
    }

    dataToExport.forEach((item, index) => {
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

      switch (kategoriFilter) {
        case 'baduta':
        case 'balita':
          tableRows.push([
            index + 1,
            warga.nama || '-',
            ageText,
            item.bb || '-',
            item.tb || '-',
            item.lingkar_kepala || '-',
            item.keluhan || '-',
            (warga.riwayat_imunisasi || []).map((i: any) => i.jenis_vaksin).join(', ') || '-'
          ])
          break
        case 'bumil':
          tableRows.push([
            index + 1,
            warga.nama || '-',
            item.usia_kehamilan_minggu || '-',
            item.bb || '-',
            item.tb || '-',
            item.lingkar_lengan_atas || '-',
            item.lingkar_perut || '-'
          ])
          break
        case 'pasca_persalinan':
          tableRows.push([
            index + 1,
            warga.nama || '-',
            item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-',
            (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
            item.kondisi_ibu || '-',
            item.keluhan || '-'
          ])
          break
        case 'lansia':
          tableRows.push([
            index + 1,
            warga.nama || '-',
            ageText,
            item.bb || '-',
            (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
            item.gula_darah_sewaktu || '-',
            item.keluhan || '-'
          ])
          break
        default:
          tableRows.push([index + 1, warga.nama || '-'])
      }
    })
  }

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [54, 197, 111] }, // Use Primary color #36C56F
  })

  doc.save(filename)
}
