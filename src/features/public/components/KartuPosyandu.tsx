import React from 'react';
import { Warga } from '../../warga/services/wargaService';

interface KartuPosyanduProps {
  warga: Warga;
}

export const KartuPosyandu: React.FC<KartuPosyanduProps> = ({ warga }) => {
  const getKategori = (w: Warga) => {
    if (w.status_kehamilan === 'HAMIL') return 'Ibu Hamil';
    if (w.status_kehamilan === 'PASCA_PERSALINAN') return 'Ibu Pasca Salin';
    const ageMs = Date.now() - new Date(w.tanggal_lahir).getTime();
    const ageYrs = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYrs <= 5) return 'Balita / Baduta';
    if (ageYrs >= 60) return 'Lansia';
    return 'Warga';
  };

  const getPemeriksaanTerakhir = () => {
    if (warga.pemeriksaan_balita_baduta?.[0]) {
      const p = warga.pemeriksaan_balita_baduta[0];
      return `BB: ${p.bb}kg, TB: ${p.tb}cm`;
    }
    if (warga.pemeriksaan_bumil?.[0]) {
      const p = warga.pemeriksaan_bumil[0];
      return `BB: ${p.bb}kg, LILA: ${p.lingkar_lengan_atas}cm`;
    }
    if (warga.pemeriksaan_pasca_persalinan?.[0]) {
      const p = warga.pemeriksaan_pasca_persalinan[0];
      return `Tensi: ${p.tekanan_darah_sistolik}/${p.tekanan_darah_diastolik} mmHg`;
    }
    if (warga.pemeriksaan_lansia?.[0]) {
      const p = warga.pemeriksaan_lansia[0];
      return `Tensi: ${p.tekanan_darah_sistolik}/${p.tekanan_darah_diastolik}, GDS: ${p.gula_darah_sewaktu}`;
    }
    return 'Belum ada data pemeriksaan terbaru';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 
        This wrapper is styles differently in screen vs print. 
        In screen: glassmorphism, glowing effects, shadows.
        In print: solid white, black text, sharp borders.
      */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-500
        bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        print:bg-white print:border-black print:border-2 print:shadow-none print:rounded-lg print:text-black
      ">
        {/* Background Decorative Blob - Only visible on screen */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl print:hidden pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl print:hidden pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent print:text-black print:bg-none">
              Kartu Posyandu
            </h1>
            <p className="text-sm text-slate-500 font-medium print:text-slate-800">
              {(warga as any).posyandu?.nama || 'Posyandu Digital'}
            </p>
          </div>
          {/* Posyandu Logo placeholder */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 print:border-black">
            <span className="text-primary text-xs font-bold print:text-black">PSYD</span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Nama Lengkap</p>
            <p className="text-base sm:text-lg font-bold text-slate-800 uppercase print:text-black">{warga.nama}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">NIK</p>
              <p className="text-xs sm:text-base font-semibold text-slate-700 tracking-normal sm:tracking-widest print:text-black print:tracking-widest">{warga.nik}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Tanggal Lahir</p>
              <p className="text-sm sm:text-base font-semibold text-slate-700 print:text-black">
                {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Kategori</p>
              <p className="text-sm sm:text-base font-medium text-primary print:text-black">{getKategori(warga)}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Jenis Kelamin</p>
              <p className="text-sm sm:text-base font-medium text-slate-700 print:text-black">{warga.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
            </div>
          </div>
          
          <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Info Medis Terakhir</p>
            <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 print:text-black">{getPemeriksaanTerakhir()}</p>
          </div>
        </div>

        {/* Barcode/QR Code Placeholder for physical prints */}
        <div className="mt-6 flex justify-center print:block hidden">
          <div className="w-full h-12 bg-slate-200 border border-slate-300 flex items-center justify-center">
            <span className="text-xs text-slate-500">[ AREA BARCODE / QR CODE ]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
