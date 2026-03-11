import { computed } from 'vue'

/**
 * Compare two "major.minor" version strings numerically.
 * Returns a positive number if a > b, negative if a < b, 0 if equal.
 */
function compareMajorMinor(a: string, b: string): number {
  const [aMaj = 0, aMin = 0] = a.split('.').map(Number)
  const [bMaj = 0, bMin = 0] = b.split('.').map(Number)
  if (aMaj !== bMaj)
    return aMaj - bMaj
  return aMin - bMin
}

/**
 * Composable for the ReleaseModal auto-show logic.
 *
 * - shouldShow is true when the current app major.minor is strictly greater
 *   than the last acknowledged version (null → never seen → always show).
 * - markSeen() records the current version so the modal won't fire again
 *   until the app bumps to a higher major.minor.
 */
export function useReleaseModal() {
  const config = useRuntimeConfig().public
  const appMajorMinor = config.appMajorMinor
  const appVersion = config.appVersion
  const releaseVersionIndex = config.releaseVersionIndex

  const { settings, set } = useSettings()

  const shouldShowReleaseNotes = computed(() => {
    const last = settings.value.lastSeenReleaseVersion
    // null means never seen — treat as "0.0" so any real version is greater
    const baseline = last ?? '0.0'
    return compareMajorMinor(appMajorMinor, baseline) > 0
  })

  function markSeen() {
    set('lastSeenReleaseVersion', appMajorMinor)
  }

  return {
    appMajorMinor,
    appVersion,
    releaseVersionIndex,
    shouldShowReleaseNotes,
    markSeen,
  }
}
