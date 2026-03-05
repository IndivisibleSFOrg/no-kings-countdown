import { computed } from 'vue'

/**
 * Composable for dev mode state and toggle.
 *
 * Dev mode is ONLY available in local dev (`import.meta.dev === true`).
 * In production builds, `isDevMode` is always false and the toggle is a no-op.
 *
 * When running locally, the effective value is determined in priority order:
 *  1. settings.devModeOverride has been explicitly set (persisted across reloads)
 *  2. URL query param `env=dev` forces on / `env=prd` forces off
 *  3. `import.meta.dev` (always true when running locally)
 *
 * Returns:
 *  - `isDevMode`: ComputedRef<boolean> — reactive dev mode state
 *  - `toggle`: function — flip between explicit on/off (no-op in production)
 */
export function useDevMode() {
  const route = useRoute()
  const { settings, set } = useSettings()

  const autoValue = computed(() => {
    // env= query param is only honored in local dev mode
    if (import.meta.dev) {
      if (route.query.env === 'dev')
        return true
      if (route.query.env === 'prd')
        return false
    }
    return false // default to prd even on localhost
  })

  const isDevMode = computed(() => {
    // In production, dev mode is always off — no overrides are respected
    if (!import.meta.dev)
      return false
    return settings.value.devModeOverride !== null ? settings.value.devModeOverride : autoValue.value
  })

  const toggle = () => {
    // Toggle is a no-op outside of local dev mode
    if (!import.meta.dev)
      return
    // Flip from the current effective value and persist across reloads.
    set('devModeOverride', !isDevMode.value)
  }

  return { isDevMode, toggle }
}
