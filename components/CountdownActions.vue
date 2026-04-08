<template>
  <div>
    <!-- Header -->
    <header :class="isLocalDev ? 'bg-isf-gold-light' : 'bg-white'" class="border-b-4 border-isf-blue shadow-md">
      <div class="relative max-w-7xl mx-auto px-4 py-3 pr-14">
        <!-- Hamburger trigger — absolute upper-right -->
        <button
          class="absolute top-3 right-4 text-isf-blue hover:opacity-70 transition-opacity p-1.5 rounded"
          aria-label="Open menu"
          @click="menuOpen = true"
        >
          <Menu :size="24" />
        </button>

        <!-- Hero text -->
        <div>
          <h1 class="font-sans text-4xl font-black text-isf-blue leading-tight mb-1">
            Good Trouble Daily
          </h1>
          <p class="text-base text-isf-blue">
            Build a daily habit of civic resistance — one small action, under 15 minutes, every day. Track and share your progress to help grow the community standing up for democracy.
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-8 md:py-12 max-w-7xl mx-auto px-4">
      <GridView v-if="effectiveLayout === 'grid'" :actions="actions" :highlight-date="highlightDate" />
      <CalendarView v-else :actions="actions" />
    </main>

    <!-- Dev mode toggle (lower-left, local dev only) -->
    <DevModeToggle />

    <!-- Action detail overlay -->
    <ActionModal v-if="selectedAction" :action="selectedAction" @close="closeDetail" />

    <!-- Sliding menu tray -->
    <MenuTray :actions="props.actions" :open="menuOpen" @close="menuOpen = false" />

    <!-- Go To Today button — visible only when the today card is off-screen -->
    <Transition name="fade">
      <button
        v-if="!todayInView"
        class="btn-gold rounded-full fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 shadow-lg z-40"
        @click="scrollToToday"
      >
        <CalendarDays :size="18" />
        Go To Today
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { CalendarDays, Menu } from 'lucide-vue-next'
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

const isLocalDev = import.meta.dev
const menuOpen = ref(false)

// --- Detail overlay ---
const selectedAction = ref<ActionItem | null>(null)
const highlightDate = ref<string | null>(null)
let highlightClearTimer: ReturnType<typeof setTimeout> | null = null
const { isDevMode: isDev } = useDevMode()

// --- Go To Today button ---
const todayInView = ref(true)
let todayObserver: IntersectionObserver | null = null

function scrollToToday() {
  const todayKey = formatDateKey(new Date())
  document.getElementById(`action-${todayKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function observeTodayCard() {
  const todayKey = formatDateKey(new Date())
  const el = document.getElementById(`action-${todayKey}`)
  if (!el)
    return
  todayObserver?.disconnect()
  todayObserver = new IntersectionObserver(
    ([entry]) => { todayInView.value = entry.isIntersecting },
    { threshold: 0.1 },
  )
  todayObserver.observe(el)
}

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
    if (actions.length) {
      nextTick(observeTodayCard)
    }
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (highlightClearTimer)
    clearTimeout(highlightClearTimer)
  todayObserver?.disconnect()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
