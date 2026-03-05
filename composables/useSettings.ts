import { readonly, ref } from 'vue'

const STORAGE_KEY = 'isf-settings'

export interface AppSettings {
  tourSeenHome: boolean
  tourSeenModal: boolean
  tourSeenShare: boolean
  // Shows artist name + link overlaid on each image.
  showImageAttributions: boolean
  // Internal only — not user-visible. null means "no explicit override; auto-detect".
  devModeOverride: boolean | null
}

const DEFAULTS: AppSettings = {
  tourSeenHome: false,
  tourSeenModal: false,
  tourSeenShare: false,
  showImageAttributions: false,
  devModeOverride: null,
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
