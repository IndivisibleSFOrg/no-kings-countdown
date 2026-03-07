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
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-btn-primary text-white text-sm font-semibold hover:bg-btn-primary-dark transition-colors whitespace-nowrap"
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
          class="w-3 h-3 rounded-sm transition-colors duration-300 relative flex items-center justify-center"
          :class="[
            dot.empty ? '' : dot.cls,
            dot.action && (dot.isAvailable || isDevMode) ? 'cursor-pointer hover:brightness-110' : 'cursor-default',
          ]"
          :title="dot.label"
          @click="dot.action && (dot.isAvailable || isDevMode) ? openDetail(dot.action) : undefined"
        >
          <span v-if="dot.isShared" class="w-1 h-1 rounded-full bg-white/80 pointer-events-none" />
        </div>
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
        class="absolute top-full mt-2 right-0 bg-isf-blue-dark text-white text-xs text-center px-4 py-2.5 rounded-lg shadow-lg whitespace-nowrap z-10"
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
import { useActionSharing } from '~/composables/useActionSharing'

interface Props {
  actions: ActionItem[]
}

const props = defineProps<Props>()
const { completedKeys } = useActionCompletion()
const { sharedKeys } = useActionSharing()
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

// ── Campaign actions: all actions, sorted. No month filtering — the calendar
// grid shows only rows (weeks) that contain at least one action, so outliers
// on adjacent months simply appear in their own week rows.
const campaignActions = computed(() => sortedActions.value)

// ── Calendar offset: always 0 — each row in the grid is a full Mon–Sun week
const startOffset = computed(() => 0)

// ── Per-dot data: one full Mon–Sun week per row, only weeks with ≥1 action ─
// Walking complete weeks keeps every dot in the correct weekday column;
// weeks that contain no actions are dropped entirely.
const calendarDots = computed(() => {
  if (!campaignActions.value.length)
    return []
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const todayKey = formatDateKey(new Date())

  // Build a date → action lookup
  const byKey = new Map(campaignActions.value.map(a => [formatDateKey(a.date), a]))

  // Snap to the Monday of the first action's week and Sunday of the last's
  const firstAction = campaignActions.value[0].date
  const lastAction = campaignActions.value[campaignActions.value.length - 1].date
  const weekStart = new Date(firstAction)
  weekStart.setDate(firstAction.getDate() - (firstAction.getDay() + 6) % 7)
  const weekEnd = new Date(lastAction)
  weekEnd.setDate(lastAction.getDate() + (6 - (lastAction.getDay() + 6) % 7))

  interface DotCell { key: string, action: ActionItem | null, label: string, isCompleted: boolean, isAvailable: boolean, isToday: boolean, isShared: boolean, cls: string, empty: boolean }

  const result: DotCell[] = []
  const cur = new Date(weekStart)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (cur <= weekEnd) {
    // Build 7 cells for this week, then include the week only if it has an action
    const week: DotCell[] = []
    let hasAction = false
    for (let d = 0; d < 7; d++) {
      const key = formatDateKey(cur)
      const action = byKey.get(key) ?? null
      if (action) {
        hasAction = true
        const isCompleted = completedKeys.value.has(key)
        const isShared = sharedKeys.value.has(key)
        const isAvailable = cur <= now
        const isToday = key === todayKey
        week.push({
          key,
          action,
          label: `${cur.toLocaleString('en-US', { month: 'short', day: 'numeric' })
          } – ${isCompleted ? `completed ${happyEmoji(key)}` : isToday ? 'still time today ❓' : isAvailable ? `incomplete ${sadEmoji(key)}` : 'upcoming'}`,
          isCompleted,
          isAvailable,
          isToday,
          isShared,
          empty: false,
          cls: isCompleted
            ? 'bg-state-complete'
            : isToday
              ? 'bg-state-today'
              : isAvailable
                ? 'bg-state-incomplete'
                : 'bg-state-future',
        })
      }
      else {
        week.push({ key: `empty-${key}`, action: null, label: '', isCompleted: false, isAvailable: false, isToday: false, isShared: false, empty: true, cls: '' })
      }
      cur.setDate(cur.getDate() + 1)
    }
    if (hasAction)
      result.push(...week)
  }
  return result
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
