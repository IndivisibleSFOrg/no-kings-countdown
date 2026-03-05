<template>
  <div class="min-h-screen bg-isf-tinted">
    <CountdownActions
      v-if="communityActions"
      :actions="visibleActions"
    />
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-isf-red" />
    </div>
    <!-- Modal pages render here via <slot> and teleport themselves to <body> -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { communityActions, loadData } = useGoogleSheetsData()
const visibleActions = useVisibleActions(communityActions)

onMounted(loadData)
</script>
