import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Warga } from '@/features/warga/services/wargaService'

export function exportWargaToPdf(wargaList: Warga[], filename: string = 'Laporan_Warga.pdf') {
  if (!wargaList || wargaList.length === 0) {
    throw new Error('Data warga kosong.')
  }

  const doc = new jsPDF()

  doc.text('Laporan Data Pasien Posyandu', 14, 15)
  doc.setFontSize(10)
  doc.text(`Tanggal Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22)

  const tableColumn = ['No', 'NIK', 'Nama', 'L/P', 'Usia (Thn)', 'Kategori']
  const tableRows: any[] = []

  wargaList.forEach((warga, index) => {
    const age = new Date().getFullYear() - new Date(warga.tanggal_lahir).getFullYear()
    
    const rowData = [
      index + 1,
      warga.nik,
      warga.nama,
      warga.jenis_kelamin,
      age,
      warga.kategori,
    ]
    tableRows.push(rowData)
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [54, 197, 111] }, // Use Primary color #36C56F
  })

  doc.save(filename)
}
