import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
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
import { useUpdateWarga } from '../hooks/useWarga'
import { Warga, AddWargaPayload } from '../services/wargaService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormItem, FormLabel, FormMessage, FormField as RHFFormField } from '@/components/ui/form'
import { toast } from 'sonner'

const formSchema = z.object({
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  nomor: z.string().min(1, 'Nomor Telepon wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P']),
  nama_ayah: z.string().optional(),
  nama_ibu: z.string().optional(),
  tempat_lahir: z.string().optional(),
  alamat: z.string().optional(),
  tempat_persalinan: z.string().optional(),
  penggunaan_kontrasepsi: z.string().optional(),
})

interface EditPatientDialogProps {
  warga: Warga
  kategori?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPatientDialog({ warga, kategori, open, onOpenChange, onSuccess }: EditPatientDialogProps) {
  const { mutateAsync: updateWarga, isPending } = useUpdateWarga()

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: warga.nik || '',
      nomor: warga.nomor || '',
      nama: warga.nama || '',
      tanggal_lahir: warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toISOString().split('T')[0] : '',
      jenis_kelamin: warga.jenis_kelamin || 'L',
      nama_ayah: warga.nama_ayah || '',
      nama_ibu: warga.nama_ibu || '',
      tempat_lahir: warga.tempat_lahir || '',
      alamat: warga.alamat || '',
      tempat_persalinan: warga.tempat_persalinan || '',
      penggunaan_kontrasepsi: warga.penggunaan_kontrasepsi || '',
    },
  })

  useEffect(() => {
    if (open) {
      methods.reset({
        nik: warga.nik || '',
        nomor: warga.nomor || '',
        nama: warga.nama || '',
        tanggal_lahir: warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toISOString().split('T')[0] : '',
        jenis_kelamin: warga.jenis_kelamin || 'L',
        nama_ayah: warga.nama_ayah || '',
        nama_ibu: warga.nama_ibu || '',
        tempat_lahir: warga.tempat_lahir || '',
        alamat: warga.alamat || '',
        tempat_persalinan: warga.tempat_persalinan || '',
        penggunaan_kontrasepsi: warga.penggunaan_kontrasepsi || '',
      })
    }
  }, [warga, open, methods])

  const currentKategori = kategori || warga.kategori
  const isAnak = currentKategori === 'balita' || currentKategori === 'baduta'
  const isIbuIbu = currentKategori === 'bumil' || currentKategori === 'pasca_persalinan' || currentKategori === 'wus_pus'

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: Partial<AddWargaPayload> = { ...values }
      
      if (isIbuIbu) {
        payload.jenis_kelamin = 'P'
      }

      await updateWarga({ id: warga.id, payload })
      toast.success('Data pasien berhasil diperbarui')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Gagal memperbarui data pasien')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profil Pasien</DialogTitle>
          <DialogDescription>
            Perbarui data profil pasien di bawah ini.
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
              
              {warga.kategori === 'pasca_persalinan' && (
                <FormField
                  control={methods.control}
                  name="tempat_persalinan"
                  label={<>Tempat Persalinan</>}
                  placeholder="Contoh: RSUD / Bidan"
                  type="text"
                />
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
                    label="Penggunaan Kontrasepsi Ibu"
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
