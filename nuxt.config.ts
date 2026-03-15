import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
// https://nuxt.com/docs/api/configuration/nuxt-config
import 'dotenv/config'

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

/**
 * Build an index of release versions from markdown files in public/releases/.
 * Each <version>.md file is included. The date is taken from the corresponding
 * git tag (refs/tags/<version>); files without a matching tag get an empty date.
 * Sorted numerically by version (major.minor.patch).
 */
const releaseVersionIndex: { version: string, date: string }[] = (() => {
  try {
    const dir = join(process.cwd(), 'public/releases')
    const files = readdirSync(dir)
    const entries: { version: string, date: string }[] = []
    for (const file of files) {
      const m = file.match(/^(\d+\.\d+\.\d+(?:-[\w.]+)?)\.md$/)
      if (!m)
        continue
      const version = m[1]
      let date = ''
      try {
        date = execSync(
          `git for-each-ref --format="%(creatordate:short)" refs/tags/${version}`,
        ).toString().trim()
      }
      catch {
        // no tag — leave date empty
      }
      entries.push({ version, date })
    }
    entries.sort((a, b) =>
      a.version.localeCompare(b.version, undefined, { numeric: true }),
    )
    return entries
  }
  catch {
    return []
  }
})()

/** Current app major.minor derived from gitDescribe (e.g. "1.2.2" → "1.2"). */
const appMajorMinor = (() => {
  const m = gitDescribe.replace(/\+$/, '').match(/^(\d+)\.(\d+)/)
  return m ? `${m[1]}.${m[2]}` : '0.0'
})()

/**
 * Full version for the current build, matching the releaseVersionIndex format:
 * X.Y.0 for final releases, X.Y.0-prerelease for RC builds (e.g. 1.3.0-rc.0).
 */
const appVersion = (() => {
  const m = gitDescribe.replace(/\+$/, '').match(/^(\d+\.\d+\.0(?:-[\w.]+)?)/)
  return m ? m[1] : `${appMajorMinor}.0`
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
    '@nuxtjs/plausible',
    '@nuxtjs/tailwindcss',
    '@vercel/analytics',
    'nuxt-gtag',
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
      // Release announcement data built from git tags at generation time.
      releaseVersionIndex,
      appMajorMinor,
      appVersion,
    },
  },
})
