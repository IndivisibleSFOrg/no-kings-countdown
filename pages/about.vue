<template>
  <AboutModal
    @close="navigateTo('/')"
    @privacy="navigateTo('/privacy')"
  />
</template>

<script setup lang="ts">
useHead({ title: 'About — No Kings Countdown' })
</script>
