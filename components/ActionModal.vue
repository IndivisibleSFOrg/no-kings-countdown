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
        <div class="relative aspect-square w-full flex-shrink-0">
          <img
            :src="action.image_back.image_url || action.image_front.image_url || defaultImage"
            :alt="action.headline"
            class="absolute inset-0 w-full h-full object-cover"
            referrerpolicy="no-referrer"
          />
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
            class="absolute bottom-3 left-3 bg-isf-navy/90 text-white text-[10px] px-1.5 py-0.5 rounded leading-none hover:bg-isf-navy transition-colors"
            @click.stop
          >{{ action.image_back.artist_name || action.image_front.artist_name || '©' }}</a>

          <!-- Close button -->
          <button
            class="absolute top-3 right-3 text-white bg-black/30 hover:bg-black/50 rounded-full p-1.5 transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="aspect-square w-full flex-shrink-0 overflow-y-auto p-5 flex flex-col gap-4">
          <div class="flex items-start gap-2">
            <h2
              class="font-bold text-isf-navy text-lg leading-snug flex-1"
              v-html="renderInlineMarkdown(action.headline)"
            />
            <!-- Share — always available for revealed actions -->
            <button
              id="tour-action-share"
              class="flex-shrink-0 text-isf-slate hover:text-isf-red transition-colors p-0.5 mt-0.5"
              aria-label="Share"
              @click="shareAction"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <!-- Completion toggle -->
            <button
              id="tour-action-complete"
              class="flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors mt-0.5"
              :class="isComplete(action.date) ? 'bg-isf-green hover:bg-isf-green-dark' : 'bg-gray-400/80 hover:bg-gray-500'"
              :title="isComplete(action.date) ? 'Mark incomplete' : 'Mark complete'"
              @click="handleToggleComplete(action.date)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>

          <div
            v-if="action.details"
            class="markdown-content text-isf-navy text-sm leading-relaxed"
            v-html="renderMarkdown(action.details)"
          />

          <!-- CTA link -->
          <a
            v-if="action.link_url && action.link_url !== '#'"
            id="tour-action-cta"
            :href="action.link_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 bg-isf-red hover:bg-isf-red-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
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
          enter-from-class="opacity-0 translate-y-2"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="shareNotice"
            class="absolute bottom-4 left-4 right-4 bg-isf-navy text-white text-xs text-center px-4 py-2.5 rounded-lg shadow-lg"
          >
            {{ shareNotice }}
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import defaultImage from '~/assets/christy-dalmat-y_z3rURYpR0-unsplash.webp';
import { renderMarkdown, renderInlineMarkdown } from '~/composables/useMarkdown';
import type { ActionItem } from '~/composables/googleSheets';
import { useActionCompletion } from '~/composables/useActionCompletion';
import { formatDateKey } from '~/composables/dateHelpers';

interface Props {
  action: ActionItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const { isComplete, toggleComplete, completedKeys } = useActionCompletion();
const { trackShareDetail, trackCompleteAction } = useAnalytics();
const { startModalTour } = useModalTour();
const { startShareTour } = useShareTour();
const { settings } = useSettings();

const handleToggleComplete = (date: Date) => {
  const wasComplete = isComplete(date);
  toggleComplete(date);
  if (!wasComplete) {
    trackCompleteAction(formatDateKey(date));
    // On the very first completion ever, launch the share tour
    if (completedKeys.value.size === 1 && !settings.value.tourSeenShare) {
      nextTick(() => setTimeout(startShareTour, 300));
    }
  }
};

const dateLabel = computed(() => {
  const d = props.action.date;
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

const shareNotice = ref<string | null>(null);
let shareNoticeTimer: ReturnType<typeof setTimeout> | null = null;

const shareAction = async () => {
  trackShareDetail(formatDateKey(props.action.date));
  const shareTitle = `No Kings 3 Countdown: ${props.action.headline}`;
  const shareText = props.action.social_message || props.action.details || '';
  const shareUrl = window.location.href;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
    } catch {
      // User cancelled — ignore
    }
  } else {
    const fullText = [shareTitle, shareText, shareUrl].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      // Clipboard blocked — still show notice
    }
    if (shareNoticeTimer) clearTimeout(shareNoticeTimer);
    shareNotice.value = 'Copied to clipboard! Paste on social media or in a text to share.';
    shareNoticeTimer = setTimeout(() => {
      shareNotice.value = null;
    }, 6000);
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  // Start modal tour for first-time modal viewers (deferred to let DOM settle)
  nextTick(() => setTimeout(startModalTour, 500));
});
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
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
  color: var(--color-isf-blue, #1b5fa3);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.markdown-content :deep(a:hover) {
  color: var(--color-isf-blue-dark, #134880);
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
