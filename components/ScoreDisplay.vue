<template>
  <div v-if="campaignActions.length > 0" class="relative flex items-center gap-4">
    <!-- ── Left: score + share ────────────────────────────────────────── -->
    <div class="flex flex-col items-end gap-2">
      <div class="text-right">
        <span
          class="font-sans text-2xl font-bold leading-none"
          :class="completedCount === totalAvailable && totalAvailable > 0 ? 'text-isf-green' : 'text-isf-gold-dark'"
        >{{ completedCount }}/{{ totalAvailable }}</span>
        <p class="text-xs text-isf-slate mt-0.5">
          completed so far
        </p>
      </div>
      <button
        id="tour-share-progress"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-isf-blue text-white text-sm font-semibold hover:bg-isf-navy transition-colors whitespace-nowrap"
        @click="handleShare"
      >
        <Share2 :size="14" />
        Share progress
      </button>
    </div>

    <!-- ── Right: calendar dot grid ──────────────────────────────────── -->
    <div>
      <!-- Day-of-week header -->
      <div class="grid gap-0.5 mb-0.5" style="grid-template-columns: repeat(7, 1fr)">
        <div
          v-for="label in DOW_LABELS"
          :key="label"
          class="w-3 h-3 flex items-center justify-center text-[7px] font-mono text-isf-slate/50 select-none"
        >
          {{ label }}
        </div>
      </div>
      <!-- Dots: offset padding + action dots -->
      <div class="grid gap-0.5" style="grid-template-columns: repeat(7, 1fr)">
        <div
          v-for="n in startOffset"
          :key="`pad-${n}`"
          class="w-3 h-3"
        />
        <div
          v-for="dot in calendarDots"
          :key="dot.key"
          class="w-3 h-3 rounded-sm transition-colors duration-300"
          :class="[
            dot.empty ? '' : dot.cls,
            dot.action && (dot.isAvailable || isDevMode) ? 'cursor-pointer hover:brightness-110' : 'cursor-default',
          ]"
          :title="dot.label"
          @click="dot.action && (dot.isAvailable || isDevMode) ? openDetail(dot.action) : undefined"
        />
      </div>
    </div>

    <!-- ── Clipboard share notice bubble ─────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="shareNotice"
        class="absolute top-full mt-2 right-0 bg-isf-navy text-white text-xs text-center px-4 py-2.5 rounded-lg shadow-lg whitespace-nowrap z-10"
      >
        {{ shareNotice }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { Share2 } from 'lucide-vue-next'
import { computed, inject, ref } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'
import { useActionCompletion } from '~/composables/useActionCompletion'

interface Props {
  actions: ActionItem[]
}

const props = defineProps<Props>()
const { completedKeys } = useActionCompletion()
const { isDevMode } = useDevMode()
const openDetail = inject<(action: ActionItem) => void>('openDetail', () => {})

const DOW_LABELS = ['M', 'T', 'W', 'R', 'F', 'S', 'X']

const HAPPY_EMOJIS = ['😄', '🚀', '🍾', '🎉', '✨', '🌟', '💪', '🎊', '🥳']
function happyEmoji(key: string) {
  return HAPPY_EMOJIS[
    [...key].reduce((n, c) => n + c.charCodeAt(0), 0) % HAPPY_EMOJIS.length
  ]
}

const SAD_EMOJIS = ['😕', '😔', '😞', '😟', '🙁', '😣', '😩', '💔', '😿']
function sadEmoji(key: string) {
  return SAD_EMOJIS[
    [...key].reduce((n, c) => n + c.charCodeAt(0), 0) % SAD_EMOJIS.length
  ]
}

// ── Sorted actions ────────────────────────────────────────────────────────
const sortedActions = computed(() =>
  [...props.actions].sort((a, b) => a.date.getTime() - b.date.getTime()),
)

// ── Campaign actions: drop outliers before the 1st of the last action's month
// e.g. Feb 27/28 bleed-in entries are excluded when the campaign is in March.
// In dev mode, skip the filter so testing actions on earlier dates are visible.
const campaignActions = computed(() => {
  const sorted = sortedActions.value
  if (!sorted.length)
    return sorted
  if (isDevMode.value)
    return sorted
  const last = sorted[sorted.length - 1].date
  const campaignStart = new Date(last.getFullYear(), last.getMonth(), 1)
  return sorted.filter(a => a.date >= campaignStart)
})

// ── Calendar offset: empty cells before first action ─────────────────────
// Mon-start: (getDay() + 6) % 7 → Mon=0, Tue=1, … Sun=6
const startOffset = computed(() =>
  campaignActions.value.length ? (campaignActions.value[0].date.getDay() + 6) % 7 : 0,
)

// ── Per-dot data: one cell per day from first to last action ─────────────
// Mirrors CalendarView's day-by-day iteration so each dot lands on the
// correct weekday column, with empty spacer cells for actionless days.
const calendarDots = computed(() => {
  if (!campaignActions.value.length)
    return []
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const todayKey = formatDateKey(new Date())

  // Build a date → action lookup
  const byKey = new Map(campaignActions.value.map(a => [formatDateKey(a.date), a]))

  const first = campaignActions.value[0].date
  const last = campaignActions.value[campaignActions.value.length - 1].date

  const cells: Array<{ key: string, action: ActionItem | null, label: string, isCompleted: boolean, isAvailable: boolean, isToday: boolean, cls: string, empty: boolean }> = []
  const cur = new Date(first)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (cur <= last) {
    const key = formatDateKey(cur)
    const action = byKey.get(key)
    if (action) {
      const isCompleted = completedKeys.value.has(key)
      const isAvailable = cur <= now
      const isToday = key === todayKey
      cells.push({
        key,
        action,
        label: `${cur.toLocaleString('en-US', { month: 'short', day: 'numeric' })
        } – ${isCompleted ? `completed ${happyEmoji(key)}` : isToday ? 'still time today ❓' : isAvailable ? `incomplete ${sadEmoji(key)}` : 'upcoming'}`,
        isCompleted,
        isAvailable,
        isToday,
        empty: false,
        cls: isCompleted
          ? 'bg-isf-green'
          : isToday
            ? 'bg-isf-gold'
            : isAvailable
              ? 'bg-isf-red'
              : 'bg-gray-200',
      })
    }
    else {
      cells.push({ key: `empty-${key}`, action: null, label: '', isCompleted: false, isAvailable: false, isToday: false, empty: true, cls: '' })
    }
    cur.setDate(cur.getDate() + 1)
  }
  return cells
})

const totalAvailable = computed(() => calendarDots.value.filter(d => !d.empty && d.isAvailable).length)
const completedCount = computed(() => calendarDots.value.filter(d => !d.empty && d.isCompleted).length)

// ── Emoji grid for share text (calendar-aligned) ──────────────────────────
const _emojiGrid = computed(() => {
  const pad = Array.from({ length: startOffset.value }, () => '⬛')
  const cells = [
    ...pad,
    ...calendarDots.value.map(d =>
      d.empty ? '⬛' : d.isCompleted ? '✅' : d.isToday ? '❓' : d.isAvailable ? '❌' : '⬜',
    ),
  ]
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7).join(''))
  }
  return rows.join('\n')
})

const shareText = computed(() =>
  `No Kings Countdown ✊\n${completedCount.value}/${totalAvailable.value} civic actions completed so far\n\nJoin me! https://nokingscountdown.org`,
)

// ── Share handler ─────────────────────────────────────────────────────────
const shareNotice = ref<string | null>(null)
let shareNoticeTimer: ReturnType<typeof setTimeout> | null = null
const { trackShareProgress } = useAnalytics()

async function handleShare() {
  trackShareProgress()
  if (navigator.share) {
    try {
      await navigator.share({ text: shareText.value })
    }
    catch {
      // user cancelled — ignore
    }
  }
  else {
    try {
      await navigator.clipboard.writeText(shareText.value)
    }
    catch {
      // clipboard may be blocked; still show notice anyway
    }
    if (shareNoticeTimer)
      clearTimeout(shareNoticeTimer)
    shareNotice.value = 'Message copied to clipboard! Paste it on social media or in a text to share.'
    shareNoticeTimer = setTimeout(() => {
      shareNotice.value = null
    }, 6000)
  }
}
</script>
