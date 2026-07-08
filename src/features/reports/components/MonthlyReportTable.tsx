import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'

interface MonthlyReportTableProps {
  kategori: string
  data: any[]
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

  // Define columns dynamically based on category
  const renderHeaders = () => {
    switch (kategori) {
      case 'baduta':
      case 'balita':
        return (
          <>
            <TableHead>Nama Balita</TableHead>
            <TableHead>Umur (Bulan)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>Lingkar Kepala (cm)</TableHead>
            <TableHead>Status Gizi</TableHead>
          </>
        )
      case 'bumil':
        return (
          <>
            <TableHead>Nama Ibu Hamil</TableHead>
            <TableHead>Usia Kehamilan (Minggu)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>LILA (cm)</TableHead>
            <TableHead>Lingkar Perut (cm)</TableHead>
          </>
        )
      case 'pasca_persalinan':
        return (
          <>
            <TableHead>Nama Ibu</TableHead>
            <TableHead>Tanggal Persalinan</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Kondisi Ibu</TableHead>
            <TableHead>Keluhan</TableHead>
          </>
        )
      case 'lansia':
        return (
          <>
            <TableHead>Nama Lansia</TableHead>
            <TableHead>Umur (Tahun)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Gula Darah (mg/dL)</TableHead>
            <TableHead>Keluhan</TableHead>
          </>
        )
      default:
        return <TableHead>Nama Warga</TableHead>
    }
  }

  const renderCells = (item: any) => {
    const warga = item.warga || {}
    
    // Calculate Age
    let ageText = '-'
    if (warga.tanggal_lahir) {
      if (kategori === 'baduta' || kategori === 'balita') {
        const ageMonths = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    switch (kategori) {
      case 'baduta':
      case 'balita':
        return (
          <>
            <TableCell className="font-medium">{warga.nama}</TableCell>
            <TableCell>{ageText}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.lingkar_kepala || '-'}</TableCell>
            <TableCell>{item.status_gizi || '-'}</TableCell>
          </>
        )
      case 'bumil':
        return (
          <>
            <TableCell className="font-medium">{warga.nama}</TableCell>
            <TableCell>{item.usia_kehamilan_minggu || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.lingkar_lengan_atas || '-'}</TableCell>
            <TableCell>{item.lingkar_perut || '-'}</TableCell>
          </>
        )
      case 'pasca_persalinan':
        return (
          <>
            <TableCell className="font-medium">{warga.nama}</TableCell>
            <TableCell>{item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{item.kondisi_ibu || '-'}</TableCell>
            <TableCell>{item.keluhan || '-'}</TableCell>
          </>
        )
      case 'lansia':
        return (
          <>
            <TableCell className="font-medium">{warga.nama}</TableCell>
            <TableCell>{ageText}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{item.gula_darah_sewaktu || '-'}</TableCell>
            <TableCell>{item.keluhan || '-'}</TableCell>
          </>
        )
      default:
        return <TableCell className="font-medium">{warga.nama}</TableCell>
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
