export function useAnalytics() {
  const { gtag } = useGtag()

  /**
   * Set build metadata as GA global properties. Call once on app mount.
   * app_version is a reserved GA4 dimension; commit_short_sha and commit_ref are custom.
   */
  const setBuildMetadata = () => {
    if (!import.meta.client)
      return
    const { appVersion, commitShortSha, commitRef } = useBuildMeta()
    gtag('set', {
      app_version: appVersion.value,
      commit_short_sha: commitShortSha.value,
      commit_ref: commitRef.value,
    })
  }

  /** Fire once per device on true first visit (localStorage-backed). */
  const trackFirstVisit = () => {
    if (!import.meta.client)
      return
    const key = 'isf-visited'
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, new Date().toISOString())
      gtag('event', 'first_visit_app', {
        visit_date: new Date().toISOString().slice(0, 10),
      })
    }
  }

  const trackViewDetail = (dateKey: string) => {
    gtag('event', 'view_detail', { date_key: dateKey })
  }

  const trackCompleteAction = (dateKey: string) => {
    gtag('event', 'complete_action', { date_key: dateKey })
  }

  const trackUncompleteAction = (dateKey: string) => {
    gtag('event', 'uncomplete_action', { date_key: dateKey })
  }

  const trackShareDetail = (dateKey: string) => {
    gtag('event', 'share_detail', { date_key: dateKey })
  }

  const trackShareProgress = () => {
    gtag('event', 'share_progress')
  }

  const trackCtaClick = (dateKey: string, linkUrl: string) => {
    gtag('event', 'cta_click', { date_key: dateKey, link_url: linkUrl })
  }

  const trackTourStarted = (tourName: string) => {
    gtag('event', 'tour_started', { tour_name: tourName })
  }

  const trackTourCompleted = (tourName: string) => {
    gtag('event', 'tour_completed', { tour_name: tourName })
  }

  return {
    setBuildMetadata,
    trackFirstVisit,
    trackViewDetail,
    trackCompleteAction,
    trackUncompleteAction,
    trackShareDetail,
    trackShareProgress,
    trackCtaClick,
    trackTourStarted,
    trackTourCompleted,
  }
}
