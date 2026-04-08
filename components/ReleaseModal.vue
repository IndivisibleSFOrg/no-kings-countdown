<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleClose">
      <div class="absolute inset-0 bg-black/60" @click="handleClose" />

      <div
        class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog" aria-modal="true" aria-label="What's New"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-isf-tinted flex-shrink-0">
          <h2 class="font-bold text-isf-blue-dark text-lg">
            What's New
          </h2>
          <button
            class="text-isf-slate hover:text-isf-blue-dark bg-transparent rounded-full p-1.5 transition-colors"
            aria-label="Close" @click="handleClose"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Version selector -->
        <div class="px-5 pt-4 pb-2 flex-shrink-0">
          <label for="release-version-select" class="text-xs font-semibold text-isf-slate uppercase tracking-wide block mb-1.5">
            Release
          </label>
          <select
            id="release-version-select"
            v-model="selectedVersion"
            class="w-full border border-isf-tinted rounded-lg px-3 py-2 text-sm text-isf-blue-dark bg-white focus:outline-none focus:ring-2 focus:ring-isf-blue/40 cursor-pointer"
          >
            <option
              v-for="entry in reversedIndex"
              :key="entry.version"
              :value="entry.version"
            >
              {{ entry.version }} — {{ formatDate(entry.date) }}
            </option>
          </select>
        </div>

        <!-- Body -->
        <div class="relative px-5 py-4 overflow-y-auto flex-1">
          <!-- Error -->
          <p v-if="fetchError" class="text-isf-slate text-sm italic">
            Release notes for this version are not available.
          </p>
          <!-- Content (kept visible during load; swapped atomically on completion) -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else class="prose-release" v-html="renderedContent" />
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-isf-tinted flex-shrink-0 flex items-center justify-between">
          <a
            href="https://github.com/reece/good-trouble-daily/releases"
            target="_blank" rel="noopener noreferrer"
            class="text-sm text-isf-slate underline hover:text-isf-blue transition-colors"
          >View detailed release notes →</a>
          <button class="btn-primary" @click="handleClose">
            Got it
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const emit = defineEmits<{
  close: []
}>()

const { appVersion, releaseVersionIndex, markSeen } = useReleaseModal()

/** Versions listed newest-first in the dropdown. */
const reversedIndex = computed(() =>
  [...releaseVersionIndex].reverse(),
)

const selectedVersion = ref(releaseVersionIndex.at(-1)?.version ?? appVersion)
const renderedContent = ref('')
const fetchError = ref(false)

const config = useRuntimeConfig()
const baseURL: string = (config.app as { baseURL?: string }).baseURL ?? '/'

/** Fetch and render the markdown for the selected version.
 * Old content is intentionally kept visible during the fetch to avoid
 * layout shift; renderedContent is only updated on successful completion.
 */
async function loadNotes(version: string) {
  fetchError.value = false
  try {
    const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
    // Strip any prerelease suffix so 1.3.0-rc.0 → 1.3.0.md
    const fileName = version.replace(/-[\w.]+$/, '')
    const url = `${normalizedBase}releases/${fileName}.md`
    const res = await fetch(url)
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    renderedContent.value = renderMarkdown(text)
  }
  catch {
    fetchError.value = true
  }
}

watch(selectedVersion, version => loadNotes(version), { immediate: true })

/** Format an ISO date string (YYYY-MM-DD) as "Month D, YYYY". */
function formatDate(iso: string): string {
  if (!iso)
    return '(future release)'
  // Append midday time to avoid date-shifting across timezone offsets
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function handleClose() {
  markSeen()
  emit('close')
}
</script>

<style scoped>
/* Lightweight prose styles for release note markdown rendered via v-html */
.prose-release :deep(h1),
.prose-release :deep(h2),
.prose-release :deep(h3) {
  @apply font-bold text-isf-blue-dark mt-4 mb-2 first:mt-0;
}
.prose-release :deep(h1) { @apply text-lg; }
.prose-release :deep(h2) { @apply text-base; }
.prose-release :deep(h3) { @apply text-sm; }
.prose-release :deep(p) { @apply text-isf-blue-dark text-sm leading-relaxed mb-3; }
.prose-release :deep(ul) { @apply list-disc pl-5 mb-3 space-y-1; }
.prose-release :deep(ol) { @apply list-decimal pl-5 mb-3 space-y-1; }
.prose-release :deep(li) { @apply text-isf-blue-dark text-sm leading-relaxed; }
.prose-release :deep(a) { @apply underline hover:text-isf-blue; }
.prose-release :deep(strong) { @apply font-semibold; }
.prose-release :deep(code) { @apply font-mono text-xs bg-isf-tinted rounded px-1 py-0.5; }
</style>
