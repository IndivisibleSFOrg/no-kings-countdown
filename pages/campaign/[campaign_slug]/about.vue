<template>
  <AboutModal @close="navigateTo(homePath)" />
</template>

<script setup lang="ts">
const props = defineProps<{ campaignSlug?: string }>()

definePageMeta({ layout: 'campaign' })

const { campaign, homePath } = useCampaignRoute(props.campaignSlug)

useHead(computed(() => ({
  title: `About — ${campaign.value?.name ?? 'Good Trouble Daily'}`,
})))
</script>
