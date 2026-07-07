import { api } from '@/services/api'

export interface Pemeriksaan {
  id: string
  warga_id: string
  posyandu_id: string
  kader_id: string
  tanggal_pemeriksaan: string
  berat_badan?: number
  tinggi_badan?: number
  lingkar_kepala?: number
  lingkar_lengan?: number
  tekanan_darah?: string
  keluhan?: string
  catatan?: string
  created_at: string
  updated_at: string
}

export interface HistoryResponse {
  success: boolean
  message: string
  data: Pemeriksaan[]
}

export interface PemeriksaanResponse {
  success: boolean
  message: string
  data: Pemeriksaan
}

export const pemeriksaanService = {
  getHistory: async (kategori: string, wargaId: string, posyanduId?: string) => {
    // API uses dash-case for endpoints (e.g. pasca-persalinan)
    const endpoint = kategori.replace('_', '-')
    const response = await api.get<HistoryResponse>(`/${endpoint}/${wargaId}/history`, { params: { posyanduId } })
    return response.data.data
  },
  getById: async (kategori: string, id: string, posyanduId?: string) => {
    const endpoint = kategori.replace('_', '-')
    const response = await api.get<PemeriksaanResponse>(`/${endpoint}/${id}`, { params: { posyanduId } })
    return response.data.data
  },
  create: async (kategori: string, payload: Partial<Pemeriksaan>) => {
    const endpoint = kategori.replace('_', '-')
    const response = await api.post<PemeriksaanResponse>(`/${endpoint}`, payload)
    return response.data.data
  },
  update: async (kategori: string, id: string, payload: Partial<Pemeriksaan>) => {
    const endpoint = kategori.replace('_', '-')
    const response = await api.put<PemeriksaanResponse>(`/${endpoint}/${id}`, payload)
    return response.data.data
  },
  delete: async (kategori: string, id: string) => {
    const endpoint = kategori.replace('_', '-')
    const response = await api.delete<{ success: boolean; message: string }>(`/${endpoint}/${id}`)
    return response.data
  },
}
