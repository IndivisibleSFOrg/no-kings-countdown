<template>
  <div
    class="action-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    :class="[
      { flipped: isFlipped },
      isToday ? 'ring-4 ring-isf-blue ring-offset-2' : '',
    ]"
  >
    <div class="action-card-inner">
      <!-- Front -->
      <div class="action-card-face action-card-front rounded-lg overflow-hidden">
        <img
          :src="action.image_front.image_url || defaultImage"
          :alt="action.headline"
          class="absolute inset-0 w-full h-full object-cover"
          referrerpolicy="no-referrer"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        <!-- Date: upper left -->
        <div class="absolute top-2 left-2 text-white font-bold leading-none drop-shadow" :class="props.dateLabelSize ?? 'text-2xl'">
          {{ dateLabel }}
        </div>

        <!-- Today badge -->
        <div
          v-if="isToday"
          class="absolute top-2 right-2 bg-isf-blue text-white text-xs font-semibold px-2 py-0.5 rounded-full"
        >
          Today
        </div>

        <!-- Testing badge (dev mode only) -->
        <div
          v-if="isDev && action.labels.includes('testing')"
          class="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full"
        >
          TEST
        </div>

        <!-- Image attribution: lower left -->
        <a
          v-if="action.image_front.artist_url"
          :href="action.image_front.artist_url"
          target="_blank"
          rel="noopener noreferrer"
          class="image-attribution absolute bottom-2 left-2 bg-isf-navy/90 text-white px-1.5 py-0.5 rounded leading-none hover:bg-isf-navy transition-colors"
          @click.stop
        >{{ action.image_front.artist_name || '©' }}</a>

        <!-- Lock overlay for future cards -->
        <div
          v-if="isFuture && !isDev"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-12 h-12 text-isf-blue"
            style="filter: drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 2px rgba(255,255,255,0.9))"
            aria-label="Locked"
          >
            <path
              fill-rule="evenodd"
              d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Completion badge (clickable → opens detail) -->
        <button
          v-if="!isFuture"
          class="absolute bottom-2 right-2 rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors"
          :class="isComplete(action.date) ? 'bg-isf-green hover:brightness-110' : isToday ? 'bg-isf-gold hover:brightness-110' : 'bg-isf-red hover:brightness-110'"
          :title="isComplete(action.date) ? 'Completed – click for details' : isToday ? 'Still time today – click for details' : 'Not completed – click for details'"
          @click.stop="openDetail(props.action)"
        >
          <template v-if="isComplete(action.date)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </template>
          <template v-else-if="isToday">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </template>
        </button>
      </div>

      <!-- Back -->
      <div class="action-card-face action-card-back rounded-lg overflow-hidden flex flex-col">
        <!-- Upper 50%: image -->
        <div class="relative h-1/2 flex-shrink-0">
          <img
            :src="action.image_back.image_url || defaultImage"
            :alt="action.headline"
            class="absolute inset-0 w-full h-full object-cover"
            referrerpolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          <!-- Date: upper left -->
          <div class="absolute top-2 left-2 text-white font-bold leading-none drop-shadow" :class="props.dateLabelSize ?? 'text-2xl'">
            {{ dateLabel }}
          </div>

          <!-- Image attribution: lower left -->
          <a
            v-if="action.image_back.artist_url"
            :href="action.image_back.artist_url"
            target="_blank"
            rel="noopener noreferrer"
            class="image-attribution absolute bottom-2 left-2 bg-isf-navy/90 text-white px-1.5 py-0.5 rounded leading-none hover:bg-isf-navy transition-colors"
            @click.stop
          >{{ action.image_back.artist_name || '©' }}</a>
        </div>

        <!-- Lower 50%: headline + details preview + actions -->
        <div class="h-1/2 flex-shrink-0 bg-white flex flex-col px-3 py-2 gap-1 min-h-0">
          <p
            class="font-bold text-isf-navy text-sm leading-snug line-clamp-2 flex-shrink-0"
            v-html="renderInlineMarkdown(action.headline)"
          />

          <!-- Details preview: fades out at the bottom -->
          <div
            v-if="action.details"
            class="details-preview relative flex-1 overflow-hidden min-h-0 text-xs text-isf-slate leading-snug"
            v-html="renderMarkdown(action.details)"
          />

          <!-- Bottom row: details (left) + share + complete (right) -->
          <div class="flex items-center justify-between flex-shrink-0">
            <!-- Details link -->
            <button
              class="text-isf-blue hover:text-isf-blue text-xs font-medium underline underline-offset-2 transition-colors flex-shrink-0"
              @click.stop="openDetail(props.action)"
            >
              Details&hellip;
            </button>

            <!-- Completion badge (clickable → opens detail) -->
            <button
              v-if="!isFuture"
              class="rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors"
              :class="isComplete(action.date) ? 'bg-isf-green hover:brightness-110' : isToday ? 'bg-isf-gold hover:brightness-110' : 'bg-isf-red hover:brightness-110'"
              :title="isComplete(action.date) ? 'Completed – click for details' : isToday ? 'Still time today – click for details' : 'Not completed – click for details'"
              @click.stop="openDetail(props.action)"
            >
              <template v-if="isComplete(action.date)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </template>
              <template v-else-if="isToday">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import defaultImage from '~/assets/christy-dalmat-y_z3rURYpR0-unsplash.webp';
import { renderInlineMarkdown, renderMarkdown } from '~/composables/useMarkdown';
import type { ActionItem } from '~/composables/googleSheets';
import { useActionCompletion } from '~/composables/useActionCompletion';

interface Props {
  action: ActionItem;
  showDayName?: boolean;
  dateLabelSize?: string;
  allowModal?: boolean;
}

const props = defineProps<Props>();

const openDetail = inject<(action: ActionItem) => void>('openDetail', () => {});

// Start flipped for past/today cards so users see the content immediately.
const _initToday = new Date();
_initToday.setHours(0, 0, 0, 0);
const isFlipped = ref(props.action.date <= _initToday);
const { isComplete } = useActionCompletion();

const dateLabel = computed(() => {
  const d = props.action.date;
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  if (props.showDayName) {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return `${month} ${day} (${dayName})`;
  }
  return `${month} ${day}`;
});

const isToday = computed(() => {
  const today = new Date();
  const d = props.action.date;
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
});

const isFuture = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return props.action.date > today;
});

const { isDevMode: isDev } = useDevMode();
</script>

<style scoped>
.action-card {
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
