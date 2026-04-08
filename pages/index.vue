<template>
  <main class="max-w-2xl mx-auto px-6 py-16">
    <h1 class="font-sans text-4xl font-black text-isf-blue leading-tight mb-4">
      Good Trouble Daily
    </h1>
    <p class="text-base text-isf-blue-dark leading-relaxed mb-8">
      A platform for daily civic action — one short, meaningful action every day.
    </p>

    <h2 class="font-bold text-isf-blue-dark text-lg mb-4">
      Campaigns
    </h2>
    <ul class="space-y-3">
      <li v-for="(campaign, slug) in campaigns" :key="slug">
        <NuxtLink
          :to="`/campaign/${slug}/`"
          class="block p-4 bg-white rounded-xl border border-isf-tinted hover:shadow-md transition-shadow"
        >
          <span class="font-semibold text-isf-blue">{{ campaign.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const campaigns = config.public.campaigns

useHead({
  title: 'Good Trouble Daily',
  meta: [
    { name: 'description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://goodtroubledaily.org/' },
    { property: 'og:title', content: 'Good Trouble Daily' },
    { property: 'og:description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    { property: 'og:image', content: 'https://goodtroubledaily.org/og-image.webp' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://goodtroubledaily.org/' },
    { name: 'twitter:title', content: 'Good Trouble Daily' },
    { name: 'twitter:description', content: 'A daily calendar for building a habit of civic resistance — one action, under 15 minutes, every day' },
    { name: 'twitter:image', content: 'https://goodtroubledaily.org/og-image.webp' },
  ],
})
</script>
