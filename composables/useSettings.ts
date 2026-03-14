import { readonly, ref } from 'vue'

const STORAGE_KEY = 'isf-settings'

export interface AppSettings {
  // Shows artist name + link overlaid on each image.
  showImageAttributions: boolean
  // Internal only — not user-visible. null means "no explicit override; auto-detect".
  devModeOverride: boolean | null
  // The last major.minor version string (e.g. "1.2") for which the user
  // closed the ReleaseModal. null means never seen.
  lastSeenReleaseVersion: string | null
}

const DEFAULTS: AppSettings = {
  showImageAttributions: false,
  devModeOverride: null,
  lastSeenReleaseVersion: null,
}

// Module-level ref so state is shared across all component instances.
const settings = ref<AppSettings>({ ...DEFAULTS })
let initialized = false

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    settings.value = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  }
  catch {
    settings.value = { ...DEFAULTS }
  }
  initialized = true
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }
  catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useSettings() {
  if (!initialized && typeof localStorage !== 'undefined') {
    load()
  }

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value
    save()
  }

  return { settings: readonly(settings), set }
}
