import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { formatTimeWib } from '@/utils/dateTime'
import type { ReportImmunisasi, ReportPemeriksaanItem } from '../types/reportPemeriksaan'

interface MonthlyReportTableProps {
  kategori: string
  data: ReportPemeriksaanItem[]
  isLoading: boolean
}

export function MonthlyReportTable({ kategori, data, isLoading }: MonthlyReportTableProps) {
  if (isLoading) {
    return <SkeletonCard />
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 border rounded-md bg-slate-50">
        <p>Belum ada data pemeriksaan untuk kategori ini pada bulan ini.</p>
      </div>
    )
  }

  const renderHeaders = () => {
    const commonDemographicsHeaders = (
      <>
        <TableHead>NIK</TableHead>
        <TableHead>No. HP</TableHead>
        <TableHead>Tempat, Tgl Lahir</TableHead>
        <TableHead>Alamat</TableHead>
        <TableHead>Jenis Kelamin</TableHead>
      </>
    )

    const visitHeader = <TableHead>Tgl & Jam Kunjungan</TableHead>

    switch (kategori) {
      case 'baduta':
      case 'balita':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Balita</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Umur (Bulan)</TableHead>
            <TableHead>Nama Ibu</TableHead>
            <TableHead>Kontrasepsi Ibu</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>Lingkar Kepala (cm)</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>ASI Eksklusif</TableHead>
            <TableHead>Bansos</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Imunisasi</TableHead>
          </>
        )
      case 'bumil':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Ibu Hamil</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Usia Kehamilan (Minggu)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>LILA (cm)</TableHead>
            <TableHead>Lingkar Perut (cm)</TableHead>
            <TableHead>Anak Ke-</TableHead>
            <TableHead>Kadar Hb</TableHead>
            <TableHead>Berat Janin</TableHead>
            <TableHead>Rokok</TableHead>
            <TableHead>KIE</TableHead>
            <TableHead>TTD</TableHead>
          </>
        )
      case 'pasca_persalinan':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Ibu</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Tempat Persalinan</TableHead>
            <TableHead>Tanggal Persalinan</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Kondisi Ibu</TableHead>
            <TableHead>Tinggi Bayi</TableHead>
            <TableHead>Berat Bayi</TableHead>
            <TableHead>KIE</TableHead>
            <TableHead>Rujukan</TableHead>
            <TableHead>Bansos</TableHead>
            <TableHead>Catatan</TableHead>
          </>
        )
      case 'lansia':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Lansia</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Umur (Tahun)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Gula Darah (mg/dL)</TableHead>
            <TableHead>Catatan</TableHead>
          </>
        )
      default:
        return (
          <>
            {visitHeader}
            <TableHead>Nama Warga</TableHead>
          </>
        )
    }
  }

  const renderCells = (item: ReportPemeriksaanItem) => {
    const warga = item.warga || {}
    
    // Calculate Age
    let ageText = '-'
    if (warga.tanggal_lahir && item.tanggal_kunjungan) {
      if (kategori === 'baduta' || kategori === 'balita') {
        const ageMonths = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    const visitDate = item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'
    const visitTime = formatTimeWib(item.created_at)
    const tglJamKunjungan = `${visitDate} ${visitTime}`

    const commonDemographicsCells = (
      <>
        <TableCell>{warga.nik || '-'}</TableCell>
        <TableCell>{warga.nomor || '-'}</TableCell>
        <TableCell>{`${warga.tempat_lahir || '-'}, ${warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}`}</TableCell>
        <TableCell>{warga.alamat || '-'}</TableCell>
        <TableCell>{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
      </>
    )

    const visitCell = <TableCell>{tglJamKunjungan}</TableCell>

    switch (kategori) {
      case 'baduta':
      case 'balita': {
        const namaIbu = item.nama_ibu || '-'
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{ageText}</TableCell>
            <TableCell>{namaIbu}</TableCell>
            <TableCell>{warga.penggunaan_kontrasepsi || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.lingkar_kepala || '-'}</TableCell>
            <TableCell>{item.kondisi || '-'}</TableCell>
            <TableCell>{item.asi_eksklusif ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
            <TableCell>{(warga.riwayat_imunisasi || []).map((i: ReportImmunisasi) => i.jenis_vaksin).join(', ') || '-'}</TableCell>
          </>
        )
      }
      case 'bumil':
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{item.usia_kehamilan_minggu || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.lingkar_lengan_atas || '-'}</TableCell>
            <TableCell>{item.lingkar_perut || '-'}</TableCell>
            <TableCell>{item.jumlah_anak || '-'}</TableCell>
            <TableCell>{item.kadar_hemoglobin || '-'}</TableCell>
            <TableCell>{item.berat_janin || '-'}</TableCell>
            <TableCell>{item.terpapar_rokok ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.kie ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.suplemen_tambah_darah ? 'Ya' : 'Tidak'}</TableCell>
          </>
        )
      case 'pasca_persalinan':
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{warga.tempat_persalinan || '-'}</TableCell>
            <TableCell>{item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{item.kondisi_ibu || '-'}</TableCell>
            <TableCell>{item.tinggi_badan_bayi || '-'}</TableCell>
            <TableCell>{item.berat_badan_bayi || '-'}</TableCell>
            <TableCell>{item.kie ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_rujukan ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
          </>
        )
      case 'lansia':
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{ageText}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{item.gula_darah_sewaktu || '-'}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
          </>
        )
      default:
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
          </>
        )
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            {renderHeaders()}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow key={item.id}>
              <TableCell>{idx + 1}</TableCell>
              {renderCells(item)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
