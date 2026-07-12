import { api } from './api';
import { Warga } from '../features/warga/services/wargaService';

export const publicService = {
  cekKartu: async (nik: string, tanggal_lahir: string): Promise<Warga> => {
    const res = await api.post('/public/cek-kartu', { nik, tanggal_lahir });
    return res.data.data;
  },
};
