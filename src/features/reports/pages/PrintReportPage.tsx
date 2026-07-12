import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VisumTemplate } from '../components/templates/VisumTemplate';
import { SummaryTemplate } from '../components/templates/SummaryTemplate';
import { Printer, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react';
import { useGetPemeriksaanList } from '@/features/pemeriksaan/hooks/usePemeriksaan';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton';

export function PrintReportPage() {
  const [searchParams] = useSearchParams();
  const [kategoriRaw, setKategoriRaw] = useState(searchParams.get('kategori') || 'baduta');
  const bulan = parseInt(searchParams.get('bulan') || `${new Date().getMonth() + 1}`);
  const tahun = parseInt(searchParams.get('tahun') || `${new Date().getFullYear()}`);
  const posyanduId = searchParams.get('posyanduId') || 'all';

  const [paperSize, setPaperSize] = useState<'A4' | 'F4' | 'Legal' | 'Letter'>('F4');
  const [zoom, setZoom] = useState(1);

  // Update URL when category changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('kategori', kategoriRaw);
    window.history.replaceState(null, '', `?${newParams.toString()}`);
  }, [kategoriRaw, searchParams]);

  // Map to API query categories (since API uses 'balita' for both balita & baduta)
  const queryKategori = (kategoriRaw === 'baduta' || kategoriRaw === 'balita' || kategoriRaw === 'summary') ? 'balita' : kategoriRaw;

  // For regular reports
  const { data: pemeriksaanData, isLoading: isPemeriksaanLoading } = useGetPemeriksaanList(queryKategori, {
    bulan,
    tahun,
    posyanduId: posyanduId === 'all' ? undefined : posyanduId,
    limit: 1000 // Get all for report
  });

  // For summary
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardStats(posyanduId === 'all' ? 'all' : posyanduId);

  const isLoading = kategoriRaw === 'summary' ? isDashboardLoading : isPemeriksaanLoading;

  const getPaperDimensions = () => {
    switch (paperSize) {
      case 'A4': return { width: '297mm', height: '210mm' };
      case 'Legal': return { width: '355.6mm', height: '215.9mm' };
      case 'Letter': return { width: '279.4mm', height: '215.9mm' };
      case 'F4': default: return { width: '330mm', height: '215mm' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Add landscape page style dynamically to document head for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @page {
        size: ${paperSize.toLowerCase()} landscape;
        margin: 10mm;
      }
      @media print {
        body { margin: 0; padding: 0; background: white; }
        .no-print { display: none !important; }
        .print-container { transform: none !important; box-shadow: none !important; border: none !important; width: 100% !important; height: auto !important; margin: 0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [paperSize]);

  if (isLoading) {
    return <div className="p-10"><SkeletonCard /></div>;
  }

  // Filter for baduta/balita specifically since API mixes them
  let filteredData = pemeriksaanData?.data || [];
  if (kategoriRaw === 'baduta') {
    filteredData = filteredData.filter((item: any) => {
      if (!item.warga?.tanggal_lahir) return false;
      const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date();
      return isBadutaByBirthDate(item.warga.tanggal_lahir, tglKunjungan);
    });
  } else if (kategoriRaw === 'balita') {
    filteredData = filteredData.filter((item: any) => {
      if (!item.warga?.tanggal_lahir) return false;
      const tglKunjungan = item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date();
      return isBalitaByBirthDate(item.warga.tanggal_lahir, tglKunjungan);
    });
  }

  // Group by posyandu if it's 'all'
  let posyanduGroups: any = {};
  if (posyanduId === 'all') {
    if (filteredData.length === 0) {
      posyanduGroups = { 'all': { name: 'Semua Posyandu (Kosong)', data: [] } };
    } else {
      posyanduGroups = filteredData.reduce((acc: any, curr: any) => {
        const pid = curr.warga?.posyandu_id || 'unknown';
        if (!acc[pid]) acc[pid] = { name: curr.warga?.posyandu?.nama || 'Posyandu Lainnya', data: [] };
        acc[pid].data.push(curr);
        return acc;
      }, {});
    }
  } else {
    posyanduGroups = { [posyanduId]: { name: filteredData[0]?.warga?.posyandu?.nama || 'Posyandu Saya', data: filteredData } };
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans">
      {/* TOOLBAR */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-300 shadow-sm flex flex-wrap items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.close()} title="Tutup">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-800 leading-tight">Print Preview Laporan</h1>
            <p className="text-xs text-slate-500 capitalize">Visum TPK - {kategoriRaw.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 hidden sm:block">Kategori:</label>
            <select 
              className="border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
              value={kategoriRaw}
              onChange={(e: any) => setKategoriRaw(e.target.value)}
            >
              <option value="summary">Ringkasan Keseluruhan</option>
              <option value="baduta">Baduta (0-23 Bulan)</option>
              <option value="balita">Balita (0-59 Bulan)</option>
              <option value="bumil">Ibu Hamil</option>
              <option value="pasca_persalinan">Pasca Persalinan</option>
              <option value="lansia">Lansia</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 hidden sm:block">Kertas:</label>
            <select 
              className="border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
              value={paperSize}
              onChange={(e: any) => setPaperSize(e.target.value)}
            >
              <option value="F4">F4 (Folio)</option>
              <option value="A4">A4</option>
              <option value="Legal">Legal</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1 border border-slate-200">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="w-4 h-4 text-slate-600" /></Button>
            <span className="text-xs font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="w-4 h-4 text-slate-600" /></Button>
          </div>

          <Button onClick={handlePrint} className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </Button>
        </div>
      </div>

      {/* PAPER CANVAS */}
      <div className="flex-1 overflow-auto p-4 sm:p-10 flex flex-col items-center custom-scrollbar">
        {kategoriRaw === 'summary' ? (
          <div 
            className="print-container bg-white border border-slate-300 shadow-2xl transition-all duration-200 origin-top mb-8"
            style={{
              width: getPaperDimensions().width,
              minHeight: getPaperDimensions().height,
              transform: `scale(${zoom})`,
              padding: '10mm',
              marginBottom: `${(zoom - 1) * 200 + 32}px` 
            }}
          >
            <SummaryTemplate 
              bulan={bulan} 
              tahun={tahun} 
              data={dashboardData} 
            />
          </div>
        ) : Object.keys(posyanduGroups).map((pid, idx) => {
          const group = posyanduGroups[pid];
          // Determine chunks if data is too large for one page (assume ~20 rows per page max)
          const rowsPerPage = 20;
          const pages = [];
          for (let i = 0; i < group.data.length; i += rowsPerPage) {
            pages.push(group.data.slice(i, i + rowsPerPage));
          }
          if (pages.length === 0) pages.push([]); // Ensure at least one page is rendered

          return pages.map((pageData, pIdx) => (
            <div 
              key={`${pid}-${pIdx}`}
              className="print-container bg-white border border-slate-300 shadow-2xl transition-all duration-200 origin-top mb-8"
              style={{
                width: getPaperDimensions().width,
                minHeight: getPaperDimensions().height,
                transform: `scale(${zoom})`,
                padding: '10mm',
                pageBreakAfter: (idx === Object.keys(posyanduGroups).length - 1 && pIdx === pages.length - 1) ? 'auto' : 'always',
                // Adding gap so scaled containers don't overlap in preview
                marginBottom: `${(zoom - 1) * 200 + 32}px` 
              }}
            >
              <VisumTemplate 
                kategori={kategoriRaw} 
                data={pageData} 
                bulan={bulan} 
                tahun={tahun} 
                posyanduName={group.name}
              />
            </div>
          ));
        })}
      </div>
    </div>
  );
}
