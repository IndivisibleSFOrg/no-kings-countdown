// Generates and triggers a client-side download of a .ics calendar file
// containing one VEVENT per remaining campaign day (today → campaignEnd).
// Each event fires an 8am local-time reminder with a day-specific URL.
export function useIcsDownload() {
  const { trackIcsDownload } = useAnalytics()

  function downloadIcs(campaignEnd: Date) {
    const CAMPAIGN_END = campaignEnd

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const events: string[] = []
    const todayY = today.getFullYear()
    const todayM = today.getMonth()
    const todayD = today.getDate()
    const dtstamp = formatUtcStamp(new Date())

    for (let offset = 0; ; offset++) {
      // Construct each date via year/month/day+offset to stay DST-safe
      const day = new Date(todayY, todayM, todayD + offset)
      if (day > CAMPAIGN_END)
        break

      const y = day.getFullYear()
      const m = String(day.getMonth() + 1).padStart(2, '0')
      const d = String(day.getDate()).padStart(2, '0')
      const dateKey = `${y}-${m}-${d}`
      const dtStart = `${y}${m}${d}T080000`
      const dtEnd = `${y}${m}${d}T081500`
      const eventUrl = `https://goodtroubledaily.org/?date=${dateKey}&utm_source=ics&utm_medium=calendar&utm_campaign=daily_reminder`

      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${dateKey}@goodtroubledaily.org`,
          `DTSTAMP:${dtstamp}`,
          'SUMMARY:Good Trouble Daily Action',
          `DTSTART;TZID=${tz}:${dtStart}`,
          `DTEND;TZID=${tz}:${dtEnd}`,
          `DESCRIPTION:Today's action: ${eventUrl}`,
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          'TRIGGER:PT0S',
          'DESCRIPTION:Good Trouble Daily Action',
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n'),
      )
    }

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Good Trouble Daily//goodtroubledaily.org//EN',
      'X-WR-CALNAME:Good Trouble Daily Reminders',
      `X-WR-TIMEZONE:${tz}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n')

    const todayKey = `${todayY}-${String(todayM + 1).padStart(2, '0')}-${String(todayD).padStart(2, '0')}`
    trackIcsDownload(todayKey)

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'good-trouble-daily.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { downloadIcs }
}

function formatUtcStamp(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${d}T${h}${min}${s}Z`
}
