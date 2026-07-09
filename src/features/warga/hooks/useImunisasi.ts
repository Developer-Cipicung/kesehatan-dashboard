import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { imunisasiService } from '../services/imunisasiService'
import { toast } from 'sonner'

export function useGetImunisasiByWarga(wargaId: string) {
  return useQuery({
    queryKey: ['imunisasi', wargaId],
    queryFn: () => imunisasiService.getByWarga(wargaId),
    enabled: !!wargaId,
  })
}

export function useCreateImunisasi(wargaId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { warga_id: string; jenis_vaksin: string; tanggal_pemberian: string }) =>
      imunisasiService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imunisasi', wargaId] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menambah imunisasi')
    },
  })
}

export function useDeleteImunisasi(wargaId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => imunisasiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imunisasi', wargaId] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menghapus imunisasi')
    },
  })
}
