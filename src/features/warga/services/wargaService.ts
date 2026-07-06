import { api } from '@/services/api'

export interface Warga {
  id: string
  nik: string
  no_kk: string
  nama: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  golongan_darah?: string
  no_hp?: string
  pekerjaan?: string
  pendidikan?: string
  status_pernikahan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati'
  kategori: string
  posyandu_id?: string
  created_at: string
  updated_at: string
}

export interface WargaListResponse {
  success: boolean
  message: string
  data: {
    warga: Warga[]
    meta: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
}

export interface WargaResponse {
  success: boolean
  message: string
  data: Warga
}

export interface GetWargaParams {
  page?: number
  limit?: number
  search?: string
  jenis_kelamin?: 'L' | 'P'
  posyandu_id?: string
  kategori?: string
}

export interface AddWargaPayload {
  nik: string
  no_kk: string
  nama: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  alamat: string
  rt: string
  rw: string
  kelurahan?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
  golongan_darah?: string
  no_hp?: string
  pekerjaan?: string
  pendidikan?: string
  status_pernikahan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati'
  kategori: string
  posyandu_id?: string
}

export const wargaService = {
  getWargaList: async (params?: GetWargaParams) => {
    const response = await api.get<WargaListResponse>('/warga', { params })
    return response.data.data
  },
  getWargaById: async (id: string) => {
    const response = await api.get<WargaResponse>(`/warga/${id}`)
    return response.data.data
  },
  addWarga: async (payload: AddWargaPayload) => {
    const response = await api.post<WargaResponse>('/warga', payload)
    return response.data.data
  },
  updateWarga: async (id: string, payload: Partial<AddWargaPayload>) => {
    const response = await api.put<WargaResponse>(`/warga/${id}`, payload)
    return response.data.data
  },
  deleteWarga: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/warga/${id}`)
    return response.data
  },
}
