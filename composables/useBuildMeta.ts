/**
 * Singleton composable for build metadata.
 *
 * Parses git describe output into a clean `appVersion`, exposes commit info,
 * and writes a `isf-build-meta` entry to localStorage exactly once per
 * session (idempotent — guarded by useState).
 *
 * Consumers (analytics providers, debug tools) call `useBuildMeta()` to get
 * pre-parsed values without duplicating SHA-parsing logic.
 */
export function useBuildMeta() {
  const config = useRuntimeConfig()

  const meta = useState('build-meta', () => {
    const sha = config.public.commitSha
    const withoutDirty = sha.replace(/\+$/, '')
    const gHashMatch = withoutDirty.match(/-\d+-g[0-9a-f]+$/)
    const appVersion = gHashMatch
      ? withoutDirty.slice(0, withoutDirty.length - gHashMatch[0].length)
      : withoutDirty

    return {
      appVersion,
      commitShortSha: config.public.commitShortSha,
      commitRef: config.public.commitRef,
      buildDate: config.public.buildDate,
      _written: false,
    }
  })

  /**
   * Write build metadata to localStorage exactly once.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  const init = () => {
    if (!import.meta.client)
      return
    if (meta.value._written)
      return
    try {
      localStorage.setItem('isf-build-meta', JSON.stringify({
        appVersion: meta.value.appVersion,
        commitShortSha: meta.value.commitShortSha,
        commitRef: meta.value.commitRef,
        buildDate: meta.value.buildDate,
      }))
    }
    catch {
      // ignore storage errors (e.g. private browsing quota)
    }
    meta.value._written = true
  }

  return {
    appVersion: computed(() => meta.value.appVersion),
    commitShortSha: computed(() => meta.value.commitShortSha),
    commitRef: computed(() => meta.value.commitRef),
    buildDate: computed(() => meta.value.buildDate),
    init,
  }
}
