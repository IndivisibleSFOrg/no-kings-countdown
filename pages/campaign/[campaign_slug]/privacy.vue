<template>
  <PrivacyModal @close="navigateTo(homePath)" />
</template>

<script setup lang="ts">
const props = defineProps<{ campaignSlug?: string }>()

definePageMeta({ layout: 'campaign' })

const { homePath } = useCampaignRoute(props.campaignSlug)

useHead({ title: 'Privacy — Good Trouble Daily' })
</script>
