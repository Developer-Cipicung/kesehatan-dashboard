import { api } from '@/services/api'

export interface RiwayatImunisasi {
  id: string
  warga_id: string
  jenis_vaksin: string
  tanggal_pemberian: string
  created_at: string
  updated_at: string
}

export const VAKSIN_OPTIONS = [
  'HB0', 'BCG',
  'POLIO1', 'POLIO2', 'POLIO3', 'POLIO4',
  'ROTAVIRUS 1', 'ROTAVIRUS 2', 'ROTAVIRUS 3',
  'DPT 1', 'DPT 2', 'DPT 3',
  'PCV 1', 'PCV 2', 'PCV 3',
  'IPV 1', 'IPV 2',
  'MR(CAMPAK)',
  'BOSTER DPT', 'BOSTER MR(CAMPAK)'
]

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
