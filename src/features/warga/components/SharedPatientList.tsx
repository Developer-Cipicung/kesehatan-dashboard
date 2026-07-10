import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGetWargaList } from '../hooks/useWarga'
import { PatientToolbar } from './PatientToolbar'
import { PatientTable } from './PatientTable'
import { PatientCard } from './PatientCard'
import { AddPatientDialog } from './AddPatientDialog'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { useGetPendataanStatus, useSubmitPendataan } from '@/features/pendataan/hooks/usePendataanBulanan'
import { useAuthStore } from '@/stores/authStore'

interface SharedPatientListProps {
  title: string
  kategori: string
}

export function SharedPatientList({ title, kategori }: SharedPatientListProps) {
  const [search, setSearch] = useState('')
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

  const [page, setPage] = useState(1)
  const LIMIT = 10

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1) // Reset ke halaman 1 jika mencari
  }

  const { data, isLoading, error, refetch } = useGetWargaList({
    search: search.trim() || undefined,
    kategori,
    page,
    limit: LIMIT,
    posyanduId: selectedPosyanduId || undefined,
  })

  const paginatedWarga = data?.data || []
  const totalPatients = data?.metadata.total || 0
  const totalPages = data?.metadata.totalPages || 1

  const handleView = (id: string) => {
    navigate(`/${kategori.replace('_', '-')}/${id}`)
  }

  return (
    <div className="flex flex-col space-y-6">
      <PatientToolbar
        title={title}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        totalPatients={totalPatients}
        onAddPatient={() => setIsAddOpen(true)}
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
              data={paginatedWarga}
              kategori={kategori}
              onView={handleView}
              isReadOnly={isReadOnly}
            />
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {paginatedWarga.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border">
                Tidak ada pasien ditemukan.
              </div>
            ) : (
              paginatedWarga.map((warga) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <span className="text-sm font-medium mx-4">
                      Halaman {page} dari {totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
                if (!tanggalPelaksanaan || !pendataanStatus?.id) return
                submitPendataan(
                  { id: pendataanStatus.id, tanggal_pelaksanaan: new Date(tanggalPelaksanaan).toISOString() },
                  { onSuccess: () => setIsSubmitOpen(false) },
                )
              }}
              disabled={isSubmitting || !tanggalPelaksanaan || !pendataanStatus?.id}
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
        onSuccess={() => setPage(1)}
      />
    </div>
  )
}
