/**
 * When the app is embedded in an iframe, posts its scroll height to the parent
 * window whenever the document size changes. The parent can then resize the
 * iframe to match, avoiding a nested scrollbar.
 *
 * Pair with the embed snippet documented in README.md.
 */
export default defineNuxtPlugin(() => {
  // Only runs when actually embedded
  if (window.self === window.top)
    return

  const post = () => {
    window.parent.postMessage(
      { type: 'nk-resize', height: document.documentElement.scrollHeight },
      '*',
    )
  }

  const ro = new ResizeObserver(post)
  ro.observe(document.documentElement)

  // Also post on route changes (SPA navigation)
  const router = useRouter()
  router.afterEach(async () => nextTick(post))
})
