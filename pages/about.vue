<template>
  <AboutModal
    :fetched-at="fetchedAt"
    @close="navigateTo('/')"
    @refresh="loadData"
    @privacy="navigateTo('/privacy')"
  />
</template>

<script setup lang="ts">
useHead({ title: 'About — No Kings Countdown' })

const { fetchedAt, loadData } = useGoogleSheetsData()
</script>
