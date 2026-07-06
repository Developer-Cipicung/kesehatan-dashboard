import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { SharedPatientList } from '@/features/warga/components/SharedPatientList'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'ibu-hamil',
            element: <SharedPatientList title="Ibu Hamil" kategori="bumil" />,
          },
          {
            path: 'pasca-persalinan',
            element: <SharedPatientList title="Pasca Persalinan" kategori="pasca_persalinan" />,
          },
          {
            path: 'calon-menikah',
            element: <SharedPatientList title="Calon Menikah" kategori="calon_menikah" />,
          },
          {
            path: 'batita',
            element: <SharedPatientList title="Batita" kategori="batita" />,
          },
          {
            path: 'balita',
            element: <SharedPatientList title="Balita" kategori="balita" />,
          },
          {
            path: 'anak-sekolah',
            element: <SharedPatientList title="Anak Sekolah" kategori="anak_sekolah" />,
          },
          {
            path: 'lansia',
            element: <SharedPatientList title="Lansia" kategori="lansia" />,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
