import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FormField } from '@/components/forms/FormField'
import { FormProvider } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Pemeriksaan } from '../services/pemeriksaanService'
import { useCreatePemeriksaan, useUpdatePemeriksaan } from '../hooks/usePemeriksaan'

const baseSchema = z.object({
  tanggal_pemeriksaan: z.string().min(1, 'Tanggal wajib diisi'),
  berat_badan: z.coerce.number().optional(),
  tinggi_badan: z.coerce.number().optional(),
  lingkar_kepala: z.coerce.number().optional(),
  tekanan_darah: z.string().optional(),
  catatan: z.string().optional(),
})

interface MonthlyRecordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: string
  wargaId: string
  initialData?: Pemeriksaan | null
}

export function MonthlyRecordForm({
  open,
  onOpenChange,
  kategori,
  wargaId,
  initialData,
}: MonthlyRecordFormProps) {
  const { mutateAsync: createRecord, isPending: isCreating } = useCreatePemeriksaan()
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdatePemeriksaan()

  const methods = useForm<any>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      tanggal_pemeriksaan: initialData?.tanggal_pemeriksaan
        ? new Date(initialData.tanggal_pemeriksaan).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      berat_badan: initialData?.berat_badan || undefined,
      tinggi_badan: initialData?.tinggi_badan || undefined,
      lingkar_kepala: initialData?.lingkar_kepala || undefined,
      tekanan_darah: initialData?.tekanan_darah || '',
      catatan: initialData?.catatan || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof baseSchema>) => {
    try {
      const payload = {
        ...values,
        warga_id: wargaId,
      }
      
      if (initialData) {
        await updateRecord({ kategori, id: initialData.id, payload })
      } else {
        await createRecord({ kategori, payload })
      }
      methods.reset()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan'}</DialogTitle>
          <DialogDescription>
            Masukkan hasil pemeriksaan bulanan pasien.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={methods.control as any}
              name="tanggal_pemeriksaan"
              label="Tanggal Pemeriksaan"
              type="date"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control as any}
                name="berat_badan"
                label="Berat Badan (kg)"
                type="number"
                placeholder="Contoh: 50.5"
              />
              <FormField
                control={methods.control as any}
                name="tinggi_badan"
                label="Tinggi Badan (cm)"
                type="number"
                placeholder="Contoh: 160"
              />
              <FormField
                control={methods.control as any}
                name="lingkar_kepala"
                label="Lingkar Kepala (cm)"
                type="number"
                placeholder="Contoh: 35"
              />
              <FormField
                control={methods.control as any}
                name="tekanan_darah"
                label="Tekanan Darah (Tensi)"
                type="text"
                placeholder="Contoh: 120/80"
              />
            </div>
            
            <FormField
              control={methods.control as any}
              name="catatan"
              label="Catatan / Keluhan"
              type="text"
              placeholder="Masukkan catatan kader..."
            />

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
