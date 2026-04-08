<template>
  <!-- The countdown UI lives in layouts/campaign.vue -->
</template>

<script setup lang="ts">
const props = defineProps<{ campaignSlug?: string }>()

definePageMeta({ layout: 'campaign' })

const { campaign } = useCampaignRoute(props.campaignSlug)

useHead(computed(() => ({
  title: campaign.value?.name ?? 'Good Trouble Daily',
})))
</script>
