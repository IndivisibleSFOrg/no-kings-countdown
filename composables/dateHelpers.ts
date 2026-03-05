// Input: CSV `date` field as string in one of three accepted formats:
//   m/d       — month and day, current year assumed
//   m/d/y     — month, day, and 2- or 4-digit year
//   yyyy-mm-dd — ISO-style full date
// Output: JavaScript `Date` (local midnight), or null if the format is invalid.
export function parseCsvDate(value: string): Date | null {
  const trimmed = (value ?? '').trim()

  // yyyy-mm-dd
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  }

  // m/d or m/d/y
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (slashMatch) {
    const month = Number(slashMatch[1])
    const day = Number(slashMatch[2])
    const yearRaw = slashMatch[3]
    let year: number
    if (yearRaw === undefined) {
      year = new Date().getFullYear()
    }
    else {
      year = Number(yearRaw)
      if (year < 100)
        year += 2000
    }
    return new Date(year, month - 1, day)
  }

  console.error(`parseCsvDate: invalid date format: "${value}"`)
  return null
}

// Format a Date as YYYY-MM-DD (local time) for use as a URL key.
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
