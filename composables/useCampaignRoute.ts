import type { Campaign } from '~/types/campaign'

/**
 * Resolves the current campaign slug and config from three possible sources,
 * in priority order:
 *   1. A prop passed directly to the component (used by the campaign layout
 *      when mounted via the host-router plugin on a campaign domain)
 *   2. The `campaign_slug` route param (used by /campaign/[campaign_slug] pages
 *      on the GTD domain)
 *   3. The `campaign-host-slug` global state set by the host-router plugin
 *      (used by deeply nested components like ArtistsModal that have no prop)
 *
 * Also derives `navigationBase`:
 *   - '/campaign/<slug>'  when accessed via the GTD domain path
 *   - ''                  when accessed via a campaign's own domain (the plugin
 *                         registers routes at / /about etc., so links stay
 *                         relative to the root)
 */
export function useCampaignRoute(propSlug?: string) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const hostSlug = useState<string | null>('campaign-host-slug', () => null)

  const slug = computed(() =>
    propSlug
    ?? (route.params.campaign_slug as string | undefined)
    ?? hostSlug.value
    ?? '',
  )

  const campaign = computed<Campaign | null>(() => {
    if (!slug.value)
      return null
    return config.public.campaigns[slug.value] ?? null
  })

  // Use the full /campaign/<slug> prefix when on GTD domain (param present).
  // Use empty string when on the campaign's own domain (no param).
  const navigationBase = computed(() =>
    route.params.campaign_slug ? `/campaign/${slug.value}` : '',
  )

  // Convenience: the path to navigate to when closing a campaign sub-page.
  const homePath = computed(() => navigationBase.value || '/')

  return { slug, campaign, navigationBase, homePath }
}
