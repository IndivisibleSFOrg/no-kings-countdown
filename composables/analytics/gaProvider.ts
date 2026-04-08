import type { IAnalyticsProvider } from './types'

/**
 * Google Analytics provider adapter.
 *
 * Moves the existing useGtag() logic verbatim into the provider model.
 * Active when config.public.gtagId is present (checked by the coordinator).
 */
export function createGaProvider(slug: string): IAnalyticsProvider {
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
        campaign_slug: slug,
      })
    },

    trackFirstVisit(visitDate) {
      gtag('event', 'first_visit_app', { visit_date: visitDate, campaign_slug: slug })
    },

    trackViewDetail(dateKey) {
      gtag('event', 'view_detail', { date_key: dateKey, campaign_slug: slug })
    },

    trackCompleteAction(dateKey) {
      gtag('event', 'complete_action', { date_key: dateKey, campaign_slug: slug })
    },

    trackUncompleteAction(dateKey) {
      gtag('event', 'uncomplete_action', { date_key: dateKey, campaign_slug: slug })
    },

    trackShareDetail(dateKey) {
      gtag('event', 'share_detail', { date_key: dateKey, campaign_slug: slug })
    },

    trackShareProgress() {
      gtag('event', 'share_progress', { campaign_slug: slug })
    },

    trackCtaClick(dateKey, linkUrl) {
      gtag('event', 'cta_click', { date_key: dateKey, link_url: linkUrl, campaign_slug: slug })
    },

    trackIcsDownload(dateKey) {
      gtag('event', 'ics_download', { date_key: dateKey, campaign_slug: slug })
    },
  }
}
