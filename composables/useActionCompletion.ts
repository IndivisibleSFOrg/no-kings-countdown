import { ref } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'

// Completion state is stored as a JSON array of YYYY-MM-DD strings in localStorage.
// Module-level ref so state is shared across all component instances.
const STORAGE_KEY = 'isf-completed-actions'
const completedKeys = ref<Set<string>>(new Set())
let initialized = false

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const keys: string[] = raw ? JSON.parse(raw) : []
    completedKeys.value = new Set(keys)
  }
  catch {
    completedKeys.value = new Set()
  }
  initialized = true
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedKeys.value]))
  }
  catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useActionCompletion() {
  if (!initialized && typeof localStorage !== 'undefined') {
    load()
  }

  const isComplete = (date: Date): boolean =>
    completedKeys.value.has(formatDateKey(date))

  const toggleComplete = (date: Date) => {
    const key = formatDateKey(date)
    if (completedKeys.value.has(key)) {
      completedKeys.value.delete(key)
    }
    else {
      completedKeys.value.add(key)
    }
    // Reassign to trigger Vue's reactivity on the ref
    completedKeys.value = new Set(completedKeys.value)
    save()
  }

  return { completedKeys, isComplete, toggleComplete }
}
