import Papa from 'papaparse'
import { parseCsvDate } from '~/composables/dateHelpers'

// ActionItem represents the structured data used in the application, while
// ActionCSVItem represents the raw data format from the CSV. The
// toCountdownItem function transforms the raw CSV data into the structured
// format, including parsing the date field; rows with an unrecognised date
// format are dropped (logged to console). The fetchCountdownItems function
// retrieves the CSV data from the Google Sheet, parses it, and returns an
// array of ActionItem objects.

export interface AttributedImage {
  image_url: string
  artist_name: string
  artist_url: string
}

export interface ActionItem {
  date: Date
  details: string
  headline: string
  image_back: AttributedImage
  image_front: AttributedImage
  labels: string[]
  link_text: string
  link_url: string
  social_message: string
}

export interface ActionCSVItem {
  date: string
  details: string
  headline: string
  image_back_artist: string
  image_back_artist_url: string
  image_back_url: string
  image_front_artist: string
  image_front_artist_url: string
  image_front_url: string
  labels: string
  link_text: string
  link_url: string
  social_message: string
}

export function toCountdownItem(item: ActionCSVItem): ActionItem | null {
  const date = parseCsvDate(item.date)
  if (date === null)
    return null
  return {
    date,
    details: item.details || '',
    headline: item.headline,
    image_front: {
      image_url: item.image_front_url || '',
      artist_name: item.image_front_artist || '',
      artist_url: item.image_front_artist_url || '',
    },
    image_back: {
      image_url: item.image_back_url || item.image_front_url || '',
      artist_name: item.image_back_artist || item.image_front_artist || '',
      artist_url: item.image_back_artist_url || item.image_front_artist_url || '',
    },
    labels: item.labels ? item.labels.split(',').map(l => l.trim().toLowerCase()).filter(Boolean) : [],
    link_text: item.link_text || 'Learn more',
    link_url: item.link_url || '#',
    social_message: item.social_message || '',
  }
}

export async function fetchCountdownItems(url: string): Promise<ActionItem[]> {
  if (!url)
    return []
  try {
    const response = await fetch(url, {
      cache: 'no-cache',
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()

    return await new Promise((resolve, reject) => {
      Papa.parse<ActionCSVItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(
            results.data
              .map(item => toCountdownItem(item))
              .filter((item): item is ActionItem => item !== null),
          )
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })
  }
  catch (error) {
    console.error('Error fetching Google Sheet data:', error)
    return []
  }
}
