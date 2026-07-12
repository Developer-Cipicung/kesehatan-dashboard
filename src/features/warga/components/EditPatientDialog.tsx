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
import { useUpdateWarga, useGetWargaList } from '../hooks/useWarga'
import { Warga, AddWargaPayload } from '../services/wargaService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormItem, FormLabel, FormMessage, FormField as RHFFormField } from '@/components/ui/form'
import { WargaCombobox } from './WargaCombobox'
import { toast } from 'sonner'

const getFormSchema = (isAnak: boolean) => z.object({
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  nomor: z.string().min(1, 'Nomor Telepon wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P']),
  status_kehamilan: z.enum(['TIDAK_HAMIL', 'HAMIL', 'PASCA_PERSALINAN']).optional(),
  nama_ayah: z.string().optional(),
  nama_ibu: z.string().optional(),
  alamat: z.string().optional(),
  tempat_persalinan: z.string().optional(),
  penggunaan_kontrasepsi: z.string().optional(),
  hpht: z.string().optional(),
  ibu_id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (isAnak && (!data.nama_ayah || data.nama_ayah.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Nama Ayah wajib diisi',
      path: ['nama_ayah'],
    });
  }
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
  const { data: ibuListRes } = useGetWargaList({ jenis_kelamin: 'P', limit: 1000 }, { enabled: open })
  const ibuList = (ibuListRes?.data || []).filter(w => w.status_kehamilan === 'HAMIL' || w.status_kehamilan === 'PASCA_PERSALINAN')

  const currentKategori = kategori || warga.kategori
  const isAnak = currentKategori === 'balita' || currentKategori === 'baduta'
  const isIbuIbu = currentKategori === 'bumil' || currentKategori === 'pasca_persalinan' || currentKategori === 'wus_pus'

  const methods = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(isAnak)),
    defaultValues: {
      nik: warga.nik || '',
      nomor: warga.nomor || '',
      nama: warga.nama || '',
      tanggal_lahir: warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toISOString().split('T')[0] : '',
      jenis_kelamin: warga.jenis_kelamin || 'L',
      status_kehamilan: warga.status_kehamilan || 'TIDAK_HAMIL',
      nama_ayah: warga.nama_ayah || '',
      nama_ibu: warga.nama_ibu || '',
      tempat_lahir: warga.tempat_lahir || '',
      alamat: warga.alamat || '',
      tempat_persalinan: warga.tempat_persalinan || '',
      penggunaan_kontrasepsi: warga.penggunaan_kontrasepsi || '',
      hpht: warga.hpht ? new Date(warga.hpht).toISOString().split('T')[0] : '',
      ibu_id: warga.ibu_id || 'none',
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
        status_kehamilan: warga.status_kehamilan || 'TIDAK_HAMIL',
        nama_ayah: warga.nama_ayah || '',
        nama_ibu: warga.nama_ibu || '',
        tempat_lahir: warga.tempat_lahir || '',
        alamat: warga.alamat || '',
        tempat_persalinan: warga.tempat_persalinan || '',
        penggunaan_kontrasepsi: warga.penggunaan_kontrasepsi || '',
        hpht: warga.hpht ? new Date(warga.hpht).toISOString().split('T')[0] : '',
        ibu_id: warga.ibu_id || 'none',
      })
    }
  }, [warga, open, methods])

  const watchStatusKehamilan = methods.watch('status_kehamilan')
  const onSubmit = async (values: z.infer<ReturnType<typeof getFormSchema>>) => {
    try {
      const payload: Partial<AddWargaPayload> = { ...values }
      if (payload.ibu_id === 'none') {
        payload.ibu_id = undefined // To clear it if changed to none, though prisma needs null maybe? Let's just delete it or pass null/undefined
      }
      
      if (isIbuIbu) {
        payload.jenis_kelamin = 'P'
      }

      // Cleanup empty strings for optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof AddWargaPayload] === '') {
          delete payload[key as keyof AddWargaPayload]
        }
      })

      await updateWarga({ id: warga.id, payload })
      toast.success('Data pasien berhasil diperbarui')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      let errorMessage = (error as any).response?.data?.message || (error as Error).message || 'Gagal menyimpan data'
      const validationErrors = (error as any).response?.data?.errors
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        errorMessage = validationErrors.map(e => e.message).join(', ')
      }
      toast.error(errorMessage)
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
            <div className="space-y-6">
              {/* Grup Data Diri */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Data Diri</h4>
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
                    name="nama"
                    label={<>Nama Lengkap <span className="text-red-500">*</span></>}
                    placeholder="Masukkan nama lengkap"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="nomor"
                    label={<>Nomor Telepon <span className="text-red-500">*</span></>}
                    placeholder="Contoh: 08123456789"
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
                  {isIbuIbu && (
                    <RHFFormField
                      control={methods.control}
                      name="status_kehamilan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Kehamilan <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status kehamilan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HAMIL">Hamil</SelectItem>
                              <SelectItem value="PASCA_PERSALINAN">Pasca Persalinan</SelectItem>
                              <SelectItem value="TIDAK_HAMIL">Tidak Hamil</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Grup Tempat Tanggal Lahir */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Kelahiran</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={methods.control}
                    name="tempat_lahir"
                    label={<>Tempat Lahir <span className="text-red-500">*</span></>}
                    placeholder="Contoh: Jakarta"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="tanggal_lahir"
                    label={<>Tanggal Lahir <span className="text-red-500">*</span></>}
                    type="date"
                  />
                </div>
              </div>

              {(isIbuIbu || isAnak) && (
                <hr className="border-slate-200" />
              )}

              {/* Detail Kategori Tambahan */}
              {(isIbuIbu || isAnak) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Detail Tambahan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isIbuIbu && watchStatusKehamilan === 'PASCA_PERSALINAN' && (
                      <FormField
                        control={methods.control}
                        name="tempat_persalinan"
                        label={<>Tempat Persalinan</>}
                        placeholder="Contoh: RSUD / Bidan"
                        type="text"
                      />
                    )}
                    {isIbuIbu && watchStatusKehamilan === 'HAMIL' && (
                      <FormField
                        control={methods.control}
                        name="hpht"
                        label={<>HPHT (Hari Pertama Haid Terakhir) <span className="text-red-500">*</span></>}
                        type="date"
                      />
                    )}
                    {isAnak && (
                      <>
                        <FormField
                          control={methods.control}
                          name="nama_ayah"
                          label={<>Nama Ayah <span className="text-red-500">*</span></>}
                          placeholder="Contoh: Budi"
                          type="text"
                        />
                        <RHFFormField
                          control={methods.control}
                          name="ibu_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Ibu <span className="text-red-500">*</span></FormLabel>
                              <WargaCombobox
                                wargaList={ibuList}
                                value={field.value || 'none'}
                                onChange={field.onChange}
                                placeholder="Pilih Ibu..."
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormField
                  control={methods.control}
                  name="alamat"
                  label="Alamat Lengkap"
                  placeholder="Contoh: Jl. Mawar No. 12"
                  type="text"
                />
              </div>
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
