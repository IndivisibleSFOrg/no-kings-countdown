import type { IAnalyticsProvider } from './types'

/**
 * PostHog provider adapter.
 *
 * Uses posthog-js directly (not a community module) for stable, explicit
 * control. The PostHog client is initialised by plugins/posthog.client.ts and
 * provided as nuxtApp.$posthog.
 *
 * Active when config.public.posthogKey is set (env: NUXT_PUBLIC_POSTHOG_KEY).
 *
 * setBuildMetadata maps to posthog.register() for session-property parity
 * with the GA adapter.
 */
export function createPostHogProvider(): IAnalyticsProvider {
  // Capture nuxtApp at creation time so provider methods can be called from
  // event handlers outside of component setup context.
  const nuxtApp = useNuxtApp()

  const ph = () => nuxtApp.$posthog

  return {
    setBuildMetadata() {
      if (!import.meta.client)
        return
      const { appVersion, commitRef } = useBuildMeta()
      ph()?.register({
        app_version: appVersion,
        commit_ref: commitRef,
      })
    },

    trackFirstVisit(visitDate) {
      ph()?.capture('first_visit_app', { visit_date: visitDate })
    },

    trackViewDetail(dateKey) {
      ph()?.capture('view_detail', { date_key: dateKey })
    },

    trackCompleteAction(dateKey) {
      ph()?.capture('complete_action', { date_key: dateKey })
    },

    trackUncompleteAction(dateKey) {
      ph()?.capture('uncomplete_action', { date_key: dateKey })
    },

    trackShareDetail(dateKey) {
      ph()?.capture('share_detail', { date_key: dateKey })
    },

    trackShareProgress() {
      ph()?.capture('share_progress')
    },

    trackCtaClick(dateKey, linkUrl) {
      ph()?.capture('cta_click', { date_key: dateKey, link_url: linkUrl })
    },

    trackTourStarted(tourName) {
      ph()?.capture('tour_started', { tour_name: tourName })
    },

    trackTourCompleted(tourName) {
      ph()?.capture('tour_completed', { tour_name: tourName })
    },
  }
}
