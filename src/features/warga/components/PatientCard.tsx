import { Warga } from '../services/wargaService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PatientCardProps {
  data: Warga
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function PatientCard({ data, onView, onEdit, onDelete }: PatientCardProps) {
  const date = new Date(data.tanggal_lahir).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{data.nama}</h3>
            <p className="text-sm text-muted-foreground">{data.nik}</p>
          </div>
          <Badge variant="outline">
            {data.jenis_kelamin === 'L' ? 'L' : 'P'}
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Tgl Lahir</span>
            <span className="font-medium">{date}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">RT/RW</span>
            <span className="font-medium">
              {data.rt}/{data.rw}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onView(data.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Detail
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(data.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={() => onDelete(data.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
