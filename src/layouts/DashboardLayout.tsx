import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="w-64 border-r bg-sidebar p-4">
        <h2 className="text-xl font-bold">Posyandu</h2>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
