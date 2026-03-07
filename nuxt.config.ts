// https://nuxt.com/docs/api/configuration/nuxt-config
import { execSync } from 'node:child_process'

const gitDescribe = (() => {
  try {
    return execSync('git describe --always --tags --dirty=+').toString().trim()
  }
  catch {
    return 'dev'
  }
})()

const gitBranch = (() => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  }
  catch {
    return 'local'
  }
})()

const gitShortSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  }
  catch {
    return ''
  }
})()

const sheetUrl = (() => {
  const url = process.env.NUXT_PUBLIC_SHEET_URL
  if (!url)
    throw new Error('NUXT_PUBLIC_SHEET_URL is required — set it in .env')
  return url
})()

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-gtag',
    '@nuxtjs/plausible',
  ],

  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || '',
    enabled: process.env.NODE_ENV === 'production' && !!process.env.NUXT_PUBLIC_GTAG_ID,
  },

  plausible: {
    // Domain defaults to window.location.hostname when not set.
    // Enable only when NUXT_PUBLIC_PLAUSIBLE_DOMAIN is provided.
    enabled: !!process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
    autoPageviews: true,
    ignoredHostnames: ['localhost'],
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'No Kings Countdown: Daily actions to build community engagement',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
        // OpenGraph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://nokingscountdown.org/' },
        { property: 'og:title', content: 'No Kings Countdown: Daily actions to build community engagement' },
        { property: 'og:description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
        { property: 'og:image', content: 'https://nokingscountdown.org/og-image.webp' },
        { property: 'og:image:width', content: '1424' },
        { property: 'og:image:height', content: '752' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://nokingscountdown.org/' },
        { name: 'twitter:title', content: 'No Kings Countdown: Daily actions to build community engagement' },
        { name: 'twitter:description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
        { name: 'twitter:image', content: 'https://nokingscountdown.org/og-image.webp' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700;900&family=Source+Code+Pro:wght@400;600&display=swap',
        },
      ],
    },
  },

  css: [
    '@/assets/css/main.css',
    'driver.js/dist/driver.css',
  ],

  ssr: false,

  nitro: {
    preset: 'static',
    output: {
      publicDir: 'out',
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  runtimeConfig: {
    public: {
      commitSha: process.env.NUXT_PUBLIC_COMMIT_SHA || gitDescribe,
      commitShortSha: process.env.NUXT_PUBLIC_COMMIT_SHORT_SHA || gitShortSha,
      commitRef: process.env.NUXT_PUBLIC_COMMIT_REF || gitBranch,
      buildDate: process.env.NUXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
      runId: process.env.NUXT_PUBLIC_RUN_ID || '',
      sheetUrl,
      // Analytics provider activation keys — empty string disables the provider.
      // GA is activated via nuxt-gtag's own runtimeConfig (public.gtag.id).
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
      posthogKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
    },
  },
})
