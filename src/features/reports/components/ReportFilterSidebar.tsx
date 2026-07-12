import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  kategori: string;
  subFilters: Record<string, string>;
  setSubFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function ReportFilterSidebar({ isOpen, onClose, kategori, subFilters, setSubFilters }: ReportFilterSidebarProps) {
  const handleChange = (key: string, value: string) => {
    setSubFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSubFilters({});
  };

  const renderSelect = (key: string, label: string, options: { value: string, label: string }[]) => (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={subFilters[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
        className="h-10 px-3 text-sm rounded-md border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">Semua Status</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  let filtersContent = null;

  if (kategori === 'bumil') {
    filtersContent = (
      <>
        {renderSelect('trimester', '1. Trimester', [
          { value: '1', label: 'Trimester 1 (0-13 mgg)' },
          { value: '2', label: 'Trimester 2 (14-27 mgg)' },
          { value: '3', label: 'Trimester 3 (28+ mgg)' },
        ])}
        {renderSelect('anemia', '2. Status Anemia', [
          { value: 'normal', label: 'Normal' },
          { value: 'ringan', label: 'Anemia Ringan' },
          { value: 'berat', label: 'Anemia Berat' },
        ])}
        {renderSelect('kek', '3. Status KEK', [
          { value: 'normal', label: 'Normal' },
          { value: 'kek', label: 'Risiko KEK (< 23.5 cm)' },
        ])}
        {renderSelect('kie', '4. KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}
        {renderSelect('imt', '5. Status IMT', [
          { value: 'kurus', label: 'Kurus' },
          { value: 'normal', label: 'Normal' },
          { value: 'gemuk', label: 'Gemuk' },
          { value: 'obesitas', label: 'Obesitas' },
        ])}
      </>
    );
  } else if (kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan') {
    filtersContent = (
      <>
        {renderSelect('imt', '1. Status IMT', [
          { value: 'kurus', label: 'Kurus' },
          { value: 'normal', label: 'Normal' },
          { value: 'gemuk', label: 'Gemuk' },
          { value: 'obesitas', label: 'Obesitas' },
        ])}
        {renderSelect('tensi', '2. Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
        {renderSelect('kie', '3. KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}
      </>
    );
  } else if (kategori === 'balita' || kategori === 'baduta') {
    filtersContent = (
      <>
        {renderSelect('gizi', '1. Status Gizi (BB/TB)', [
          { value: 'baik', label: 'Gizi Baik' },
          { value: 'kurang', label: 'Gizi Kurang/Buruk' },
          { value: 'lebih', label: 'Gizi Lebih/Obesitas' },
        ])}
        {renderSelect('tinggi', '2. Tinggi (TB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'pendek', label: 'Pendek (Stunting)' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('berat', '3. Berat (BB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'kurang', label: 'BB Kurang' },
          { value: 'lebih', label: 'BB Lebih' },
        ])}
        {renderSelect('imunisasi', '4. Imunisasi', [
          { value: 'HB0', label: 'HB0' },
          { value: 'BCG', label: 'BCG' },
          { value: 'POLIO1', label: 'POLIO 1' },
          { value: 'POLIO2', label: 'POLIO 2' },
          { value: 'POLIO3', label: 'POLIO 3' },
          { value: 'POLIO4', label: 'POLIO 4' },
          { value: 'ROTAVIRUS 1', label: 'ROTAVIRUS 1' },
          { value: 'ROTAVIRUS 2', label: 'ROTAVIRUS 2' },
          { value: 'ROTAVIRUS 3', label: 'ROTAVIRUS 3' },
          { value: 'DPT 1', label: 'DPT 1' },
          { value: 'DPT 2', label: 'DPT 2' },
          { value: 'DPT 3', label: 'DPT 3' },
          { value: 'PCV 1', label: 'PCV 1' },
          { value: 'PCV 2', label: 'PCV 2' },
          { value: 'PCV 3', label: 'PCV 3' },
          { value: 'IPV 1', label: 'IPV 1' },
          { value: 'IPV 2', label: 'IPV 2' },
          { value: 'MR(CAMPAK)', label: 'MR(CAMPAK)' },
          { value: 'BOSTER DPT', label: 'BOSTER DPT' },
          { value: 'BOSTER MR(CAMPAK)', label: 'BOSTER MR(CAMPAK)' },
        ])}
      </>
    );
  } else if (kategori === 'lansia') {
    filtersContent = (
      <>
        {renderSelect('tensi', '1. Status Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
        {renderSelect('gula_darah', '2. Gula Darah Sewaktu', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('imt', '3. IMT / Status Gizi', [
          { value: 'kurus', label: 'Kurus' },
          { value: 'normal', label: 'Normal' },
          { value: 'gemuk', label: 'Gemuk' },
          { value: 'obesitas', label: 'Obesitas' },
        ])}
        {renderSelect('kolesterol', '4. Kolesterol', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('asam_urat', '5. Asam Urat', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Filter Data {kategori.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <p className="text-sm text-slate-500 mt-1">Atur filter untuk menampilkan data yang dibutuhkan.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filtersContent}
          
        </div>

        <div className="p-6 border-t bg-slate-50 flex items-center justify-between gap-4">
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Batal
          </Button>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>
            Terapkan Filter
          </Button>
        </div>
      </div>
    </>
  );
}
