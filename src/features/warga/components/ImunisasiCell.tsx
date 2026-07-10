import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useGetImunisasiByWarga, useCreateImunisasi, useDeleteImunisasi } from '../hooks/useImunisasi'

interface ImunisasiCellProps {
  wargaId: string
  disabled?: boolean
}

export function ImunisasiCell({ wargaId, disabled }: ImunisasiCellProps) {
  const [input, setInput] = useState('')

  const { data: imunisasiList = [], isLoading } = useGetImunisasiByWarga(wargaId)
  const { mutate: createImunisasi, isPending: isCreating } = useCreateImunisasi(wargaId)
  const { mutate: deleteImunisasi, isPending: isDeleting } = useDeleteImunisasi(wargaId)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const today = new Date().toISOString().split('T')[0]
    createImunisasi({ warga_id: wargaId, jenis_vaksin: trimmed, tanggal_pemberian: today })
    setInput('')
  }

  return (
    <div className="w-full min-w-[190px] space-y-1">
      {isLoading ? (
        <div className="flex items-center text-slate-400 text-xs gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Memuat...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 min-h-[20px]">
          {imunisasiList.map(item => (
            <div key={item.id} className="inline-flex items-center gap-1">
              <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                {item.jenis_vaksin}
              </span>
              {!disabled && (
                <button
                  onClick={() => deleteImunisasi(item.id)}
                  disabled={isDeleting}
                  className="flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors rounded-full p-1 border border-red-100"
                  title="Hapus vaksin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {imunisasiList.length === 0 && (
            <span className="text-slate-400 font-medium text-sm md:text-md">Belum ada</span>
          )}
        </div>
      )}

      {!disabled && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            placeholder="Nama vaksin..."
            className="w-full px-2 py-1 border border-slate-200 rounded-md bg-white text-[11px] text-slate-700 focus:outline-none focus:border-primary placeholder:text-slate-300"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || isCreating}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  )
}
