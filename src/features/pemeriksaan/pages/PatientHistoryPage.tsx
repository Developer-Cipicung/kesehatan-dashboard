import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetWargaById } from '@/features/warga/hooks/useWarga'
import { useGetHistory, useDeletePemeriksaan } from '../hooks/usePemeriksaan'
import { useGetPendataanStatus } from '@/features/pendataan/hooks/usePendataanBulanan'
import { useAuthStore } from '@/stores/authStore'
import { PatientProfileCard } from '../components/PatientProfileCard'
import { HistoryTimeline } from '../components/HistoryTimeline'
import { MonthlyRecordForm } from '../components/MonthlyRecordForm'
import { ImunisasiCell } from '@/features/warga/components/ImunisasiCell'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { Pemeriksaan } from '../services/pemeriksaanService'

export function PatientHistoryPage() {
  const { kategori, id } = useParams<{ kategori: string; id: string }>()
  const navigate = useNavigate()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Pemeriksaan | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { selectedPosyanduId, posyandu } = useAuthStore()

  // Queries
  const { data: warga, isLoading: isWargaLoading, error: wargaError } = useGetWargaById(id!, selectedPosyanduId || undefined)
  const { data: history, isLoading: isHistoryLoading, error: historyError } = useGetHistory(kategori!, id!, selectedPosyanduId || undefined)
  const { data: pendataanStatus, isLoading: isStatusLoading } = useGetPendataanStatus(currentMonth, currentYear, selectedPosyanduId || undefined)

  const { mutate: deletePemeriksaan } = useDeletePemeriksaan()

  const isLocked = pendataanStatus?.status === 'selesai'
  const isReadOnly = posyandu?.id !== selectedPosyanduId

  const handleEdit = (record: Pemeriksaan) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setTimeout(() => setEditingRecord(null), 200)
    }
  }

  const handleDelete = (recordId: string) => {
    setConfirmDeleteId(recordId)
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deletePemeriksaan({ kategori: kategori!, id: confirmDeleteId })
      setConfirmDeleteId(null)
    }
  }

  if (isWargaLoading || isHistoryLoading || isStatusLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (wargaError || historyError || !warga) {
    return (
      <ErrorState
        title="Gagal memuat detail pasien"
        message="Pasien tidak ditemukan atau terjadi kesalahan jaringan."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        {isLocked && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
            Pendataan Sudah Terkunci
          </div>
        )}
        {isReadOnly && !isLocked && (
          <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
            Mode Baca Saja (Beda Posyandu)
          </div>
        )}
      </div>

      <PatientProfileCard warga={warga} kategori={kategori} />

      {(kategori === 'balita' || kategori === 'baduta') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 mt-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Kelola Imunisasi</h3>
          <div className="max-w-md">
            <ImunisasiCell wargaId={id!} disabled={isLocked || isReadOnly} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h3 className="text-xl font-bold">Riwayat Pemeriksaan</h3>
        {!isLocked && !isReadOnly && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Riwayat
          </Button>
        )}
      </div>

      <HistoryTimeline
        history={history || []}
        kategori={kategori!}
        isLocked={isLocked || isReadOnly}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MonthlyRecordForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        kategori={kategori!}
        wargaId={id!}
        initialData={editingRecord}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Riwayat Pemeriksaan"
        description="Apakah Anda yakin ingin menghapus riwayat pemeriksaan ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
