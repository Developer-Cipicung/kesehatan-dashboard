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
import { pemeriksaanService } from '../../pemeriksaan/services/pemeriksaanService'

const formSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  nomor: z.string().min(1, 'Nomor Telepon wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P']),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  nama_ayah: z.string().optional(),
  nama_ibu: z.string().optional(),
  tanggal_persalinan: z.string().optional(),
  tempat_lahir: z.string().optional(),
  alamat: z.string().optional(),
  tempat_persalinan: z.string().optional(),
  penggunaan_kontrasepsi: z.string().optional(),
})

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: string
  onSuccess?: () => void
}

export function AddPatientDialog({ open, onOpenChange, defaultCategory, onSuccess }: AddPatientDialogProps) {
  const { mutateAsync: addWarga, isPending } = useAddWarga()

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '',
      nomor: '',
      nama: '',
      tanggal_lahir: '',
      jenis_kelamin: 'L',
      kategori: defaultCategory || '',
      nama_ayah: '',
      nama_ibu: '',
      tanggal_persalinan: new Date().toISOString().split('T')[0],
      tempat_lahir: '',
      alamat: '',
      tempat_persalinan: '',
      penggunaan_kontrasepsi: '',
    },
  })

  const watchKategori = methods.watch('kategori')
  const isAnak = watchKategori === 'balita' || watchKategori === 'baduta'
  const isIbuIbu = watchKategori === 'bumil' || watchKategori === 'pasca_persalinan' || watchKategori === 'wus_pus'

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let status_kehamilan = 'TIDAK_HAMIL'
      if (values.kategori === 'bumil') status_kehamilan = 'HAMIL'
      if (values.kategori === 'pasca_persalinan') status_kehamilan = 'PASCA_PERSALINAN'

      const payload = { ...values, status_kehamilan }
      if (isIbuIbu) {
        payload.jenis_kelamin = 'P'
      }

      const created = await addWarga(payload as AddWargaPayload)
      if (values.kategori === 'pasca_persalinan' && values.tanggal_persalinan && created?.id) {
        try {
          await pemeriksaanService.create('pasca_persalinan', {
            warga_id: created.id,
            tanggal_kunjungan: new Date().toISOString().split('T')[0],
            tanggal_persalinan: values.tanggal_persalinan,
            bb: 0,
            tekanan_darah_sistolik: 120,
            tekanan_darah_diastolik: 80,
            suhu_tubuh: 36.5,
          } as any)
        } catch (err) {
          console.error('Gagal membuat data pasca persalinan awal', err)
        }
      }

      methods.reset()
      onOpenChange(false)
      if (onSuccess) onSuccess()
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
                label={<>NIK <span className="text-red-500">*</span></>}
                placeholder="Masukkan 16 digit NIK"
                type="text"
              />
              <FormField
                control={methods.control}
                name="nomor"
                label={<>Nomor Telepon <span className="text-red-500">*</span></>}
                placeholder="Contoh: 08123456789"
                type="text"
              />
              <FormField
                control={methods.control}
                name="nama"
                label={<>Nama Lengkap <span className="text-red-500">*</span></>}
                placeholder="Masukkan nama lengkap"
                type="text"
              />
              {!isIbuIbu && (
                <RHFFormField
                  control={methods.control}
                  name="jenis_kelamin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin <span className="text-red-500">*</span></FormLabel>
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
              )}
              <FormField
                control={methods.control}
                name="tanggal_lahir"
                label={<>Tanggal Lahir <span className="text-red-500">*</span></>}
                type="date"
              />
              <FormField
                control={methods.control}
                name="tempat_lahir"
                label={<>Tempat Lahir</>}
                placeholder="Contoh: Jakarta"
                type="text"
              />
              {!defaultCategory && (
                <FormField
                  control={methods.control}
                  name="kategori"
                  label={<>Kategori <span className="text-red-500">*</span></>}
                  placeholder="Contoh: bumil, balita, lansia"
                  type="text"
                />
              )}
              {watchKategori === 'pasca_persalinan' && (
                <>
                  <FormField
                    control={methods.control}
                    name="tanggal_persalinan"
                    label={<>Tanggal Persalinan <span className="text-red-500">*</span></>}
                    type="date"
                  />
                  <FormField
                    control={methods.control}
                    name="tempat_persalinan"
                    label={<>Tempat Persalinan</>}
                    placeholder="Contoh: RSUD / Bidan"
                    type="text"
                  />
                </>
              )}
              {isAnak && (
                <>
                  <FormField
                    control={methods.control}
                    name="nama_ayah"
                    label="Nama Ayah"
                    placeholder="Contoh: Budi"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="nama_ibu"
                    label="Nama Ibu"
                    placeholder="Contoh: Siti"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="penggunaan_kontrasepsi"
                    label="Penggunaan Kontrasepsi"
                    placeholder="Contoh: Pil / IUD"
                    type="text"
                  />
                </>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <FormField
                control={methods.control}
                name="alamat"
                label="Alamat Lengkap"
                placeholder="Contoh: Jl. Mawar No. 12"
                type="text"
              />
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
