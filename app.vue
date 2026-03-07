<template>
  <Html lang="en">
    <Body class="antialiased">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
  },
})

const { init: initBuildMeta } = useBuildMeta()
const { setBuildMetadata } = useAnalytics()
onMounted(() => {
  initBuildMeta()
  setBuildMetadata()
})
</script>
