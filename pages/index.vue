<template>
  <!-- The countdown UI lives in layouts/default.vue -->
</template>

<script setup lang="ts">
useHead({
  title: 'No Kings Countdown',
  meta: [
    { name: 'description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
    // OpenGraph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://nokingscountdown.org/' },
    { property: 'og:title', content: 'No Kings Countdown' },
    { property: 'og:description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
    { property: 'og:image', content: 'https://nokingscountdown.org/og-image.webp' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://nokingscountdown.org/' },
    { name: 'twitter:title', content: 'No Kings Countdown' },
    { name: 'twitter:description', content: 'A daily action calendar counting down to the No Kings March on March 28, 2026' },
    { name: 'twitter:image', content: 'https://nokingscountdown.org/og-image.webp' },
  ],
})
</script>
