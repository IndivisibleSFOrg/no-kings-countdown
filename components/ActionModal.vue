<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />

      <!-- Modal panel -->
      <div
        class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        :aria-label="action.headline"
      >
        <!-- Image header -->
        <div class="relative aspect-square w-full flex-shrink-0 max-h-[40vh]">
          <img
            :src="action.image_back.image_url || action.image_front.image_url || defaultImage"
            :alt="action.headline"
            class="absolute inset-0 w-full h-full object-cover"
            referrerpolicy="no-referrer"
          >
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          <!-- Date label -->
          <div class="absolute top-3 left-3 text-white font-bold text-xl leading-none drop-shadow">
            {{ dateLabel }}
          </div>

          <!-- Image attribution: lower left -->
          <a
            v-if="(action.image_back.artist_url || action.image_front.artist_url) && settings.showImageAttributions"
            :href="action.image_back.artist_url || action.image_front.artist_url"
            target="_blank"
            rel="noopener noreferrer"
            class="absolute bottom-3 left-3 bg-isf-blue-dark/90 text-white text-[10px] px-1.5 py-0.5 rounded leading-none hover:bg-isf-blue-dark transition-colors"
            @click.stop
          >{{ action.image_back.artist_name || action.image_front.artist_name || '©' }}</a>

          <!-- Share + completion + close: upper right -->
          <div class="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              id="tour-action-share"
              class="rounded-full w-8 h-8 flex items-center justify-center hover:brightness-110 text-white transition-colors"
              :class="isShared(action.date) ? 'bg-state-complete' : 'bg-state-incomplete'"
              aria-label="Share"
              @click="handleShareButtonClick"
              @pointerdown="isShared(action.date) ? holdShare.start($event) : undefined"
              @pointerup="holdShare.cancel()"
              @pointerleave="holdShare.cancel()"
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
              id="tour-action-complete"
              class="rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors"
              :class="isComplete(action.date) ? 'bg-state-complete hover:brightness-110' : 'bg-state-incomplete hover:brightness-110'"
              :title="isComplete(action.date) ? 'Hold to mark incomplete' : 'Mark complete'"
              @click="handleCompleteButtonClick(action.date)"
              @pointerdown="isComplete(action.date) ? holdComplete.start($event) : undefined"
              @pointerup="holdComplete.cancel()"
              @pointerleave="holdComplete.cancel()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              class="text-white bg-black/30 hover:bg-black/50 rounded-full p-1.5 transition-colors"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Hold-to-reset hint -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-1"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="holdShare.showHint.value || holdComplete.showHint.value"
              class="absolute top-12 right-2 pointer-events-none z-10 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            >
              Hold briefly to reset
            </div>
          </Transition>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
          <h2
            class="font-bold text-isf-blue-dark text-lg leading-snug"
            v-html="renderInlineMarkdown(action.headline)"
          />

          <div
            v-if="action.details"
            class="markdown-content text-isf-blue-dark text-sm leading-relaxed"
            v-html="renderMarkdown(action.details)"
          />

          <!-- CTA link -->
          <a
            v-if="action.link_url && action.link_url !== '#'"
            id="tour-action-cta"
            :href="action.link_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 bg-btn-primary hover:bg-btn-primary-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            @click="trackCtaClick(formatDateKey(action.date), action.link_url)"
          >
            {{ action.link_text || 'Learn more' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        <!-- Clipboard share notice -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="shareNotice"
            class="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-2 bg-[#f9c430]/80 rounded-lg px-4 py-3 flex items-center justify-center cursor-pointer z-20"
            @click="shareNotice = null"
          >
            <span class="text-isf-blue-dark font-semibold text-sm text-center leading-snug">{{ shareNotice }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import defaultImage from '~/assets/christy-dalmat-y_z3rURYpR0-unsplash.webp'
import { formatDateKey } from '~/composables/dateHelpers'
import { useActionCompletion } from '~/composables/useActionCompletion'
import { useActionSharing } from '~/composables/useActionSharing'
import { useHoldToUnset } from '~/composables/useHoldToUnset'
import { renderInlineMarkdown, renderMarkdown } from '~/composables/useMarkdown'

interface Props {
  action: ActionItem
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const { isComplete, toggleComplete, completedKeys } = useActionCompletion()
const { isShared, markShared, toggleShared } = useActionSharing()
const { trackShareDetail, trackCompleteAction, trackUncompleteAction, trackCtaClick } = useAnalytics()
const { startModalTour } = useModalTour()
const { startShareTour } = useShareTour()
const { settings } = useSettings()

const holdShare = useHoldToUnset(() => {
  toggleShared(props.action.date)
})

const holdComplete = useHoldToUnset(() => {
  if (isComplete(props.action.date)) {
    toggleComplete(props.action.date)
    trackUncompleteAction(formatDateKey(props.action.date))
  }
})

function handleCompleteButtonClick(date: Date) {
  if (holdComplete.holdCompleted.value) {
    holdComplete.holdCompleted.value = false
    return
  }
  if (!isComplete(date)) {
    toggleComplete(date)
    trackCompleteAction(formatDateKey(date))
    // On the very first completion ever, launch the share tour
    if (completedKeys.value.size === 1 && !settings.value.tourSeenShare) {
      nextTick(() => setTimeout(() => startShareTour('#tour-action-share'), 300))
    }
  }
}

const dateLabel = computed(() => {
  const d = props.action.date
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
  return `${month} ${day} (${dayName})`
})

const shareNotice = ref<string | null>(null)
let shareNoticeTimer: ReturnType<typeof setTimeout> | null = null

function handleShareButtonClick() {
  if (holdShare.holdCompleted.value) {
    holdShare.holdCompleted.value = false
    return
  }
  shareAction()
}

async function shareAction() {
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // Start modal tour for first-time modal viewers (deferred to let DOM settle)
  nextTick(() => setTimeout(startModalTour, 500))
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (shareNoticeTimer)
    clearTimeout(shareNoticeTimer)
})
</script>

<style scoped>
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(strong) {
  font-weight: 700;
}
.markdown-content :deep(em) {
  font-style: italic;
}
.markdown-content :deep(a) {
  color: var(--isf-blue);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.markdown-content :deep(a:hover) {
  color: var(--isf-blue-dark);
}
.markdown-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}
.markdown-content :deep(code) {
  background: #f3f4f6;
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-size: 0.875em;
}
</style>
