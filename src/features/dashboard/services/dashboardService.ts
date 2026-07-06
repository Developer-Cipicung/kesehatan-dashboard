import { api } from '@/services/api'

export interface DashboardStatsResponse {
  success: boolean
  message: string
  data: {
    total_warga: number
    total_balita: number
    total_bumil: number
    total_lansia: number
    pendataan: {
      balita: 'draft' | 'selesai'
      imunisasi: 'draft' | 'selesai'
      bumil: 'draft' | 'selesai'
      pasca_persalinan: 'draft' | 'selesai'
      lansia: 'draft' | 'selesai'
    }
  }
}

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<DashboardStatsResponse>('/dashboard')
    return response.data.data
  },
}
