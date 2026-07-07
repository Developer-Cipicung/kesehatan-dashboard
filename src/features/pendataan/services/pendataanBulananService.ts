import { api } from '@/services/api'

export interface PendataanStatusResponse {
  success: boolean
  data: {
    id: string
    status: 'draft' | 'selesai'
    bulan: number
    tahun: number
  }
}

export interface PendataanGlobalStatusResponse {
  success: boolean
  data: {
    id: string
    bulan: number
    tahun: number
    status: 'draft' | 'selesai'
  }
}

export interface AdminPosyanduStatusResponse {
  success: boolean
  data: {
    id: string
    nama: string
    kode: string
    status: {
      bulan: number
      status: 'draft' | 'selesai'
    }[]
  }[]
}

export const pendataanBulananService = {
  getStatus: async (bulan: number, tahun: number, posyanduId?: string) => {
    const response = await api.get<PendataanStatusResponse>('/pendataan-bulanan', {
      params: { bulan, tahun, posyanduId },
    })
    return response.data.data
  },
  getGlobalStatus: async (bulan: number, tahun: number, posyanduId?: string) => {
    const response = await api.get<PendataanGlobalStatusResponse>('/pendataan-bulanan/status', {
      params: { bulan, tahun, posyanduId },
    })
    return response.data.data
  },
  getAdminStatus: async (tahun: number) => {
    const response = await api.get<AdminPosyanduStatusResponse>('/pendataan-bulanan/admin/status', {
      params: { tahun },
    })
    return response.data.data
  },
  submit: async ({ id, tanggal_pelaksanaan }: { id: string, tanggal_pelaksanaan: string }) => {
    const response = await api.post<{ success: boolean; message: string }>(`/pendataan-bulanan/${id}/submit`, {
      tanggal_pelaksanaan
    })
    return response.data
  },
}
