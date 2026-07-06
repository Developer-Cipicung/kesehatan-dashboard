import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/FormField'
import { FormProvider } from 'react-hook-form'
import { useAddWarga } from '../hooks/useWarga'
import { AddWargaPayload } from '../services/wargaService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormItem, FormLabel, FormMessage, FormField as RHFFormField } from '@/components/ui/form'

const formSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  no_kk: z.string().min(16, 'No KK harus 16 digit').max(16, 'No KK harus 16 digit'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P']),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  rt: z.string().min(1, 'RT wajib diisi'),
  rw: z.string().min(1, 'RW wajib diisi'),
  status_pernikahan: z.enum(['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
})

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: string
}

export function AddPatientDialog({ open, onOpenChange, defaultCategory }: AddPatientDialogProps) {
  const { mutateAsync: addWarga, isPending } = useAddWarga()

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '',
      no_kk: '',
      nama: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: 'L',
      alamat: '',
      rt: '',
      rw: '',
      status_pernikahan: 'Belum Kawin',
      kategori: defaultCategory || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addWarga(values as AddWargaPayload)
      methods.reset()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pasien Baru</DialogTitle>
          <DialogDescription>
            Masukkan data pasien sesuai dengan KTP/KK.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="nik"
                label="NIK"
                placeholder="Masukkan 16 digit NIK"
                type="text"
              />
              <FormField
                control={methods.control}
                name="no_kk"
                label="No KK"
                placeholder="Masukkan 16 digit No KK"
                type="text"
              />
              <FormField
                control={methods.control}
                name="nama"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                type="text"
              />
              <RHFFormField
                control={methods.control}
                name="jenis_kelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="tempat_lahir"
                label="Tempat Lahir"
                placeholder="Contoh: Bandung"
                type="text"
              />
              <FormField
                control={methods.control}
                name="tanggal_lahir"
                label="Tanggal Lahir"
                type="date"
              />
              <div className="md:col-span-2">
                <FormField
                  control={methods.control}
                  name="alamat"
                  label="Alamat"
                  placeholder="Nama jalan / kampung"
                  type="text"
                />
              </div>
              <FormField
                control={methods.control}
                name="rt"
                label="RT"
                placeholder="Contoh: 001"
                type="text"
              />
              <FormField
                control={methods.control}
                name="rw"
                label="RW"
                placeholder="Contoh: 002"
                type="text"
              />
              <RHFFormField
                control={methods.control}
                name="status_pernikahan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pernikahan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                        <SelectItem value="Kawin">Kawin</SelectItem>
                        <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                        <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!defaultCategory && (
                <FormField
                  control={methods.control}
                  name="kategori"
                  label="Kategori"
                  placeholder="Contoh: bumil, balita, lansia"
                  type="text"
                />
              )}
            </div>
            
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
