import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Warga } from '@/features/warga/services/wargaService'

export function exportWargaToPdf(wargaList: Warga[], filename: string = 'Laporan_Warga.pdf', pemeriksaanList: any[] = [], kategoriFilter: string = '') {
  const usePemeriksaan = pemeriksaanList && pemeriksaanList.length > 0
  const dataToExport = usePemeriksaan ? pemeriksaanList : wargaList

  if (!dataToExport || dataToExport.length === 0) {
    throw new Error('Data laporan kosong.')
  }

  const doc = new jsPDF('landscape')

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
    const commonCols = ['NIK', 'No. HP', 'Tempat/Tgl Lahir', 'Alamat', 'L/P']

    switch (kategoriFilter) {
      case 'baduta':
      case 'balita':
        tableColumn = ['No', 'Tgl & Jam', 'Nama Balita', ...commonCols, 'Umur', 'Ibu', 'KB', 'BB', 'TB', 'LK', 'Kondisi', 'ASI', 'Bansos', 'Catatan', 'Imunisasi']
        break
      case 'bumil':
        tableColumn = ['No', 'Tgl & Jam', 'Nama Ibu Hamil', ...commonCols, 'Hamil(Mgg)', 'BB', 'TB', 'LILA', 'LP', 'Anak Ke', 'Hb', 'Janin', 'Rokok', 'KIE', 'TTD']
        break
      case 'pasca_persalinan':
        tableColumn = ['No', 'Tgl & Jam', 'Nama Ibu', ...commonCols, 'Tmpt Salin', 'Tgl Salin', 'TD', 'Kondisi', 'TB Bayi', 'BB Bayi', 'KIE', 'Rujukan', 'Bansos', 'Catatan']
        break
      case 'lansia':
        tableColumn = ['No', 'Tgl & Jam', 'Nama Lansia', ...commonCols, 'Umur', 'BB', 'TD', 'GDS', 'Catatan']
        break
      default:
        tableColumn = ['No', 'Tgl & Jam', 'Nama Warga', ...commonCols]
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

      const visitDate = item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'
      const visitTime = item.created_at ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
      const tglJamKunjungan = `${visitDate} ${visitTime}`

      const commonRow = [
        warga.nik || '-',
        warga.nomor || '-',
        `${warga.tempat_lahir || '-'}, ${warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}`,
        warga.alamat || '-',
        warga.jenis_kelamin === 'L' ? 'L' : 'P'
      ]

      switch (kategoriFilter) {
        case 'baduta':
        case 'balita':
          const namaIbu = item.nama_ibu || '-'
          tableRows.push([
            index + 1,
            tglJamKunjungan,
            warga.nama || '-',
            ...commonRow,
            ageText,
            namaIbu,
            warga.penggunaan_kontrasepsi || '-',
            item.bb || '-',
            item.tb || '-',
            item.lingkar_kepala || '-',
            item.kondisi || '-',
            item.asi_eksklusif ? 'Y' : 'T',
            item.fasilitasi_bantuan_sosial ? 'Y' : 'T',
            item.catatan || '-',
            (warga.riwayat_imunisasi || []).map((i: any) => i.jenis_vaksin).join(', ') || '-'
          ])
          break
        case 'bumil':
          tableRows.push([
            index + 1,
            tglJamKunjungan,
            warga.nama || '-',
            ...commonRow,
            item.usia_kehamilan_minggu || '-',
            item.bb || '-',
            item.tb || '-',
            item.lingkar_lengan_atas || '-',
            item.lingkar_perut || '-',
            item.jumlah_anak || '-',
            item.kadar_hemoglobin || '-',
            item.berat_janin || '-',
            item.terpapar_rokok ? 'Y' : 'T',
            item.kie ? 'Y' : 'T',
            item.suplemen_tambah_darah ? 'Y' : 'T'
          ])
          break
        case 'pasca_persalinan':
          tableRows.push([
            index + 1,
            tglJamKunjungan,
            warga.nama || '-',
            ...commonRow,
            warga.tempat_persalinan || '-',
            item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-',
            (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
            item.kondisi_ibu || '-',
            item.tinggi_badan_bayi || '-',
            item.berat_badan_bayi || '-',
            item.kie ? 'Y' : 'T',
            item.fasilitasi_rujukan ? 'Y' : 'T',
            item.fasilitasi_bantuan_sosial ? 'Y' : 'T',
            item.catatan || '-'
          ])
          break
        case 'lansia':
          tableRows.push([
            index + 1,
            tglJamKunjungan,
            warga.nama || '-',
            ...commonRow,
            ageText,
            item.bb || '-',
            (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
            item.gula_darah_sewaktu || '-',
            item.catatan || '-'
          ])
          break
        default:
          tableRows.push([index + 1, tglJamKunjungan, warga.nama || '-', ...commonRow])
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
