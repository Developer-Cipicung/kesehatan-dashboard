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

  const renderRiwayatKesehatan = () => {
    let checkups: any[] = [];
    let type = '';

    if (warga.pemeriksaan_balita_baduta && warga.pemeriksaan_balita_baduta.length > 0) {
      checkups = warga.pemeriksaan_balita_baduta;
      type = 'balita';
    } else if (warga.pemeriksaan_bumil && warga.pemeriksaan_bumil.length > 0) {
      checkups = warga.pemeriksaan_bumil;
      type = 'bumil';
    } else if (warga.pemeriksaan_pasca_persalinan && warga.pemeriksaan_pasca_persalinan.length > 0) {
      checkups = warga.pemeriksaan_pasca_persalinan;
      type = 'pasca';
    } else if (warga.pemeriksaan_lansia && warga.pemeriksaan_lansia.length > 0) {
      checkups = warga.pemeriksaan_lansia;
      type = 'lansia';
    }

    if (checkups.length === 0) {
      return <p className="text-xs sm:text-sm font-medium text-slate-500 italic mt-1">Belum ada riwayat kesehatan terdata.</p>;
    }

    // Sort by date descending and take top 3
    const recentCheckups = [...checkups]
      .sort((a, b) => new Date(b.tanggal_kunjungan || b.tanggal_pemeriksaan).getTime() - new Date(a.tanggal_kunjungan || a.tanggal_pemeriksaan).getTime())
      .slice(0, 3);

    const formatStatusGizi = (p: any) => {
      const gizi = [];
      if (p.zscore_bb_u != null) {
        const val = parseFloat(p.zscore_bb_u);
        if (val < -3) gizi.push('BB Sangat Kurang');
        else if (val < -2) gizi.push('BB Kurang');
      }
      if (p.zscore_tb_u != null) {
        const val = parseFloat(p.zscore_tb_u);
        if (val < -3) gizi.push('Sangat Pendek');
        else if (val < -2) gizi.push('Pendek');
      }
      if (p.zscore_bb_tb != null) {
        const val = parseFloat(p.zscore_bb_tb);
        if (val < -3) gizi.push('Gizi Buruk');
        else if (val < -2) gizi.push('Gizi Kurang');
        else if (val > 3) gizi.push('Obesitas');
        else if (val > 2) gizi.push('Gizi Lebih');
        else if (val > 1) gizi.push('Berisiko Lebih');
      }
      return gizi.length > 0 ? gizi.join(', ') : 'Normal';
    };

    const calculateIMT = (bb: any, tb: any) => {
      if (!bb || !tb) return null;
      const weight = parseFloat(bb);
      const heightCm = parseFloat(tb);
      if (heightCm <= 0 || weight <= 0) return null;
      const heightM = heightCm / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    };

    return (
      <div className="space-y-1 mt-2">
        {recentCheckups.map((p, idx) => {
          const rawDate = p.tanggal_kunjungan || p.tanggal_pemeriksaan;
          const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
          let info = '';
          
          if (type === 'balita') {
            info = `BB: ${p.bb || '-'}kg | TB: ${p.tb || '-'}cm`;
          } else if (type === 'bumil') {
            const imt = calculateIMT(p.bb || p.berat_badan, p.tb);
            info = `BB: ${p.bb || p.berat_badan || '-'}kg | TB: ${p.tb || '-'}cm | IMT: ${imt || '-'} | LILA: ${p.lingkar_lengan_atas || '-'}cm | Usia: ${p.usia_kehamilan_minggu || '-'} mgg | L.Perut: ${p.lingkar_perut || '-'}cm | L.Fundus: ${p.tinggi_fundus || '-'}cm`;
          } else if (type === 'pasca') {
            const imt = calculateIMT(p.berat_badan_ibu, p.tb);
            info = `BB Ibu: ${p.berat_badan_ibu || '-'}kg | TB Ibu: ${p.tb || '-'}cm | IMT Ibu: ${imt || '-'} | BB Bayi: ${p.berat_badan_bayi || '-'}kg | TB Bayi: ${p.tinggi_badan_bayi || '-'}cm`;
          } else if (type === 'lansia') {
            const imt = calculateIMT(p.bb, p.tb);
            info = `Tensi: ${p.tekanan_darah_sistolik || '-'}/${p.tekanan_darah_diastolik || '-'} | BB: ${p.bb || '-'}kg | TB: ${p.tb || '-'}cm | IMT: ${imt || '-'} | L.Perut: ${p.lingkar_perut || '-'}cm`;
          }

          const statusKesehatan = type === 'balita' ? (p.kondisi || p.catatan || '-') :
                                  type === 'bumil' ? (p.riwayat_penyakit || p.catatan || '-') :
                                  type === 'pasca' ? (p.kondisi_ibu || p.catatan || '-') :
                                  (p.catatan || '-');

          return (
            <div key={idx} className="flex flex-col text-xs sm:text-[13px] border-b border-slate-200/60 print:border-slate-300 py-1.5 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-semibold text-slate-700 print:text-black shrink-0">{dateStr}</span>
                <span className="text-slate-600 print:text-black text-right font-medium">{info}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-[11px] sm:text-xs">
                {type === 'balita' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Status Gizi:</span>
                    <span className={`font-semibold print:text-black ${formatStatusGizi(p) === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatStatusGizi(p)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-600">Status Kesehatan:</span>
                  <span className="text-slate-700 print:text-black text-right truncate max-w-[200px]">
                    {statusKesehatan}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Tempat, Tgl Lahir</p>
              <p className="text-sm sm:text-base font-semibold text-slate-700 print:text-black">
                {warga.tempat_lahir || '-'}, {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Kategori / JK</p>
              <p className="text-sm sm:text-base font-medium text-slate-700 print:text-black">
                <span className="text-primary print:text-black font-semibold">{getKategori(warga)}</span> / {warga.jenis_kelamin === 'L' ? 'L' : 'P'}
              </p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Golongan Darah</p>
              <p className="text-sm sm:text-base font-bold text-red-500 print:text-black">
                {warga.golongan_darah || '-'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Alamat Domisili</p>
            <p className="text-sm font-medium text-slate-700 print:text-black leading-snug mt-0.5">
              {warga.alamat || '-'} 
              {warga.rt || warga.rw ? ` RT ${warga.rt || '-'}/RW ${warga.rw || '-'}` : ''}
              {warga.kelurahan ? `, ${warga.kelurahan}` : ''}
            </p>
          </div>
          
          <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Riwayat Pemeriksaan Terakhir</p>
            {renderRiwayatKesehatan()}
          </div>

          {(() => {
            const kat = getKategori(warga);
            let capsules: string[] = [];
            
            if (kat === 'Ibu Hamil' && warga.pemeriksaan_bumil?.[0]) {
              const p = warga.pemeriksaan_bumil[0];
              if (p.terpapar_rokok) capsules.push('Terpapar Asap Rokok');
              if (p.kie) capsules.push('Telah Edukasi KIE');
              if (p.suplemen_tambah_darah) capsules.push(`TTD: ${p.suplemen_tambah_darah}`);
              if (p.fasilitasi_rujukan) capsules.push('Dirujuk ke RS/Puskesmas');
              if (p.fasilitasi_bantuan_sosial) capsules.push('Menerima Bansos');
            } else if (kat === 'Ibu Pasca Salin' && warga.pemeriksaan_pasca_persalinan?.[0]) {
              const p = warga.pemeriksaan_pasca_persalinan[0];
              if (warga.penggunaan_kontrasepsi) capsules.push(`KB: ${warga.penggunaan_kontrasepsi}`);
              if (p.kie) capsules.push('Telah Edukasi KIE');
              if (p.fasilitasi_rujukan) capsules.push('Dirujuk ke RS/Puskesmas');
              if (p.fasilitasi_bantuan_sosial) capsules.push('Menerima Bansos');
            } else if (kat === 'Lansia' && warga.pemeriksaan_lansia?.[0]) {
              const p = warga.pemeriksaan_lansia[0];
              if (p.kolesterol) capsules.push(`Kolesterol: ${p.kolesterol}`);
              if (p.asam_urat) capsules.push(`Asam Urat: ${p.asam_urat}`);
              if (p.gula_darah_sewaktu) capsules.push(`GDS: ${p.gula_darah_sewaktu}`);
            }

            if (capsules.length === 0) return null;

            return (
              <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs mb-2">Informasi Tambahan</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {capsules.map((cap, idx) => (
                    <span key={idx} className="bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] print:bg-white print:border print:border-black print:text-black print:px-2 print:py-0.5">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {getKategori(warga) === 'Balita / Baduta' && (
            <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs mb-2">Riwayat Imunisasi</p>
              {warga.riwayat_imunisasi && warga.riwayat_imunisasi.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {[...warga.riwayat_imunisasi]
                    .sort((a, b) => new Date(a.tanggal_pemberian).getTime() - new Date(b.tanggal_pemberian).getTime())
                    .map((imun, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] print:bg-white print:border print:border-black print:text-black print:px-2 print:py-0.5">
                        {imun.jenis_vaksin}
                      </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-medium text-slate-500 italic mt-1">Belum ada riwayat imunisasi.</p>
              )}
            </div>
          )}
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
