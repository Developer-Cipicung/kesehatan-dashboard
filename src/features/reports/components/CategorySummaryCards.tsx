import { Card, CardContent } from '@/components/ui/card';
import { calculateIMT, classifyIMT, classifyTekananDarah } from '@/utils/kesehatan';

interface CategorySummaryCardsProps {
  kategori: string;
  data: any[];
}

export function CategorySummaryCards({ kategori, data }: CategorySummaryCardsProps) {
  if (!data || data.length === 0) return null;

  const total = data.length;

  const renderCard = (title: string, value: number, suffix: string = '', highlight?: 'green' | 'orange' | 'red') => {
    let pctColor = 'text-slate-500';
    if (highlight === 'green') pctColor = 'text-green-600';
    if (highlight === 'orange') pctColor = 'text-orange-500';
    if (highlight === 'red') pctColor = 'text-red-600';

    const percentage = total > 0 ? ((value / total) * 100).toFixed(1).replace('.', ',') + '%' : '0%';

    return (
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-slate-800">
              {value} {suffix && <span className="text-sm font-normal text-slate-500">{suffix}</span>}
            </span>
            {!suffix && <span className={`text-sm font-medium mt-1 ${pctColor}`}>({percentage})</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGroupedCard = (title: string, items: { label: string; value: number; color: string }[]) => (
    <Card className="col-span-2 md:col-span-2 border-l-4 border-l-primary bg-white shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">{title}</h3>
        <div className="flex flex-row gap-2">
          {items.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className={`text-xl font-bold mb-1 ${
                d.color === 'green' ? 'text-emerald-600' :
                d.color === 'red' ? 'text-rose-600' :
                d.color === 'orange' ? 'text-amber-600' :
                'text-blue-600'
              }`}>{d.value}</span>
              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight uppercase tracking-wide">{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (kategori === 'bumil') {
    let kek = { normal: 0, risiko: 0 };
    let hb = { normal: 0, ringan: 0, berat: 0 };

    data.forEach(item => {
      if (item.lingkar_lengan_atas) {
        if (Number(item.lingkar_lengan_atas) < 23.5) kek.risiko++;
        else kek.normal++;
      }

      if (item.kadar_hemoglobin) {
        const val = Number(item.kadar_hemoglobin);
        if (val < 8) hb.berat++;
        else if (val < 11) hb.ringan++;
        else hb.normal++;
      }
    });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 md:col-span-4 flex">
          <div className="w-1/2 md:w-1/4 pr-2">
            {renderCard('Total Data Pemeriksaan', total, 'kunjungan')}
          </div>
        </div>
        
        {renderGroupedCard('Status KEK (LILA)', [
          { label: 'Normal', value: kek.normal, color: 'green' },
          { label: 'Risiko KEK', value: kek.risiko, color: 'red' },
        ])}

        {renderGroupedCard('Kadar Hemoglobin', [
          { label: 'Normal', value: hb.normal, color: 'green' },
          { label: 'Anemia Ringan', value: hb.ringan, color: 'orange' },
          { label: 'Anemia Berat', value: hb.berat, color: 'red' },
        ])}
      </div>
    );
  }

  if (kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan') {
    let imtStats = { kurus: 0, normal: 0, gemuk_obesitas: 0 };
    let tdStats = { normal: 0, prahipertensi: 0, hipertensi: 0 };
    
    data.forEach(item => {
      const bb = item.bb ? Number(item.bb) : null;
      const tb = item.tb ? Number(item.tb) : null;
      const imt = calculateIMT(bb, tb);
      const klasifikasiImt = classifyIMT(imt).toLowerCase();
      if (klasifikasiImt === 'kurus') imtStats.kurus++;
      if (klasifikasiImt === 'normal') imtStats.normal++;
      if (klasifikasiImt === 'gemuk' || klasifikasiImt === 'obesitas') imtStats.gemuk_obesitas++;

      const klasifikasiTd = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik).toLowerCase();
      if (klasifikasiTd === 'hipotensi' || klasifikasiTd === 'normal') tdStats.normal++;
      if (klasifikasiTd === 'prahipertensi') tdStats.prahipertensi++;
      if (klasifikasiTd === 'hipertensi') tdStats.hipertensi++;
    });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 md:col-span-4 flex">
          <div className="w-1/2 md:w-1/4 pr-2">
            {renderCard('Total Data Pemeriksaan', total, 'kunjungan')}
          </div>
        </div>
        
        {renderGroupedCard('Indeks Massa Tubuh (IMT)', [
          { label: 'Normal', value: imtStats.normal, color: 'green' },
          { label: 'Kurus', value: imtStats.kurus, color: 'red' },
          { label: 'Gemuk/Obesitas', value: imtStats.gemuk_obesitas, color: 'orange' },
        ])}

        {renderGroupedCard('Tekanan Darah', [
          { label: 'Normal', value: tdStats.normal, color: 'green' },
          { label: 'Risiko (Pra)', value: tdStats.prahipertensi, color: 'orange' },
          { label: 'Hipertensi', value: tdStats.hipertensi, color: 'red' },
        ])}
      </div>
    );
  }

  if (kategori === 'balita' || kategori === 'baduta') {
    let gizi = { baik: 0, kurang_buruk: 0, lebih_obesitas: 0 };
    let tinggi = { normal: 0, pendek: 0, tinggi: 0 };
    let berat = { normal: 0, kurang: 0, lebih: 0 };

    data.forEach(item => {
      const g = item.status_gizi?.kategori_bb_tb?.toLowerCase() || '';
      if (g.includes('kurang') || g.includes('buruk')) gizi.kurang_buruk++;
      else if (g.includes('lebih') || g.includes('overweight') || g.includes('obesitas')) gizi.lebih_obesitas++;
      else if (g.includes('baik')) gizi.baik++;

      const t = item.status_gizi?.kategori_tb_u?.toLowerCase() || '';
      if (t.includes('pendek')) tinggi.pendek++;
      else if (t.includes('tinggi')) tinggi.tinggi++;
      else if (t.includes('normal')) tinggi.normal++;

      const b = item.status_gizi?.kategori_bb_u?.toLowerCase() || '';
      if (b.includes('kurang')) berat.kurang++;
      else if (b.includes('lebih') || b.includes('risiko')) berat.lebih++;
      else if (b.includes('normal')) berat.normal++;
    });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 md:col-span-4 flex">
          <div className="w-1/2 md:w-1/4 pr-2">
            {renderCard('Total Data Pemeriksaan', total, 'kunjungan')}
          </div>
        </div>
        
        {renderGroupedCard('Status Gizi (BB/TB)', [
          { label: 'Normal', value: gizi.baik, color: 'green' },
          { label: 'Kurang / Buruk', value: gizi.kurang_buruk, color: 'red' },
          { label: 'Lebih/Obesitas', value: gizi.lebih_obesitas, color: 'orange' },
        ])}

        {renderGroupedCard('Berat Badan (BB/U)', [
          { label: 'Normal', value: berat.normal, color: 'green' },
          { label: 'Kurang', value: berat.kurang, color: 'red' },
          { label: 'Risiko Lebih', value: berat.lebih, color: 'orange' },
        ])}

        {renderGroupedCard('Tinggi Badan (TB/U)', [
          { label: 'Normal', value: tinggi.normal, color: 'green' },
          { label: 'Pendek', value: tinggi.pendek, color: 'red' },
          { label: 'Tinggi', value: tinggi.tinggi, color: 'blue' },
        ])}
      </div>
    );
  }

  if (kategori === 'lansia') {
    let tdStats = { normal: 0, prahipertensi: 0, hipertensi: 0 };
    let gdStats = { normal: 0, tinggi: 0 };
    let kolStats = { normal: 0, tinggi: 0 };
    let auStats = { normal: 0, tinggi: 0 };
    
    data.forEach(item => {
      const klasifikasiTd = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik).toLowerCase();
      if (klasifikasiTd === 'hipotensi' || klasifikasiTd === 'normal') tdStats.normal++;
      if (klasifikasiTd === 'prahipertensi') tdStats.prahipertensi++;
      if (klasifikasiTd === 'hipertensi') tdStats.hipertensi++;

      if (item.gula_darah_sewaktu) {
        if (Number(item.gula_darah_sewaktu) > 200) gdStats.tinggi++;
        else gdStats.normal++;
      }
      
      if (item.kolesterol) {
        if (Number(item.kolesterol) > 200) kolStats.tinggi++;
        else kolStats.normal++;
      }
      
      if (item.asam_urat) {
        if (Number(item.asam_urat) > 7) auStats.tinggi++;
        else auStats.normal++;
      }
    });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 md:col-span-4 flex">
          <div className="w-1/2 md:w-1/4 pr-2">
            {renderCard('Total Data Pemeriksaan', total, 'kunjungan')}
          </div>
        </div>
        
        {renderGroupedCard('Tekanan Darah', [
          { label: 'Normal', value: tdStats.normal, color: 'green' },
          { label: 'Risiko (Pra)', value: tdStats.prahipertensi, color: 'orange' },
          { label: 'Hipertensi', value: tdStats.hipertensi, color: 'red' },
        ])}

        {renderGroupedCard('Gula Darah Sewaktu', [
          { label: 'Normal', value: gdStats.normal, color: 'green' },
          { label: 'Tinggi', value: gdStats.tinggi, color: 'red' },
        ])}

        {renderGroupedCard('Kolesterol', [
          { label: 'Normal', value: kolStats.normal, color: 'green' },
          { label: 'Tinggi', value: kolStats.tinggi, color: 'red' },
        ])}

        {renderGroupedCard('Asam Urat', [
          { label: 'Normal', value: auStats.normal, color: 'green' },
          { label: 'Tinggi', value: auStats.tinggi, color: 'red' },
        ])}
      </div>
    );
  }

  return null;
}
