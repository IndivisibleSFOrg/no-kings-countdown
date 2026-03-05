export function useAnalytics() {
  const { gtag } = useGtag()

  const trackViewDetail = (dateKey: string) => {
    gtag('event', 'view_detail', { date_key: dateKey })
  }

  const trackCardFlip = (dateKey: string) => {
    gtag('event', 'card_flip', { date_key: dateKey })
  }

  const trackShareProgress = () => {
    gtag('event', 'share_progress')
  }

  const trackShareDetail = (dateKey: string) => {
    gtag('event', 'share_detail', { date_key: dateKey })
  }

  const trackCompleteAction = (dateKey: string) => {
    gtag('event', 'complete_action', { date_key: dateKey })
  }

  return { trackViewDetail, trackCardFlip, trackShareProgress, trackShareDetail, trackCompleteAction }
}
