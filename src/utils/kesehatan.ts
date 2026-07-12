export function calculateIMT(bbKg: number | null | undefined, tbCm: number | null | undefined): number | null {
  if (!bbKg || !tbCm) return null;
  const tbM = tbCm / 100;
  return bbKg / (tbM * tbM);
}

export function classifyIMT(imt: number | null): string {
  if (imt === null) return '-';
  if (imt < 18.5) return 'Kurus';
  if (imt < 25.0) return 'Normal';
  if (imt <= 27.0) return 'Gemuk';
  return 'Obesitas';
}

export function classifyTekananDarah(sistolik: number | null | undefined, diastolik: number | null | undefined): string {
  if (!sistolik || !diastolik) return '-';
  
  if (sistolik < 90 && diastolik < 60) {
    return 'Hipotensi';
  } else if (sistolik >= 140 || diastolik >= 90) {
    return 'Hipertensi';
  } else if ((sistolik >= 120 && sistolik <= 139) || (diastolik >= 80 && diastolik <= 89)) {
    return 'Prahipertensi';
  } else {
    // 90-119 and 60-79
    return 'Normal';
  }
}
