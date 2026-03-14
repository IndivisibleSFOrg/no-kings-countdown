import type { IAnalyticsProvider } from './analytics/types'
import { createGaProvider } from './analytics/gaProvider'
import { createPlausibleProvider } from './analytics/plausibleProvider'

/**
 * Multicast analytics coordinator.
 *
 * Builds an array of active provider adapters based on which config keys are
 * present, then returns wrapper functions that call each provider in sequence.
 *
 * Public return shape is identical to the previous single-provider
 * implementation — no call-site changes are needed.
 *
 * Provider activation:
 *   GA        — config.public.gtag.id        (env: NUXT_PUBLIC_GTAG_ID, via nuxt-gtag module)
 *   Plausible — config.public.plausibleDomain (env: NUXT_PUBLIC_PLAUSIBLE_DOMAIN)
 *   PostHog   — disabled; see archive/posthogProvider.ts.disabled and archive/posthog.client.ts.disabled
 */
export function useAnalytics() {
  const config = useRuntimeConfig()

  const providers: IAnalyticsProvider[] = []

  if ((config.public.gtag as { id?: string } | undefined)?.id)
    providers.push(createGaProvider())

  if (config.public.plausibleDomain)
    providers.push(createPlausibleProvider())

  /** Call fn on every active provider. */
  const call = (fn: (p: IAnalyticsProvider) => void) => {
    for (const p of providers) fn(p)
  }

  /** Push build metadata as session-scoped properties. Call once on app mount. */
  const setBuildMetadata = () => {
    if (!import.meta.client)
      return
    call(p => p.setBuildMetadata())
  }

  /**
   * Fire once per device on true first visit (localStorage-backed guard lives
   * here so all providers fire together on the same first visit, and none can
   * accidentally set a flag that prevents the others from firing).
   */
  const trackFirstVisit = () => {
    if (!import.meta.client)
      return
    const key = 'isf-visited'
    if (!localStorage.getItem(key)) {
      const visitDate = new Date().toISOString().slice(0, 10)
      localStorage.setItem(key, new Date().toISOString())
      call(p => p.trackFirstVisit(visitDate))
    }
  }

  const trackViewDetail = (dateKey: string) => call(p => p.trackViewDetail(dateKey))
  const trackCompleteAction = (dateKey: string) => call(p => p.trackCompleteAction(dateKey))
  const trackUncompleteAction = (dateKey: string) => call(p => p.trackUncompleteAction(dateKey))
  const trackShareDetail = (dateKey: string) => call(p => p.trackShareDetail(dateKey))
  const trackShareProgress = () => call(p => p.trackShareProgress())
  const trackCtaClick = (dateKey: string, linkUrl: string) => call(p => p.trackCtaClick(dateKey, linkUrl))

  return {
    setBuildMetadata,
    trackFirstVisit,
    trackViewDetail,
    trackCompleteAction,
    trackUncompleteAction,
    trackShareDetail,
    trackShareProgress,
    trackCtaClick,
  }
}
