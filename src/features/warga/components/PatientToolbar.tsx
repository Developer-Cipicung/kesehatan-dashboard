import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PatientToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onAddPatient: () => void
  title: string
  totalPatients: number
  isReadOnly?: boolean
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  onAddPatient,
  title,
  totalPatients,
  isReadOnly,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>

          <h2 className="text-[28px] font-bold text-slate-800 leading-tight">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{totalPatients} pasien terdaftar</p>
        </div>
        {!isReadOnly && (
          <Button onClick={onAddPatient} className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Input Data Baru
          </Button>
        )}
      </div>

      <div className="relative w-full md:w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Cari nama atau NIK..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 py-6 border-slate-200 rounded-xl shadow-sm text-base focus-visible:ring-primary"
        />
      </div>
    </div>
  )
}
