import type { IAnalyticsProvider } from './types'

/**
 * Plausible Analytics provider adapter.
 *
 * Uses @nuxtjs/plausible (installed as a Nuxt module with autoPageviews: true).
 * Active when config.public.plausibleDomain is set (env: NUXT_PUBLIC_PLAUSIBLE_DOMAIN).
 *
 * setBuildMetadata is a no-op — Plausible doesn't support persistent session
 * properties.
 */
export function createPlausibleProvider(): IAnalyticsProvider {
  // Capture nuxtApp at creation time so provider methods can be called from
  // event handlers outside of component setup context.
  const nuxtApp = useNuxtApp()

  const track = (eventName: string, props?: Record<string, string>) => {
    if (!import.meta.client)
      return
    nuxtApp.$plausible?.trackEvent(eventName, props ? { props } : undefined)
  }

  return {
    // no-op: Plausible doesn't support persistent session properties
    setBuildMetadata() {},

    trackFirstVisit(visitDate) {
      track('first_visit_app', { visit_date: visitDate })
    },

    trackViewDetail(dateKey) {
      track('view_detail', { date_key: dateKey })
    },

    trackCompleteAction(dateKey) {
      track('complete_action', { date_key: dateKey })
    },

    trackUncompleteAction(dateKey) {
      track('uncomplete_action', { date_key: dateKey })
    },

    trackShareDetail(dateKey) {
      track('share_detail', { date_key: dateKey })
    },

    trackShareProgress() {
      track('share_progress')
    },

    trackCtaClick(dateKey, linkUrl) {
      track('cta_click', { date_key: dateKey, link_url: linkUrl })
    },
  }
}
