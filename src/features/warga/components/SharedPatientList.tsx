import { useState } from 'react'
import { useGetWargaList, useDeleteWarga } from '../hooks/useWarga'
import { PatientToolbar } from './PatientToolbar'
import { PatientTable } from './PatientTable'
import { PatientCard } from './PatientCard'
import { AddPatientDialog } from './AddPatientDialog'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'

interface SharedPatientListProps {
  title: string
  kategori: string
}

export function SharedPatientList({ title, kategori }: SharedPatientListProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const navigate = useNavigate()
  
  const { mutate: deleteWarga } = useDeleteWarga()

  const { data, isLoading, error, refetch } = useGetWargaList({
    kategori,
    search: debouncedSearch,
  })

  const handleView = (id: string) => {
    navigate(`/${kategori.replace('_', '-')}/${id}`)
  }

  const handleEdit = (id: string) => {
    // Navigate to edit or open edit dialog
    console.log('Edit', id)
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
      deleteWarga(id)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <PatientToolbar
        title={title}
        searchQuery={search}
        onSearchChange={setSearch}
        onAddPatient={() => setIsAddOpen(true)}
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
              data={data?.warga || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {data?.warga.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border">
                Tidak ada pasien ditemukan.
              </div>
            ) : (
              data?.warga.map((warga) => (
                <PatientCard
                  key={warga.id}
                  data={warga}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}

      <AddPatientDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        defaultCategory={kategori}
      />
    </div>
  )
}
