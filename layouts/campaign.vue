<template>
  <div class="min-h-screen bg-isf-tinted">
    <CountdownActions
      v-if="communityActions && campaign"
      :actions="visibleActions"
    />
    <div v-else-if="!campaign" class="min-h-screen flex items-center justify-center">
      <p class="text-isf-slate">
        Campaign not found.
      </p>
    </div>
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-isf-red" />
    </div>
    <!-- Modal pages render here via <slot> and teleport themselves to <body> -->
    <slot />
    <ReleaseModal v-if="showReleaseModal" @close="showReleaseModal = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{ campaignSlug?: string }>()

const { campaign, slug, navigationBase } = useCampaignRoute(props.campaignSlug)
const actionsUrl = computed(() => campaign.value?.actions_url ?? '')

useHead(computed(() => campaign.value?.favicon_url
  ? { link: [{ rel: 'icon', type: 'image/x-icon', href: campaign.value.favicon_url }] }
  : {},
))

const { communityActions, loadData } = useGoogleSheetsData(slug.value, actionsUrl.value)
const visibleActions = useVisibleActions(communityActions)
const { trackFirstVisit } = useAnalytics()
const { shouldShowReleaseNotes } = useReleaseModal()
const route = useRoute()

const showReleaseModal = ref(false)

onMounted(() => {
  if (actionsUrl.value)
    loadData()
  trackFirstVisit(slug.value)
  const releasesPath = `${navigationBase.value}/releases`
  if (route.path !== releasesPath) {
    showReleaseModal.value = shouldShowReleaseNotes.value
  }
})
</script>
