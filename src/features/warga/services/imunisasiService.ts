import { api } from '@/services/api'

export interface RiwayatImunisasi {
  id: string
  warga_id: string
  jenis_vaksin: string
  tanggal_pemberian: string
  created_at: string
  updated_at: string
}

export const imunisasiService = {
  getByWarga: async (wargaId: string): Promise<RiwayatImunisasi[]> => {
    const res = await api.get('/imunisasi', { params: { wargaId, limit: 1000 } })
    return res.data.data?.data || []
  },
  create: async (payload: { warga_id: string; jenis_vaksin: string; tanggal_pemberian: string }): Promise<RiwayatImunisasi> => {
    const res = await api.post('/imunisasi', payload)
    return res.data.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/imunisasi/${id}`)
  },
}
