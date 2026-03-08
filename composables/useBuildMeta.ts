/**
 * Singleton composable for build metadata (implements #56).
 *
 * Parses raw runtime config exactly once (via useState), exposes computed
 * fields to any consumer, and provides an init() method that writes
 * isf-build-meta to localStorage exactly once (idempotent — checks storage
 * before writing, so repeated calls are safe).
 *
 * Replaces the localStorage side-effect that was previously buried inside
 * useBuildData(). Providers in the analytics layer call useBuildMeta() to
 * read parsed values without duplicating the parsing logic.
 */
export function useBuildMeta() {
  const state = useState('build-meta', () => {
    const config = useRuntimeConfig().public
    return parseBuildData(config as Parameters<typeof parseBuildData>[0])
  })

  /** Write build metadata to localStorage exactly once (idempotent). */
  const init = () => {
    if (!import.meta.client)
      return
    const key = 'isf-build-meta'
    if (!localStorage.getItem(key)) {
      try {
        localStorage.setItem(key, JSON.stringify(state.value))
      }
      catch {
        // ignore storage errors (e.g. private browsing quota)
      }
    }
  }

  return {
    appVersion: state.value.appVersion,
    commitShortSha: state.value.commitShortSha,
    commitRef: state.value.commitRef,
    buildDate: state.value.buildDate,
    init,
  }
}
