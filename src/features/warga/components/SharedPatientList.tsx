import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Warga } from '../services/wargaService'
import { useGetWargaList } from '../hooks/useWarga'
import { PatientToolbar } from './PatientToolbar'
import { PatientTable } from './PatientTable'
import { PatientCard } from './PatientCard'
import { AddPatientDialog } from './AddPatientDialog'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useGetPendataanStatus, useSubmitPendataan } from '@/features/pendataan/hooks/usePendataanBulanan'
import { useAuthStore } from '@/stores/authStore'

interface SharedPatientListProps {
  title: string
  kategori: string
}

function getAgeInMonths(tanggalLahir: string, referenceDate = new Date()) {
  const birthDate = new Date(tanggalLahir)

  if (Number.isNaN(birthDate.getTime())) {
    return 0
  }

  let months = (referenceDate.getFullYear() - birthDate.getFullYear()) * 12 + (referenceDate.getMonth() - birthDate.getMonth())

  if (referenceDate.getDate() < birthDate.getDate()) {
    months--
  }

  return Math.max(0, months)
}

function matchesKategori(warga: Warga, kategori: string) {
  const statusKehamilan = (warga.status_kehamilan || 'TIDAK_HAMIL').toUpperCase()

  if (kategori === 'bumil') {
    return statusKehamilan === 'HAMIL'
  }

  if (kategori === 'pasca_persalinan') {
    return statusKehamilan === 'PASCA_PERSALINAN'
  }

  if (statusKehamilan !== 'TIDAK_HAMIL') {
    return false
  }

  const ageInMonths = getAgeInMonths(warga.tanggal_lahir)

  if (kategori === 'baduta') {
    return ageInMonths < 24
  }

  if (kategori === 'balita') {
    return ageInMonths >= 24 && ageInMonths < 60
  }

  if (kategori === 'lansia') {
    return ageInMonths >= 720
  }

  return warga.kategori === kategori
}

export function SharedPatientList({ title, kategori }: SharedPatientListProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(new Date().toISOString().split('T')[0])
  const navigate = useNavigate()
  const { selectedPosyanduId, posyandu } = useAuthStore()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { data: pendataanStatus } = useGetPendataanStatus(currentMonth, currentYear, selectedPosyanduId || undefined)
  const { mutate: submitPendataan, isPending: isSubmitting } = useSubmitPendataan()
  const isLocked = pendataanStatus?.status === 'selesai'
  const isReadOnly = posyandu?.id !== selectedPosyanduId

  const { data, isLoading, error, refetch } = useGetWargaList({
    search: debouncedSearch,
    limit: 10000,
    posyanduId: selectedPosyanduId || undefined,
  })

  const wargaList = data?.data || []
  const filteredWarga = useMemo(
    () => wargaList.filter((warga) => matchesKategori(warga, kategori)),
    [kategori, wargaList],
  )

  const handleView = (id: string) => {
    navigate(`/${kategori.replace('_', '-')}/${id}`)
  }

  return (
    <div className="flex flex-col space-y-6">
      <PatientToolbar
        title={title}
        searchQuery={search}
        onSearchChange={setSearch}
        onAddPatient={() => setIsAddOpen(true)}
        totalPatients={filteredWarga.length}
        isReadOnly={isReadOnly}
      />



      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal memuat data"
          message="Terjadi kesalahan saat mengambil daftar pasien."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <PatientTable
              data={filteredWarga}
              kategori={kategori}
              onView={handleView}
              isReadOnly={isReadOnly}
            />
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {filteredWarga.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border">
                Tidak ada pasien ditemukan.
              </div>
            ) : (
              filteredWarga.map((warga) => (
                <PatientCard
                  key={warga.id}
                  data={warga}
                  kategori={kategori}
                  onView={handleView}
                  isReadOnly={isReadOnly}
                />
              ))
            )}
          </div>
        </>
      )}

      {!isLocked && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl rounded-xl px-6 py-6 text-sm font-semibold"
            disabled={isSubmitting}
            onClick={() => setIsSubmitOpen(true)}
          >
            <div className="bg-primary/50/20 text-primary/70 p-1 rounded mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            Selesai Pendataan Bulan Ini
          </Button>
        </div>
      )}

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunci Pendataan Bulan Ini</DialogTitle>
            <DialogDescription>
              Tentukan tanggal pelaksanaan Posyandu. Semua data pemeriksaan yang baru diinput akan disimpan dengan tanggal ini. Data yang sudah dikunci tidak dapat diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_pelaksanaan">Tanggal Pelaksanaan Posyandu</Label>
              <Input
                id="tanggal_pelaksanaan"
                type="date"
                value={tanggalPelaksanaan}
                onChange={(e) => setTanggalPelaksanaan(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => {
                if (!tanggalPelaksanaan) return;
                submitPendataan({ id: pendataanStatus?.id!, tanggal_pelaksanaan: new Date(tanggalPelaksanaan).toISOString() })
                setIsSubmitOpen(false)
              }}
              disabled={isSubmitting || !tanggalPelaksanaan}
            >
              Ya, Kunci Pendataan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddPatientDialog
        key={kategori}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        defaultCategory={kategori}
      />
    </div>
  )
}
