<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-b-4 border-isf-blue shadow-md">
      <div class="relative max-w-7xl mx-auto px-4 py-3 pr-14">
        <!-- Hamburger trigger — absolute upper-right -->
        <button
          id="tour-score"
          class="absolute top-3 right-4 text-isf-blue hover:opacity-70 transition-opacity p-1.5 rounded"
          aria-label="Open menu"
          @click="menuOpen = true"
        >
          <Menu :size="24" />
        </button>

        <!-- Hero text -->
        <div id="tour-title">
          <h1 class="font-sans text-4xl font-black text-isf-blue leading-tight mb-1">
            No Kings 3 Countdown
          </h1>
          <p class="text-base text-isf-blue">
            Create a daily habit of small actions with big impacts that build momentum toward <a href="https://nokings.org/" target="_blank" rel="noopener noreferrer" class="font-bold underline hover:text-isf-blue transition-colors">No Kings 3</a> on March 28. <br>Track and share your progress to help build the community that will repel authoritarianism in the United States.
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="tour-main" class="py-8 md:py-12 max-w-7xl mx-auto px-4">
      <GridView v-if="effectiveLayout === 'grid'" :actions="actions" :highlight-date="highlightDate" />
      <CalendarView v-else :actions="actions" />
    </main>

    <!-- Dev mode toggle (lower-left, local dev only) -->
    <DevModeToggle />

    <!-- Action detail overlay -->
    <ActionModal v-if="selectedAction" :action="selectedAction" @close="closeDetail" />

    <!-- Sliding menu tray -->
    <MenuTray :actions="props.actions" :open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { Menu } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'
import ActionModal from './ActionModal.vue'
import MenuTray from './MenuTray.vue'

interface Props {
  actions: ActionItem[]
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)

// --- Detail overlay ---
const selectedAction = ref<ActionItem | null>(null)
const highlightDate = ref<string | null>(null)
let highlightClearTimer: ReturnType<typeof setTimeout> | null = null
const { isDevMode: isDev } = useDevMode()

function isActionFuture(action: ActionItem) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return action.date > today
}

const { trackViewDetail } = useAnalytics()

function openDetail(action: ActionItem) {
  if (isActionFuture(action) && !isDev.value)
    return
  selectedAction.value = action
  trackViewDetail(formatDateKey(action.date))
  router.push({ query: { ...route.query, date: formatDateKey(action.date) } })
}

function closeDetail() {
  selectedAction.value = null
  const q = { ...route.query }
  delete q.date
  delete q.detail
  router.push({ query: q })
}

provide('openDetail', openDetail)

type LayoutType = 'grid' | 'calendar'

// Track window width to auto-switch calendar → grid on narrow screens
const CALENDAR_BREAKPOINT = 1200
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
function onResize() {
  windowWidth.value = window.innerWidth
}

const effectiveLayout = computed<LayoutType>(() =>
  windowWidth.value < CALENDAR_BREAKPOINT ? 'grid' : 'calendar',
)

// Auto-open from URL on load (actions arrive async, so watch for them)
watch(
  () => props.actions,
  (actions) => {
    const key = (route.query.date || route.query.detail) as string | undefined
    if (key && actions.length && !selectedAction.value && !highlightDate.value) {
      const match = actions.find(a => formatDateKey(a.date) === key)
      if (match && (!isActionFuture(match) || isDev.value)) {
        if (effectiveLayout.value === 'grid') {
          // Mobile: scroll to card + highlight
          highlightDate.value = key
          nextTick(() => {
            document.getElementById(`action-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          })
          if (highlightClearTimer)
            clearTimeout(highlightClearTimer)
          highlightClearTimer = setTimeout(() => {
            highlightDate.value = null
          }, 4000)
          trackViewDetail(key)
        }
        else {
          // Desktop: open modal
          selectedAction.value = match
          trackViewDetail(formatDateKey(match.date))
        }
        // Normalize legacy ?detail= param to ?date= in the URL bar
        if (route.query.detail) {
          const { detail: _detail, ...rest } = route.query
          router.replace({ query: { ...rest, date: key } })
        }
      }
      else if (match && isActionFuture(match) && !isDev.value) {
        // Strip the blocked future date/detail param from the URL silently
        const q = { ...route.query }
        delete q.date
        delete q.detail
        router.replace({ query: q })
      }
    }
  },
  { immediate: true },
)

const { startHomeTour } = useHomeTour()

onMounted(() => {
  window.addEventListener('resize', onResize)
  // Start home tour for first-time visitors (deferred to let DOM settle)
  nextTick(() => setTimeout(startHomeTour, 400))
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (highlightClearTimer)
    clearTimeout(highlightClearTimer)
})
</script>
