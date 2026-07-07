import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export function useDashboardStats(posyanduId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'stats', posyanduId],
    queryFn: () => dashboardService.getStats(posyanduId),
  })
}
