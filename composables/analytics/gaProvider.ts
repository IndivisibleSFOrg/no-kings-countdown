import type { IAnalyticsProvider } from './types'

/**
 * Google Analytics provider adapter.
 *
 * Moves the existing useGtag() logic verbatim into the provider model.
 * Active when config.public.gtagId is present (checked by the coordinator).
 */
export function createGaProvider(): IAnalyticsProvider {
  const { gtag } = useGtag()

  return {
    setBuildMetadata() {
      if (!import.meta.client)
        return
      const { appVersion, commitShortSha, commitRef } = useBuildMeta()
      gtag('set', {
        app_version: appVersion,
        commit_short_sha: commitShortSha,
        commit_ref: commitRef,
      })
    },

    trackFirstVisit(visitDate) {
      gtag('event', 'first_visit_app', { visit_date: visitDate })
    },

    trackViewDetail(dateKey) {
      gtag('event', 'view_detail', { date_key: dateKey })
    },

    trackCompleteAction(dateKey) {
      gtag('event', 'complete_action', { date_key: dateKey })
    },

    trackUncompleteAction(dateKey) {
      gtag('event', 'uncomplete_action', { date_key: dateKey })
    },

    trackShareDetail(dateKey) {
      gtag('event', 'share_detail', { date_key: dateKey })
    },

    trackShareProgress() {
      gtag('event', 'share_progress')
    },

    trackCtaClick(dateKey, linkUrl) {
      gtag('event', 'cta_click', { date_key: dateKey, link_url: linkUrl })
    },

    trackTourStarted(tourName) {
      gtag('event', 'tour_started', { tour_name: tourName })
    },

    trackTourCompleted(tourName) {
      gtag('event', 'tour_completed', { tour_name: tourName })
    },
  }
}
