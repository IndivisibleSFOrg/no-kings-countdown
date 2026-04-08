import type { Router } from 'vue-router'
import CampaignAbout from '~/pages/campaign/[campaign_slug]/about.vue'
import CampaignArtists from '~/pages/campaign/[campaign_slug]/artists.vue'
import CampaignIndex from '~/pages/campaign/[campaign_slug]/index.vue'
import CampaignPrivacy from '~/pages/campaign/[campaign_slug]/privacy.vue'
import CampaignReleases from '~/pages/campaign/[campaign_slug]/releases.vue'

/**
 * On a campaign's own domain (e.g. nokingscountdown.org), replaces the
 * top-level routes (/, /about, /artists, /privacy, /releases) with the
 * corresponding campaign page components, passing the resolved slug as a prop.
 *
 * This keeps the browser URL on the campaign domain while routing through the
 * same components used at /campaign/<slug>/... on the GTD domain — no redirect,
 * no URL change.
 *
 * Also stores the resolved slug in useState('campaign-host-slug') so that
 * deeply nested components (e.g. ArtistsModal) can call useCampaignRoute()
 * without needing a prop.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const slug = config.public.domainToSlug[window.location.hostname]
  if (!slug)
    return

  // Make the slug available to all components via useCampaignRoute().
  useState<string | null>('campaign-host-slug', () => null).value = slug

  const router = nuxtApp.$router as Router

  const campaignRoutes = [
    { path: '/', component: CampaignIndex },
    { path: '/about', component: CampaignAbout },
    { path: '/artists', component: CampaignArtists },
    { path: '/privacy', component: CampaignPrivacy },
    { path: '/releases', component: CampaignReleases },
  ]

  for (const { path, component } of campaignRoutes) {
    const existing = router.getRoutes().find(r => r.path === path)
    if (existing?.name)
      router.removeRoute(existing.name)

    router.addRoute({
      path,
      component,
      props: { campaignSlug: slug },
      meta: { layout: 'campaign' },
      name: `campaign-host-${path.slice(1) || 'root'}`,
    })
  }
})
