import type { PostHog } from 'posthog-js'
import posthog from 'posthog-js'

declare module '#app' {
  interface NuxtApp {
    $posthog?: PostHog
  }
}

/**
 * Initialises PostHog only when NUXT_PUBLIC_POSTHOG_KEY is set.
 * Provides the initialized instance as nuxtApp.$posthog for use by
 * composables/analytics/posthogProvider.ts.
 *
 * autocapture and automatic pageview capture are disabled — all events are
 * sent explicitly through the IAnalyticsProvider interface.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const key = config.public.posthogKey

  if (!key)
    return

  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production')
        ph.debug()
    },
  })

  nuxtApp.provide('posthog', posthog)
})
