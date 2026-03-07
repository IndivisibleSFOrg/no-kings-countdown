/**
 * Shared interface that every analytics provider adapter must implement.
 *
 * Provider-specific features with no cross-provider equivalent (e.g.
 * setBuildMetadata in Plausible) are no-ops — keeps the interface small and
 * uniform so the multicast coordinator can iterate the same array for every
 * method.
 */
export interface IAnalyticsProvider {
  /** Push build metadata as session-scoped properties. Call once on app mount. */
  setBuildMetadata: () => void

  /**
   * Fire a first_visit_app event for this device.
   * The coordinator has already verified this is a true first visit via
   * localStorage; the provider should fire unconditionally when called.
   *
   * @param visitDate ISO date string, e.g. "2025-03-07"
   */
  trackFirstVisit: (visitDate: string) => void

  trackViewDetail: (dateKey: string) => void
  trackCompleteAction: (dateKey: string) => void
  trackUncompleteAction: (dateKey: string) => void
  trackShareDetail: (dateKey: string) => void
  trackShareProgress: () => void
  trackCtaClick: (dateKey: string, linkUrl: string) => void
  trackTourStarted: (tourName: string) => void
  trackTourCompleted: (tourName: string) => void
}
