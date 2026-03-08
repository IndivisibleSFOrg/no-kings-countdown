<template>
  <div
    class="action-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" :class="[
      { flipped: isFlipped },
      isToday ? 'ring-4 ring-state-today ring-offset-2' : (props.highlight ? 'ring-4 ring-state-highlight ring-offset-2' : ''),
    ]"
  >
    <div class="action-card-inner">
      <!-- Front -->
      <div
        class="action-card-face action-card-front rounded-lg overflow-hidden"
        :class="{ 'cursor-pointer': isDev && isFuture }" @click="isDev && isFuture ? isFlipped = true : undefined"
      >
        <img
          :src="action.image_front.image_url || defaultImage" :alt="action.headline"
          class="absolute inset-0 w-full h-full object-cover" referrerpolicy="no-referrer"
        >
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        <!-- Date + pills: upper left column -->
        <div class="absolute top-2 left-2 flex flex-col items-start gap-1">
          <div
            class="text-white font-bold leading-none drop-shadow"
            :style="{ fontSize: props.dateLabelSize ?? '1.5rem' }"
          >
            {{ dateLabel }}
          </div>
          <div v-if="isToday" class="bg-state-today text-isf-blue text-xs font-semibold px-2 py-0.5 rounded-full">
            Today
          </div>
          <div
            v-if="isDev && action.labels.includes('testing')"
            class="bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full"
          >
            TEST
          </div>
        </div>

        <!-- Image attribution: lower left -->
        <a
          v-if="action.image_front.artist_url && settings.showImageAttributions" :href="action.image_front.artist_url"
          target="_blank" rel="noopener noreferrer"
          class="image-attribution absolute bottom-2 left-2 bg-isf-blue-dark/90 text-white px-1.5 py-0.5 rounded leading-none hover:bg-isf-blue-dark transition-colors"
          @click.stop
        >{{ action.image_front.artist_name || '©' }}</a>

        <!-- Lock overlay for future cards -->
        <div v-if="isFuture && !isDev" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            class="w-[40%] h-[40%] text-isf-blue"
            style="filter: drop-shadow(0 0 24px rgba(255,255,255,1)) drop-shadow(0 0 12px rgba(255,255,255,1)) drop-shadow(0 0 6px rgba(255,255,255,0.95))"
            aria-label="Locked"
          >
            <path
              fill-rule="evenodd"
              d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Share + completion: upper right -->
        <div v-if="!isFuture" class="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            :id="`tour-card-share-${formatDateKey(action.date)}`"
            class="rounded-full w-7 h-7 flex items-center justify-center hover:brightness-110 text-white transition-colors"
            :class="isShared(action.date) ? 'bg-state-complete' : 'bg-state-incomplete'"
            aria-label="Share"
            @click.stop="shareAction"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 -translate-x-0.5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            class="rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors"
            :class="isComplete(action.date) ? 'bg-state-complete hover:brightness-110' : 'bg-state-incomplete hover:brightness-110'"
            :title="isComplete(action.date) ? 'Completed – click for details' : 'Not completed – click for details'"
            @click.stop="openDetail(props.action)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Back -->
      <div
        class="action-card-face action-card-back rounded-lg overflow-hidden flex flex-col"
        :class="{ 'cursor-pointer': !isFuture || isDev }"
        @click="(!isFuture || isDev) ? openDetail(props.action) : undefined"
      >
        <!-- Upper 50%: image -->
        <div class="relative h-1/2 flex-shrink-0">
          <img
            :src="action.image_back.image_url || defaultImage" :alt="action.headline"
            class="absolute inset-0 w-full h-full object-cover" referrerpolicy="no-referrer"
          >
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          <!-- Date + pills: upper left column -->
          <div class="absolute top-2 left-2 flex flex-col items-start gap-1">
            <div
              class="text-white font-bold leading-none drop-shadow"
              :style="{ fontSize: props.dateLabelSize ?? '1.5rem' }"
            >
              {{ dateLabel }}
            </div>
            <div v-if="isToday" class="bg-state-today text-isf-blue text-xs font-semibold px-2 py-0.5 rounded-full">
              Today
            </div>
            <div
              v-if="isDev && action.labels.includes('testing')"
              class="bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              TEST
            </div>
          </div>

          <!-- Share + completion: upper right -->
          <div v-if="!isFuture || isDev" class="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              :id="`tour-card-share-${formatDateKey(action.date)}`"
              class="rounded-full w-7 h-7 flex items-center justify-center hover:brightness-110 text-white transition-colors"
              :class="isShared(action.date) ? 'bg-state-complete' : 'bg-state-incomplete'"
              aria-label="Share"
              @click.stop="shareAction"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 -translate-x-0.5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button
              class="rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors"
              :class="isComplete(action.date) ? 'bg-state-complete hover:brightness-110' : 'bg-state-incomplete hover:brightness-110'"
              :title="isComplete(action.date) ? 'Mark incomplete' : 'Mark complete'"
              @click.stop="handleToggleComplete(action.date)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>

          <!-- Image attribution: lower left -->
          <a
            v-if="action.image_back.artist_url && settings.showImageAttributions" :href="action.image_back.artist_url"
            target="_blank" rel="noopener noreferrer"
            class="image-attribution absolute bottom-2 left-2 bg-isf-blue-dark/90 text-white px-1.5 py-0.5 rounded leading-none hover:bg-isf-blue-dark transition-colors"
            @click.stop
          >{{ action.image_back.artist_name || '©' }}</a>
        </div>

        <!-- Lower 50%: headline + details preview + CTA -->
        <div class="h-1/2 flex-shrink-0 bg-white flex flex-col px-3 pt-2 pb-3 gap-1 min-h-0">
          <p
            class="font-bold text-isf-blue-dark text-sm leading-snug line-clamp-2 flex-shrink-0"
            v-html="renderInlineMarkdown(action.headline)"
          />

          <!-- Details preview: fades out at the bottom -->
          <div
            v-if="action.details"
            class="details-preview relative flex-1 overflow-hidden min-h-0 text-xs text-isf-slate leading-snug"
            v-html="renderMarkdown(action.details)"
          />

          <!-- Bottom: CTA -->
          <div class="flex-shrink-0 flex flex-col gap-1.5 mt-auto pt-1">
            <!-- CTA link — only in grid view (not calendar, where the modal carries it) -->
            <a
              v-if="!allowModal && (!isFuture || isDev) && action.link_url && action.link_url !== '#'"
              :href="action.link_url" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-1.5 bg-btn-primary hover:bg-btn-primary-dark text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              @click.stop
            >
              {{ action.link_text || 'Learn more' }}
              <svg
                xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Share notice overlay -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="shareNotice"
        class="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-2 bg-[#f9c430]/80 rounded-lg px-4 py-3 flex items-center justify-center cursor-pointer z-20"
        @click.stop="shareNotice = null"
      >
        <span class="text-isf-blue-dark font-semibold text-sm text-center leading-snug">{{ shareNotice }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { computed, inject, nextTick, onUnmounted, ref } from 'vue'
import defaultImage from '~/assets/christy-dalmat-y_z3rURYpR0-unsplash.webp'
import { formatDateKey } from '~/composables/dateHelpers'
import { useActionCompletion } from '~/composables/useActionCompletion'
import { useActionSharing } from '~/composables/useActionSharing'
import { renderInlineMarkdown, renderMarkdown } from '~/composables/useMarkdown'

interface Props {
  action: ActionItem
  showDayName?: boolean
  dateLabelSize?: string
  allowModal?: boolean
  highlight?: boolean
}

const props = defineProps<Props>()

const openDetail = inject<(action: ActionItem) => void>('openDetail', () => { })

// Start flipped for past/today cards so users see the content immediately.
const _initToday = new Date()
_initToday.setHours(0, 0, 0, 0)
const isFlipped = ref(props.action.date <= _initToday)
const { isComplete, toggleComplete, completedKeys } = useActionCompletion()
const { isShared, markShared, toggleShared } = useActionSharing()
const { trackShareDetail, trackCompleteAction, trackUncompleteAction } = useAnalytics()
const { startShareTour } = useShareTour()

const dateLabel = computed(() => {
  const d = props.action.date
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  if (props.showDayName) {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    return `${month} ${day} (${dayName})`
  }
  return `${month} ${day}`
})

const isToday = computed(() => {
  const today = new Date()
  const d = props.action.date
  return (
    d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate()
  )
})

const isFuture = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return props.action.date > today
})

