import type { Ref } from 'vue'
import { ref } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'

// Sharing state is stored as a JSON array of YYYY-MM-DD strings in localStorage.
// Keyed per campaign slug: `<slug>/shared-actions`.
// Legacy key for NKC users: `isf-shared-actions` is migrated on first load.
const LEGACY_KEY = 'isf-shared-actions'
const NKC_SLUG = 'no-kings-countdown'

interface SlugState { keys: Ref<Set<string>>, initialized: boolean }
const stateMap = new Map<string, SlugState>()

function getState(slug: string): SlugState {
  if (!stateMap.has(slug))
    stateMap.set(slug, { keys: ref(new Set<string>()), initialized: false })
  return stateMap.get(slug)!
}

function storageKey(slug: string): string {
  return `${slug}/shared-actions`
}

function load(slug: string, state: SlugState) {
  try {
    const key = storageKey(slug)
    let raw = localStorage.getItem(key)
    // One-time migration from legacy key for NKC users
    if (raw === null && slug === NKC_SLUG) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy !== null) {
        localStorage.setItem(key, legacy)
        localStorage.removeItem(LEGACY_KEY)
        raw = legacy
      }
    }
    const keys: string[] = raw ? JSON.parse(raw) : []
    state.keys.value = new Set(keys)
  }
  catch {
    state.keys.value = new Set()
  }
  state.initialized = true
}

function save(slug: string, state: SlugState) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify([...state.keys.value]))
  }
  catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useActionSharing() {
  const { slug } = useCampaignRoute()
  const state = getState(slug.value)

  if (typeof localStorage !== 'undefined' && slug.value && !state.initialized) {
    load(slug.value, state)
  }

  const sharedKeys = state.keys

  const isShared = (date: Date): boolean =>
    state.keys.value.has(formatDateKey(date))

  const markShared = (date: Date) => {
    const key = formatDateKey(date)
    if (!state.keys.value.has(key)) {
      state.keys.value.add(key)
      state.keys.value = new Set(state.keys.value)
      save(slug.value, state)
    }
  }

  const toggleShared = (date: Date) => {
    const key = formatDateKey(date)
    if (state.keys.value.has(key)) {
      state.keys.value.delete(key)
    }
    else {
      state.keys.value.add(key)
    }
    state.keys.value = new Set(state.keys.value)
    save(slug.value, state)
  }

  return { sharedKeys, isShared, markShared, toggleShared }
}
