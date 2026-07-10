export function calculateAgeInMonths(birthDate: string | Date, referenceDate: string | Date = new Date()) {
  const birth = new Date(birthDate)
  const reference = new Date(referenceDate)
  let months = (reference.getFullYear() - birth.getFullYear()) * 12
  months += reference.getMonth() - birth.getMonth()

  if (reference.getDate() < birth.getDate()) {
    months--
  }

  return Math.max(0, months)
}

export function isBadutaByBirthDate(birthDate: string | Date, referenceDate: string | Date = new Date()) {
  return calculateAgeInMonths(birthDate, referenceDate) < 24
}

export function isBalitaByBirthDate(birthDate: string | Date, referenceDate: string | Date = new Date()) {
  const ageMonths = calculateAgeInMonths(birthDate, referenceDate)
  return ageMonths >= 24 && ageMonths < 60
}
