import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pemeriksaan } from '../services/pemeriksaanService'
import { useCreatePemeriksaan, useUpdatePemeriksaan } from '../hooks/usePemeriksaan'

interface MonthlyRecordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: string
  wargaId: string
  initialData?: Pemeriksaan | null
  defaultTanggalPersalinan?: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ register, name, type = 'text', placeholder }: { register: any; name: string; type?: string; placeholder?: string }) {
  return (
    <input
      {...register(name)}
      type={type}
      placeholder={placeholder}
      step={type === 'number' ? 'any' : undefined}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
    />
  )
}

function TdInput({ setValue, watch, name }: { setValue: any; watch: any; name: string }) {
  const val = watch(name) || ''
  const parts = val.split('/')
  const s = parts[0] || ''
  const d = parts[1] || ''
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={s}
        onChange={e => setValue(name, `${e.target.value}${d ? '/' + d : ''}`)}
        placeholder="120"
        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="text-slate-400 font-bold">/</span>
      <input
        type="number"
        value={d}
        onChange={e => setValue(name, `${s || '0'}/${e.target.value}`)}
        placeholder="80"
        className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

export function MonthlyRecordForm({ open, onOpenChange, kategori, wargaId, initialData, defaultTanggalPersalinan }: MonthlyRecordFormProps) {
  const { mutateAsync: createRecord, isPending: isCreating } = useCreatePemeriksaan()
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdatePemeriksaan()

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const isEdit = !!initialData
  const mutationPending = isCreating || isUpdating

  const methods = useForm<any>()
  const { register, handleSubmit, watch, setValue, reset } = methods
  const isPending = mutationPending || methods.formState.isSubmitting

  useEffect(() => {
    if (open) {
      const rec: any = initialData || {}
      reset({
        tanggal_kunjungan: rec.tanggal_kunjungan ? toDateInputValue(rec.tanggal_kunjungan) : new Date().toISOString().split('T')[0],
        tanggal_persalinan: toDateInputValue(rec.tanggal_persalinan || defaultTanggalPersalinan) || new Date().toISOString().split('T')[0],
        bb: rec.bb ?? '',
        tb: rec.tb ?? '',
        lingkar_kepala: rec.lingkar_kepala ?? '',
        lingkar_lengan_atas: rec.lingkar_lengan_atas ?? '',
        lingkar_perut: rec.lingkar_perut ?? '',
        usia_kehamilan_minggu: rec.usia_kehamilan_minggu ?? '',
        hpht: rec.hpht ? toDateInputValue(rec.hpht) : '',
        htp: rec.htp ? toDateInputValue(rec.htp) : '',
        td: (rec.tekanan_darah_sistolik && rec.tekanan_darah_diastolik) ? `${rec.tekanan_darah_sistolik}/${rec.tekanan_darah_diastolik}` : '',
        gula_darah_sewaktu: rec.gula_darah_sewaktu ?? '',
        suhu_tubuh: rec.suhu_tubuh ?? '',
        kondisi_ibu: rec.kondisi_ibu ?? '',
        catatan: rec.catatan ?? '',
        kondisi: rec.kondisi ?? '',
        asi_eksklusif: rec.asi_eksklusif ?? false,
        fasilitasi_bantuan_sosial: rec.fasilitasi_bantuan_sosial ?? false,
        jumlah_anak: rec.jumlah_anak ?? '',
        riwayat_penyakit: rec.riwayat_penyakit ?? '',
        kadar_hemoglobin: rec.kadar_hemoglobin ?? '',
        berat_janin: rec.berat_janin ?? '',
        terpapar_rokok: rec.terpapar_rokok ?? false,
        kie: rec.kie ?? false,
        suplemen_tambah_darah: rec.suplemen_tambah_darah ?? false,
        tinggi_badan_bayi: rec.tinggi_badan_bayi ?? '',
        berat_badan_bayi: rec.berat_badan_bayi ?? '',
        fasilitasi_rujukan: rec.fasilitasi_rujukan ?? false,
        tanggal_kunjungan_berikut: rec.tanggal_kunjungan_berikut ? toDateInputValue(rec.tanggal_kunjungan_berikut) : '',
      })
    }
  }, [open, initialData, defaultTanggalPersalinan, reset])

  const parseTd = (td: string) => {
    const p = td.split('/')
    if (p.length !== 2) return null
    const s = parseInt(p[0])
    const d = parseInt(p[1])
    if (isNaN(s) || isNaN(d)) return null
    return { s, d }
  }

  const onSubmit = async (values: any) => {
    try {
      let payload: any = {
        tanggal_kunjungan: values.tanggal_kunjungan,
        catatan: values.catatan || undefined,
        tanggal_kunjungan_berikut: values.tanggal_kunjungan_berikut || undefined,
      }

      if (isBalita) {
        payload = {
          ...payload,
          bb: parseFloat(values.bb) || undefined,
          tb: parseFloat(values.tb) || undefined,
          lingkar_kepala: parseFloat(values.lingkar_kepala) || undefined,
          lingkar_lengan_atas: parseFloat(values.lingkar_lengan_atas) || undefined,
          kondisi: values.kondisi || undefined,
          asi_eksklusif: values.asi_eksklusif ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
        }
      } else if (isBumil) {
        payload = {
          ...payload,
          bb: parseFloat(values.bb) || undefined,
          tb: parseFloat(values.tb) || undefined,
          lingkar_perut: parseFloat(values.lingkar_perut) || undefined,
          lingkar_lengan_atas: parseFloat(values.lingkar_lengan_atas) || undefined,
          usia_kehamilan_minggu: parseInt(values.usia_kehamilan_minggu) || undefined,
          hpht: values.hpht || undefined,
          htp: values.htp || undefined,
          jumlah_anak: parseInt(values.jumlah_anak) || undefined,
          riwayat_penyakit: values.riwayat_penyakit || undefined,
          kadar_hemoglobin: parseFloat(values.kadar_hemoglobin) || undefined,
          berat_janin: parseFloat(values.berat_janin) || undefined,
          terpapar_rokok: values.terpapar_rokok ?? undefined,
          kie: values.kie ?? undefined,
          suplemen_tambah_darah: values.suplemen_tambah_darah ?? undefined,
        }
      } else if (isLansia) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          bb: parseFloat(values.bb) || undefined,
          tb: parseFloat(values.tb) || undefined,
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          gula_darah_sewaktu: parseFloat(values.gula_darah_sewaktu) || undefined,
        }
      } else if (isPasca) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          tanggal_persalinan: values.tanggal_persalinan || undefined,
          bb: parseFloat(values.bb) || undefined,
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          suhu_tubuh: parseFloat(values.suhu_tubuh) || undefined,
          kondisi_ibu: values.kondisi_ibu || undefined,
          tinggi_badan_bayi: parseFloat(values.tinggi_badan_bayi) || undefined,
          berat_badan_bayi: parseFloat(values.berat_badan_bayi) || undefined,
          kie: values.kie ?? undefined,
          fasilitasi_rujukan: values.fasilitasi_rujukan ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
        }
      }

      if (isEdit && initialData) {
        await updateRecord({ kategori, id: initialData.id, payload })
      } else {
        await createRecord({ kategori, payload: { ...payload, warga_id: wargaId } })
      }

      reset()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isPending) onOpenChange(nextOpen)
    }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pemeriksaan' : 'Tambah Riwayat Pemeriksaan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui data hasil pemeriksaan.' : 'Tambahkan data hasil pemeriksaan baru.'}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <Field label="Tanggal Kunjungan" required>
              <Input register={register} name="tanggal_kunjungan" type="date" />
            </Field>

            {/* Balita / Baduta */}
            {isBalita && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Berat Badan Anak (kg)" required><Input register={register} name="bb" type="number" placeholder="8.5" /></Field>
                <Field label="Tinggi/Panjang Badan Anak (cm)" required><Input register={register} name="tb" type="number" placeholder="72" /></Field>
                <Field label="Lingkar Kepala (cm)" required><Input register={register} name="lingkar_kepala" type="number" placeholder="44" /></Field>
                <Field label="Lingkar Lengan Atas (cm)" required><Input register={register} name="lingkar_lengan_atas" type="number" placeholder="13.5" /></Field>
                <Field label="Kondisi"><Input register={register} name="kondisi" placeholder="Sehat" /></Field>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="asi_eksklusif" {...register('asi_eksklusif')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="asi_eksklusif" className="text-sm font-medium text-slate-700">ASI Eksklusif</label>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="fasilitasi_bantuan_sosial" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="fasilitasi_bantuan_sosial" className="text-sm font-medium text-slate-700">Bantuan Sosial</label>
                </div>
              </div>
            )}

            {/* Ibu Hamil */}
            {isBumil && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Usia Kehamilan (mgg)" required><Input register={register} name="usia_kehamilan_minggu" type="number" placeholder="28" /></Field>
                <Field label="Jumlah Anak"><Input register={register} name="jumlah_anak" type="number" placeholder="1" /></Field>
                <Field label="Berat Badan Ibu (kg)" required><Input register={register} name="bb" type="number" placeholder="55.5" /></Field>
                <Field label="Tinggi Badan Ibu (cm)" required><Input register={register} name="tb" type="number" placeholder="155" /></Field>
                <Field label="Lingkar Perut (cm)" required><Input register={register} name="lingkar_perut" type="number" placeholder="85" /></Field>
                <Field label="LILA (cm)" required><Input register={register} name="lingkar_lengan_atas" type="number" placeholder="24" /></Field>
                <Field label="HPHT" required><Input register={register} name="hpht" type="date" /></Field>
                <Field label="HTP" required><Input register={register} name="htp" type="date" /></Field>
                <Field label="Riwayat Penyakit"><Input register={register} name="riwayat_penyakit" placeholder="Tidak ada" /></Field>
                <Field label="Kadar HB"><Input register={register} name="kadar_hemoglobin" type="number" placeholder="12" /></Field>
                <Field label="Berat Janin (g)"><Input register={register} name="berat_janin" type="number" placeholder="1500" /></Field>
                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="terpapar_rokok" {...register('terpapar_rokok')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="terpapar_rokok" className="text-sm font-medium text-slate-700">Terpapar Rokok</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="kie" {...register('kie')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="kie" className="text-sm font-medium text-slate-700">KIE</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="suplemen_tambah_darah" {...register('suplemen_tambah_darah')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="suplemen_tambah_darah" className="text-sm font-medium text-slate-700">Suplemen TTD</label>
                  </div>
                </div>
              </div>
            )}

            {/* Lansia */}
            {isLansia && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Berat Badan Lansia (kg)" required><Input register={register} name="bb" type="number" placeholder="58" /></Field>
                <Field label="Tinggi Badan Lansia (cm)" required><Input register={register} name="tb" type="number" placeholder="160" /></Field>
                <Field label="Tekanan Darah (mmHg)" required>
                  <TdInput setValue={setValue} watch={watch} name="td" />
                </Field>
                <Field label="Gula Darah Sewaktu (mg/dL)" required><Input register={register} name="gula_darah_sewaktu" type="number" placeholder="120" /></Field>
              </div>
            )}

            {/* Pasca Persalinan */}
            {isPasca && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tanggal Persalinan" required><Input register={register} name="tanggal_persalinan" type="date" /></Field>
                <Field label="Berat Badan Ibu (kg)" required><Input register={register} name="bb" type="number" placeholder="62" /></Field>
                <Field label="Suhu Tubuh (°C)" required><Input register={register} name="suhu_tubuh" type="number" placeholder="36.5" /></Field>
                <div className="col-span-2">
                  <Field label="Tekanan Darah (mmHg)" required>
                    <TdInput setValue={setValue} watch={watch} name="td" />
                  </Field>
                </div>
                <Field label="Kondisi Ibu"><Input register={register} name="kondisi_ibu" placeholder="Baik, tidak ada keluhan" /></Field>
                <Field label="Tinggi Bayi (cm)"><Input register={register} name="tinggi_badan_bayi" type="number" placeholder="50" /></Field>
                <Field label="Berat Bayi (kg)"><Input register={register} name="berat_badan_bayi" type="number" placeholder="3.2" /></Field>
                
                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="kie_pasca" {...register('kie')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="kie_pasca" className="text-sm font-medium text-slate-700">KIE</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="fasilitasi_rujukan" {...register('fasilitasi_rujukan')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="fasilitasi_rujukan" className="text-sm font-medium text-slate-700">Fasilitasi Rujukan</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="fasilitasi_bantuan_sosial_pasca" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="fasilitasi_bantuan_sosial_pasca" className="text-sm font-medium text-slate-700">Bantuan Sosial</label>
                  </div>
                </div>
              </div>
            )}

            {!isLansia && (
              <Field label="Tgl Kunjungan Berikutnya">
                <Input register={register} name="tanggal_kunjungan_berikut" type="date" />
              </Field>
            )}

            <Field label="Catatan">
              <textarea
                {...register('catatan')}
                rows={2}
                placeholder="Catatan pemeriksaan..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
