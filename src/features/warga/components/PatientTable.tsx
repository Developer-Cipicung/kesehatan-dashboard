import { ColumnDef } from '@tanstack/react-table'
import { Warga } from '../services/wargaService'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PatientTableProps {
  data: Warga[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function PatientTable({ data, onView, onEdit, onDelete }: PatientTableProps) {
  const columns: ColumnDef<Warga>[] = [
    {
      accessorKey: 'nik',
      header: 'NIK',
    },
    {
      accessorKey: 'nama',
      header: 'Nama',
      cell: ({ row }) => <div className="font-medium">{row.original.nama}</div>,
    },
    {
      accessorKey: 'jenis_kelamin',
      header: 'L/P',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
        </Badge>
      ),
    },
    {
      accessorKey: 'tanggal_lahir',
      header: 'Tgl Lahir',
      cell: ({ row }) => {
        const date = new Date(row.original.tanggal_lahir)
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      },
    },
    {
      accessorKey: 'rt_rw',
      header: 'RT/RW',
      cell: ({ row }) => (
        <span>
          {row.original.rt}/{row.original.rw}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const w = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onView(w.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(w.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(w.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={data} />
}
