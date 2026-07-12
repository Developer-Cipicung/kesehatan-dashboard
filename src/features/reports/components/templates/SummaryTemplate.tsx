import React from 'react';

interface SummaryTemplateProps {
  bulan: number;
  tahun: number;
  data: any; // We'll assume this is dashboard stats data
}

export const SummaryTemplate: React.FC<SummaryTemplateProps> = ({ bulan, tahun, data }) => {
  const getBulanStr = (m: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[m - 1] || '';
  };

  return (
    <div className="w-full bg-white print:bg-white text-black text-sm font-sans p-8 print:p-0">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="font-bold text-xl uppercase">RINGKASAN KESELURUHAN SASARAN POSYANDU</h1>
        <h2 className="font-bold text-lg">BULAN {getBulanStr(bulan).toUpperCase()} {tahun}</h2>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="border border-black p-4">
          <h3 className="font-bold border-b border-black pb-2 mb-4">Total Warga (Semua)</h3>
          <p className="text-4xl font-bold text-center">{data?.total_warga || 0}</p>
        </div>
        <div className="border border-black p-4">
          <h3 className="font-bold border-b border-black pb-2 mb-4">Total Anak Usia 0-59 Bulan</h3>
          <p className="text-4xl font-bold text-center">{data?.total_balita || 0}</p>
        </div>
        <div className="border border-black p-4">
          <h3 className="font-bold border-b border-black pb-2 mb-4">Total Ibu Hamil</h3>
          <p className="text-4xl font-bold text-center">{data?.total_bumil || 0}</p>
        </div>
        <div className="border border-black p-4">
          <h3 className="font-bold border-b border-black pb-2 mb-4">Total Lansia</h3>
          <p className="text-4xl font-bold text-center">{data?.total_lansia || 0}</p>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500 italic">
        Dokumen ini digenerate secara otomatis oleh sistem Dashboard Kesehatan Cipicung.
      </div>
    </div>
  );
};
