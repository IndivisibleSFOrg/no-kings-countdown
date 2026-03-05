<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />

      <div
        class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Image Artists"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-isf-tinted flex-shrink-0">
          <h2 class="font-bold text-isf-navy text-lg">
            Image Artists
          </h2>
          <button
            class="text-isf-slate hover:text-isf-navy bg-transparent rounded-full p-1.5 transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-5 overflow-y-auto">
          <p class="text-isf-navy text-sm leading-relaxed mb-4">
            The images in this countdown were created by these artists. Click a name to visit their profile or portfolio.
          </p>

          <div v-if="artists.length" class="grid grid-cols-2 gap-x-4 gap-y-2">
            <a
              v-for="artist in artists"
              :key="artist.name"
              :href="artist.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-isf-blue hover:text-isf-navy text-sm underline underline-offset-2 transition-colors truncate"
            >{{ artist.name }}</a>
          </div>
          <p v-else class="text-sm text-isf-slate italic">
            No artist data available yet.
          </p>
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 pt-3 border-t border-isf-tinted flex justify-end flex-shrink-0">
          <button
            class="bg-isf-blue hover:bg-isf-blue-dark text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ close: [] }>()

const { communityActions } = useGoogleSheetsData()

interface Artist {
  name: string
  url: string
}

const artists = computed<Artist[]>(() => {
  if (!communityActions.value)
    return []
  const seen = new Set<string>()
  const result: Artist[] = []
  for (const action of communityActions.value) {
    for (const img of [action.image_front, action.image_back]) {
      if (img.artist_name && img.artist_url && !seen.has(img.artist_name)) {
        seen.add(img.artist_name)
        result.push({ name: img.artist_name, url: img.artist_url })
      }
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
