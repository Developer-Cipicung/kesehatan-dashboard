import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PatientToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onAddPatient: () => void
  title: string
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  onAddPatient,
  title,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">Kelola daftar {title.toLowerCase()} di posyandu.</p>
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari NIK atau Nama..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={onAddPatient} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pasien
        </Button>
      </div>
    </div>
  )
}
