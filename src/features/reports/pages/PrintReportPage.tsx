import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { VisumTemplate } from '../components/templates/VisumTemplate';
import { SummaryTemplate } from '../components/templates/SummaryTemplate';
import { Printer, ZoomIn, ZoomOut, ArrowLeft, Settings2, FileText } from 'lucide-react';
import { useGetPemeriksaanList } from '@/features/pemeriksaan/hooks/usePemeriksaan';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton';

export function PrintReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [kategoriRaw, setKategoriRaw] = useState(searchParams.get('kategori') || 'baduta');
  const bulan = parseInt(searchParams.get('bulan') || `${new Date().getMonth() + 1}`);
  const tahun = parseInt(searchParams.get('tahun') || `${new Date().getFullYear()}`);
  const posyanduId = searchParams.get('posyanduId') || 'all';

  const [paperSize, setPaperSize] = useState<'A4' | 'F4' | 'Legal' | 'Letter'>('F4');
  // Default zoom 0.4 for mobile to fit screen, 1 for desktop
  const [zoom, setZoom] = useState(window.innerWidth < 768 ? 0.4 : 1);

  // Enable native pinch-to-zoom on this page
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const oldContent = meta?.getAttribute('content');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
    return () => {
      if (meta && oldContent) meta.setAttribute('content', oldContent);
    };
  }, []);
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
    <div className="min-h-screen bg-slate-200 flex font-sans overflow-hidden">
      {/* SIDEBAR (Desktop Only) */}
      <aside className="no-print hidden lg:flex flex-col inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">Pengaturan Cetak</h2>
              <p className="text-[10px] text-slate-500 font-medium">Laporan TPK</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> Kategori Laporan
            </label>
            <div className="relative">
              <select 
                className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm text-slate-700 font-medium cursor-pointer"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Ukuran Kertas</label>
            <div className="relative">
              <select 
                className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm text-slate-700 font-medium cursor-pointer"
                value={paperSize}
                onChange={(e: any) => setPaperSize(e.target.value)}
              >
                <option value="F4">F4 (Folio)</option>
                <option value="A4">A4</option>
                <option value="Legal">Legal</option>
                <option value="Letter">Letter</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <Button onClick={handlePrint} className="w-full gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-primary/30 h-12 text-sm font-bold rounded-xl transition-all">
            <Printer className="w-5 h-5" />
            CETAK DOKUMEN
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-200 relative">
        {/* HEADER */}
        <div className="no-print flex items-center justify-between p-3 bg-white/90 backdrop-blur-md border-b border-slate-300 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden hover:bg-slate-100" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Button>
            <Button variant="outline" size="sm" className="hidden lg:flex gap-2 h-9 rounded-full px-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold text-xs">Kembali</span>
            </Button>
            <h1 className="font-bold text-slate-800 text-sm ml-1">Preview Laporan</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden lg:flex gap-2 h-9 border-primary text-primary hover:bg-primary/5 rounded-full px-4" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              <span className="font-semibold text-xs">Cetak</span>
            </Button>
          </div>
        </div>

        {/* PAPER CANVAS */}
        <div className="flex-1 overflow-auto p-4 sm:p-10 custom-scrollbar pb-32">
        {kategoriRaw === 'summary' ? (
          <div 
            className="mx-auto" 
            style={{ 
              width: `calc(${getPaperDimensions().width} * ${zoom})`, 
              height: `calc(${getPaperDimensions().height} * ${zoom})`,
              marginBottom: '2rem'
            }}
          >
            <div 
              className="print-container bg-white border border-slate-300 shadow-2xl transition-all duration-200 origin-top-left"
              style={{
                width: getPaperDimensions().width,
                minHeight: getPaperDimensions().height,
                transform: `scale(${zoom})`,
                padding: '10mm',
              }}
            >
            <SummaryTemplate 
              bulan={bulan} 
              tahun={tahun} 
              data={dashboardData} 
            />
          </div>
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
              className="mx-auto" 
              style={{ 
                width: `calc(${getPaperDimensions().width} * ${zoom})`, 
                height: `calc(${getPaperDimensions().height} * ${zoom})`,
                marginBottom: '2rem'
              }}
            >
              <div 
                className="print-container bg-white border border-slate-300 shadow-2xl transition-all duration-200 origin-top-left"
                style={{
                  width: getPaperDimensions().width,
                  minHeight: getPaperDimensions().height,
                  transform: `scale(${zoom})`,
                  padding: '10mm',
                  pageBreakAfter: (idx === Object.keys(posyanduGroups).length - 1 && pIdx === pages.length - 1) ? 'auto' : 'always',
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
            </div>
          ));
        })}
        </div>

        {/* FLOATING ZOOM CONTROLS */}
        <div className="no-print fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-40 bg-white/90 backdrop-blur shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] border border-slate-200 rounded-full flex items-center p-1.5 transition-all">
          <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 hover:text-primary transition-colors shrink-0" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[11px] font-bold w-10 text-center text-slate-700 select-none">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 hover:text-primary transition-colors shrink-0" onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-around z-50 pb-safe">
          {/* Kategori Button */}
          <div className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings2 className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none mt-0.5">Kategori</span>
            <select 
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
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
          
          {/* Kertas Button */}
          <div className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 text-slate-600 hover:bg-slate-50 transition-colors border-l border-slate-100">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none mt-0.5">Kertas</span>
            <select 
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              value={paperSize}
              onChange={(e: any) => setPaperSize(e.target.value)}
            >
              <option value="F4">F4 (Folio)</option>
              <option value="A4">A4</option>
              <option value="Legal">Legal</option>
              <option value="Letter">Letter</option>
            </select>
          </div>


          {/* Cetak Button */}
          <button 
            className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 text-primary hover:bg-primary/5 transition-colors border-l border-slate-100 outline-none"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            <span className="text-[10px] font-bold leading-none mt-0.5">Cetak</span>
          </button>
        </div>
      </div>
    </div>
  );
}
