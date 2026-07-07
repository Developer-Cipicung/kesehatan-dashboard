import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pendataanBulananService } from '../services/pendataanBulananService'
import { toast } from 'sonner'



export function useGetPendataanStatus(bulan: number, tahun: number, posyanduId?: string) {
  return useQuery({
    queryKey: ['pendataan', 'status', bulan, tahun, posyanduId],
    queryFn: () => pendataanBulananService.getStatus(bulan, tahun, posyanduId),
    enabled: !!bulan && !!tahun,
  })
}

export function useGetPendataanGlobalStatus(bulan: number, tahun: number, posyanduId?: string) {
  return useQuery({
    queryKey: ['pendataan', 'global', bulan, tahun, posyanduId],
    queryFn: () => pendataanBulananService.getGlobalStatus(bulan, tahun, posyanduId),
    enabled: !!bulan && !!tahun,
  })
}

export function useGetAdminStatusPendataan(tahun: number) {
  return useQuery({
    queryKey: ['pendataan', 'admin', 'status', tahun],
    queryFn: () => pendataanBulananService.getAdminStatus(tahun),
    enabled: !!tahun,
  })
}

export function useSubmitPendataan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string, tanggal_pelaksanaan: string }) => pendataanBulananService.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
      toast.success('Pendataan berhasil diselesaikan dan dikunci.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyelesaikan pendataan.')
    },
  })
}
