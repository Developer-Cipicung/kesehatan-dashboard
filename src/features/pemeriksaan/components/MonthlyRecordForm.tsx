import { useEffect } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pemeriksaan } from '../services/pemeriksaanService'
import { useCreatePemeriksaan, useUpdatePemeriksaan } from '../hooks/usePemeriksaan'
import { useGetWargaById } from '@/features/warga/hooks/useWarga'

interface MonthlyRecordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: string
  wargaId: string
  initialData?: Pemeriksaan | null
  previousRecord?: Pemeriksaan | null
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

function Input({ register, name, type = 'text', placeholder, min, max, step }: { register: any; name: string; type?: string; placeholder?: string; min?: number; max?: number; step?: string }) {
  const { formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string
  return (
    <div>
      <input
        {...register(name, { valueAsNumber: type === 'number' ? true : false })}
        type={type}
        min={min}
        max={max}
        step={step || (type === 'number' ? 'any' : undefined)}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground ${error ? 'border-red-500' : 'border-input'}`}
      />
      {error && <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">{error}</p>}
    </div>
  )
}

function TdInput({ setValue, watch, name }: { setValue: any; watch: any; name: string }) {
  const { formState: { errors } } = useFormContext()
  const error = (errors[name]?.message || errors['tekanan_darah_sistolik']?.message || errors['tekanan_darah_diastolik']?.message) as string
  const val = watch(name) || ''
  const parts = val.split('/')
  const s = parts[0] || ''
  const d = parts[1] || ''
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={s}
          onChange={e => setValue(name, `${e.target.value}${d ? '/' + d : ''}`)}
          placeholder="120"
          className={`w-20 sm:w-24 h-10 rounded-md border bg-background px-3 py-2 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${error ? 'border-red-500' : 'border-input'}`}
        />
        <span className="text-slate-400 font-bold">/</span>
        <input
          type="number"
          value={d}
          onChange={e => setValue(name, `${s ? s + '/' : ''}${e.target.value}`)}
          placeholder="80"
          className={`w-20 sm:w-24 h-10 rounded-md border bg-background px-3 py-2 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${error ? 'border-red-500' : 'border-input'}`}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">{error}</p>}
    </div>
  )
}

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

const parseNum = (val: any, isInt = false) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = isInt ? parseInt(val, 10) : parseFloat(val);
  return isNaN(num) ? undefined : num;
}

export function MonthlyRecordForm({ open, onOpenChange, kategori, wargaId, initialData, previousRecord, defaultTanggalPersalinan }: MonthlyRecordFormProps) {
  const { mutateAsync: createRecord, isPending: isCreating } = useCreatePemeriksaan()
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdatePemeriksaan()

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const isEdit = !!initialData
  
  const { data: wargaResponse } = useGetWargaById(wargaId, undefined)
  const warga = wargaResponse
  const mutationPending = isCreating || isUpdating

  const methods = useForm<any>()
  const { register, handleSubmit, watch, setValue, reset } = methods
  const isPending = mutationPending || methods.formState.isSubmitting

  useEffect(() => {
    if (open) {
      const isNew = !initialData;
      const rec: any = initialData || {}
      const prev: any = previousRecord || {}

      reset({
        tanggal_kunjungan: rec.tanggal_kunjungan ? toDateInputValue(rec.tanggal_kunjungan) : new Date().toISOString().split('T')[0],
        tanggal_persalinan: toDateInputValue(rec.tanggal_persalinan || defaultTanggalPersalinan) || new Date().toISOString().split('T')[0],
        bb: rec.bb ?? '',
        tb: rec.tb ?? (isNew && isBumil ? (prev.tb ?? '') : ''),
        lingkar_kepala: rec.lingkar_kepala ?? '',
        lingkar_lengan_atas: rec.lingkar_lengan_atas ?? '',
        lingkar_perut: rec.lingkar_perut ?? '',
        tinggi_fundus: rec.tinggi_fundus ?? '',
        usia_kehamilan_minggu: rec.usia_kehamilan_minggu ?? '',
        td: (rec.tekanan_darah_sistolik && rec.tekanan_darah_diastolik) ? `${rec.tekanan_darah_sistolik}/${rec.tekanan_darah_diastolik}` : '',
        gula_darah_sewaktu: rec.gula_darah_sewaktu ?? '',
        suhu_tubuh: rec.suhu_tubuh ?? '',
        kondisi_ibu: rec.kondisi_ibu ?? '',
        catatan: rec.catatan ?? '',
        kondisi: rec.kondisi ?? '',
        asi_eksklusif: rec.asi_eksklusif ?? false,
        fasilitasi_bantuan_sosial: rec.fasilitasi_bantuan_sosial ?? false,
        jumlah_anak: rec.jumlah_anak ?? (isNew && isBumil ? (prev.jumlah_anak ?? '') : ''),
        riwayat_penyakit: rec.riwayat_penyakit ?? (isNew && isBumil ? (prev.riwayat_penyakit ?? '') : ''),
        kadar_hemoglobin: rec.kadar_hemoglobin ?? '',
        berat_janin: rec.berat_janin ?? '',
        terpapar_rokok: rec.terpapar_rokok ?? false,
        kie: rec.kie ?? false,
        suplemen_tambah_darah: rec.suplemen_tambah_darah ?? '',
        mms: rec.mms ?? '',
        tinggi_badan_bayi: rec.tinggi_badan_bayi ?? '',
        berat_badan_bayi: rec.berat_badan_bayi ?? '',
        fasilitasi_rujukan: rec.fasilitasi_rujukan ?? false,
        nama_ibu: rec.nama_ibu ?? (isNew ? (prev.nama_ibu ?? '') : ''),
        penggunaan_kontrasepsi: rec.penggunaan_kontrasepsi ?? (isNew ? (prev.penggunaan_kontrasepsi ?? '') : ''),
        tanggal_kunjungan_berikut: rec.tanggal_kunjungan_berikut ? toDateInputValue(rec.tanggal_kunjungan_berikut) : (isNew ? (() => {
          const d = new Date()
          d.setMonth(d.getMonth() + 1)
          return d.toISOString().split('T')[0]
        })() : ''),
      })
    }
  }, [open, initialData, previousRecord, defaultTanggalPersalinan, reset, isBumil])

  const tglWatch = watch('tanggal_kunjungan')

  useEffect(() => {
    if (isBumil && warga?.hpht && tglWatch) {
      const hphtDate = new Date(warga.hpht)
      const tglDate = new Date(tglWatch)
      const diffTime = tglDate.getTime() - hphtDate.getTime()
      if (diffTime >= 0) {
        const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        if (weeks <= 45 && !(initialData as any)?.usia_kehamilan_minggu) {
          setValue('usia_kehamilan_minggu', weeks)
        }
      }
    }
  }, [warga?.hpht, tglWatch, isBumil, setValue, initialData])

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
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          lingkar_kepala: parseNum(values.lingkar_kepala),
          lingkar_lengan_atas: parseNum(values.lingkar_lengan_atas),
          kondisi: values.kondisi || undefined,
          asi_eksklusif: values.asi_eksklusif ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
          nama_ibu: values.nama_ibu || undefined,
          penggunaan_kontrasepsi: values.penggunaan_kontrasepsi || undefined,
        }
      } else if (isBumil) {
        payload = {
          ...payload,
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          lingkar_perut: parseNum(values.lingkar_perut),
          lingkar_lengan_atas: parseNum(values.lingkar_lengan_atas),
          tinggi_fundus: parseNum(values.tinggi_fundus),
          usia_kehamilan_minggu: parseNum(values.usia_kehamilan_minggu, true),
          jumlah_anak: parseNum(values.jumlah_anak, true),
          riwayat_penyakit: values.riwayat_penyakit || undefined,
          kadar_hemoglobin: parseNum(values.kadar_hemoglobin),
          berat_janin: parseNum(values.berat_janin),
          terpapar_rokok: values.terpapar_rokok ?? undefined,
          kie: values.kie ?? undefined,
          suplemen_tambah_darah: parseNum(values.suplemen_tambah_darah, true),
          mms: parseNum(values.mms, true),
          fasilitasi_rujukan: values.fasilitasi_rujukan ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
        }
      } else if (isLansia) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          gula_darah_sewaktu: parseNum(values.gula_darah_sewaktu),
        }
      } else if (isPasca) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          tanggal_persalinan: values.tanggal_persalinan || undefined,
          bb: parseNum(values.bb),
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          suhu_tubuh: parseNum(values.suhu_tubuh),
          kondisi_ibu: values.kondisi_ibu || undefined,
          tinggi_badan_bayi: parseNum(values.tinggi_badan_bayi),
          berat_badan_bayi: parseNum(values.berat_badan_bayi),
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
      toast.success('Data berhasil disimpan')
    } catch (err: any) {
      console.error(err)
      if (err.response?.data?.errors?.length > 0) {
        err.response.data.errors.forEach((error: any) => {
          if (error.path && error.path.length > 0) {
            let fieldName = error.path[0] as string;
            if (fieldName === 'tekanan_darah_sistolik' || fieldName === 'tekanan_darah_diastolik') {
              fieldName = 'td';
            }
            methods.setError(fieldName as any, { type: 'server', message: error.message });
          }
        });
        toast.error('Gagal menyimpan: periksa kembali isian formulir')
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Terjadi kesalahan saat menyimpan data')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isPending) onOpenChange(nextOpen)
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
                <Field label="Nama Ibu"><Input register={register} name="nama_ibu" placeholder="Nama Ibu" /></Field>
                <Field label="Penggunaan Kontrasepsi">
                  <select {...register('penggunaan_kontrasepsi')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Pilih KB...</option>
                    <option value="Pil">Pil</option>
                    <option value="Suntik">Suntik</option>
                    <option value="IUD">IUD</option>
                    <option value="Implan">Implan</option>
                    <option value="Kondom">Kondom</option>
                    <option value="MOW">MOW</option>
                    <option value="MOP">MOP</option>
                    <option value="Tidak Pakai">Tidak Pakai</option>
                  </select>
                </Field>
                <Field label="Berat Badan Anak (kg)" required><Input register={register} name="bb" type="number" placeholder="8.5" /></Field>
                <Field label="Tinggi/Panjang Badan Anak (cm)" required><Input register={register} name="tb" type="number" placeholder="72" /></Field>
                <Field label="Kondisi Bayi"><Input register={register} name="kondisi" placeholder="Sehat" /></Field>
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
                <Field label="Usia Kandungan (Minggu)" required>
                  <Input register={register} name="usia_kehamilan_minggu" type="number" placeholder="28" max={45} min={0} />
                  {watch('usia_kehamilan_minggu') > 42 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Lewat Waktu (Normal 37-42 mgg)</p>
                  )}
                </Field>
                <Field label="Anak Ke"><Input register={register} name="jumlah_anak" type="number" placeholder="1" max={20} min={0} /></Field>
                <Field label="Berat Badan (kg)" required><Input register={register} name="bb" type="number" placeholder="60.5" max={200} min={0} /></Field>
                <Field label="Tinggi Badan (cm)" required><Input register={register} name="tb" type="number" placeholder="155" max={250} min={0} /></Field>
                <Field label="IMT">
                  {(() => {
                    const bb = watch('bb')
                    const tb = watch('tb')
                    if (bb && tb && bb > 0 && tb > 0) {
                      const tbM = tb / 100
                      const bmi = bb / (tbM * tbM)
                      
                      let status = ''
                      let color = ''
                      if (bmi < 18.5) {
                        status = 'Kurus'
                        color = 'text-amber-700 bg-amber-50 border-amber-200'
                      } else if (bmi < 25.0) {
                        status = 'Normal'
                        color = 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      } else if (bmi <= 27.0) {
                        status = 'Gemuk'
                        color = 'text-amber-700 bg-amber-50 border-amber-200'
                      } else {
                        status = 'Obesitas'
                        color = 'text-red-700 bg-red-50 border-red-200'
                      }

                      return (
                        <div className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-bold ${color}`}>
                          <span>{bmi.toFixed(1)}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/50">{status}</span>
                        </div>
                      )
                    }
                    return (
                      <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                        -
                      </div>
                    )
                  })()}
                </Field>
                <Field label="Lingkar Perut (cm)" required><Input register={register} name="lingkar_perut" type="number" placeholder="85" max={200} min={0} /></Field>
                <Field label="Tinggi Fundus (cm)"><Input register={register} name="tinggi_fundus" type="number" placeholder="20" max={100} min={0} /></Field>
                <Field label="LILA (cm)" required>
                  <Input register={register} name="lingkar_lengan_atas" type="number" placeholder="24" max={60} min={0} />
                  {watch('lingkar_lengan_atas') > 0 && watch('lingkar_lengan_atas') < 23.5 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Risiko KEK</p>
                  )}
                </Field>
                <Field label="Riwayat Penyakit"><Input register={register} name="riwayat_penyakit" placeholder="Tidak ada" /></Field>
                <Field label="Kadar HB" required>
                  <Input register={register} name="kadar_hemoglobin" type="number" placeholder="12" max={30} min={0} />
                  {watch('kadar_hemoglobin') > 0 && watch('kadar_hemoglobin') < 11 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Risiko Anemia</p>
                  )}
                </Field>
                <Field label="Berat Janin (kg)"><Input register={register} name="berat_janin" type="number" placeholder="1.5" max={10} min={0} /></Field>
                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="terpapar_rokok" {...register('terpapar_rokok')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="terpapar_rokok" className="text-sm font-medium text-slate-700">Terpapar Rokok</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="kie" {...register('kie')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="kie" className="text-sm font-medium text-slate-700">KIE</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Field label="TTD (Tablet)"><Input register={register} name="suplemen_tambah_darah" type="number" placeholder="30" min={0} /></Field>
                  <Field label="MMS (Tablet)"><Input register={register} name="mms" type="number" placeholder="30" min={0} /></Field>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="bumil_rujukan" {...register('fasilitasi_rujukan')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="bumil_rujukan" className="text-sm font-medium text-slate-700">Rujukan</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="bumil_bansos" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="bumil_bansos" className="text-sm font-medium text-slate-700">Bansos</label>
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
                <Field label="Kolesterol (mg/dL)"><Input register={register} name="kolesterol" type="number" placeholder="150" /></Field>
                <Field label="Asam Urat (mg/dL)"><Input register={register} name="asam_urat" type="number" placeholder="5.5" step="0.1" /></Field>
              </div>
            )}

            {/* Pasca Persalinan */}
            {isPasca && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tanggal Persalinan" required><Input register={register} name="tanggal_persalinan" type="date" /></Field>
                <Field label="Tinggi Badan Ibu (cm)"><Input register={register} name="tb" type="number" placeholder="155" /></Field>
                <Field label="Berat Badan Ibu (kg)" required><Input register={register} name="bb" type="number" placeholder="62" /></Field>
                <Field label="Tekanan Darah (mmHg)" required>
                  <TdInput setValue={setValue} watch={watch} name="td" />
                </Field>
                <div className="col-span-2">
                  <Field label="Kondisi Ibu"><Input register={register} name="kondisi_ibu" placeholder="Baik, tidak ada keluhan" /></Field>
                </div>
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