const { isDevMode: isDev } = useDevMode()
const { settings } = useSettings()

// --- Share ---
const shareNotice = ref<string | null>(null)
let shareNoticeTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (shareNoticeTimer)
    clearTimeout(shareNoticeTimer)
})

// --- Completion toggle (direct, no modal) ---
function handleToggleComplete(date: Date) {
  const wasComplete = isComplete(date)
  toggleComplete(date)
  if (!wasComplete) {
    trackCompleteAction(formatDateKey(date))
    // On the very first completion ever, launch the share tour
    if (completedKeys.value.size === 1 && !settings.value.tourSeenShare) {
      nextTick(() => setTimeout(() => startShareTour(`#tour-card-share-${formatDateKey(date)}`), 300))
    }
  }
  else {
    trackUncompleteAction(formatDateKey(date))
  }
}

async function shareAction() {
  // If already shared, toggle off and return
  if (isShared(props.action.date)) {
    toggleShared(props.action.date)
    return
  }

  trackShareDetail(formatDateKey(props.action.date))
  const shareTitle = `No Kings Countdown: ${props.action.headline}`
  const shareText = props.action.social_message || props.action.details || ''
  const _url = new URL(window.location.href)
  _url.search = ''
  _url.searchParams.set('date', formatDateKey(props.action.date))
  _url.searchParams.set('utm_source', 'share')
  _url.searchParams.set('utm_campaign', 'action')
  const shareUrl = _url.toString()

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
      markShared(props.action.date)
    }
    catch {
      // User cancelled — ignore
    }
  }
  else {
    const fullText = [shareTitle, shareText, shareUrl].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(fullText)
    }
    catch {
      // Clipboard blocked — still show notice
    }
    markShared(props.action.date)
    if (shareNoticeTimer)
      clearTimeout(shareNoticeTimer)
    shareNotice.value = 'Share message copied to clipboard'
    shareNoticeTimer = setTimeout(() => {
      shareNotice.value = null
    }, 5000)
  }
}
</script>

<style scoped>
.action-card {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  perspective: 1000px;
}

.action-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.action-card.flipped .action-card-inner {
  transform: rotateY(180deg);
}

.action-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.action-card-back {
  transform: rotateY(180deg);
}

.details-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
}

.details-preview :deep(p) {
  margin: 0 0 0.2em;
}

.details-preview :deep(p:last-child) {
  margin-bottom: 0;
}

.details-preview :deep(ul),
.details-preview :deep(ol) {
  margin: 0;
  padding-left: 1em;
}

.details-preview :deep(li) {
  margin: 0;
}

.image-attribution {
  font-size: 10px;
  transform: scale(0.8);
  transform-origin: left bottom;
}
</style>
