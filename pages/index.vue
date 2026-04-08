<template>
  <!-- The countdown UI lives in layouts/default.vue -->
</template>

<script setup lang="ts">
useHead({
  title: 'Good Trouble Daily',
  meta: [
    { name: 'description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    // OpenGraph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://goodtroubledaily.org/' },
    { property: 'og:title', content: 'Good Trouble Daily' },
    { property: 'og:description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    { property: 'og:image', content: 'https://goodtroubledaily.org/og-image.webp' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://goodtroubledaily.org/' },
    { name: 'twitter:title', content: 'Good Trouble Daily' },
    { name: 'twitter:description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    { name: 'twitter:image', content: 'https://goodtroubledaily.org/og-image.webp' },
  ],
})
</script>
