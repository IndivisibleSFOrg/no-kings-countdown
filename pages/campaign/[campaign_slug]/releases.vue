<template>
  <ReleaseModal @close="navigateTo(homePath)" />
</template>

<script setup lang="ts">
const props = defineProps<{ campaignSlug?: string }>()

definePageMeta({ layout: 'campaign' })

const { homePath } = useCampaignRoute(props.campaignSlug)

useHead({ title: 'What\'s New — Good Trouble Daily' })
</script>
