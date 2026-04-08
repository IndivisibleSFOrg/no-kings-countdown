<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-300 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/50"
        @click="emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <!-- Panel header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-isf-tinted flex-shrink-0">
          <span class="font-bold text-isf-blue-dark text-base">Menu</span>
          <button
            class="text-isf-slate hover:text-isf-blue-dark rounded-full p-1.5 transition-colors"
            aria-label="Close menu"
            @click="emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto">
          <!-- Progress & sharing -->
          <div class="px-5 py-5 border-b border-isf-tinted">
            <h3 class="text-xs font-bold uppercase tracking-widest text-isf-slate mb-4">
              Your Progress
            </h3>
            <div class="flex justify-center">
              <ScoreDisplay :actions="actions" />
            </div>
          </div>

          <!-- Reminders -->
          <div class="px-5 py-5 border-b border-isf-tinted">
            <h3 class="text-xs font-bold uppercase tracking-widest text-isf-slate mb-3">
              Reminders
            </h3>
            <button
              class="flex items-center gap-2 text-sm text-isf-blue hover:text-isf-blue-dark transition-colors"
              @click="handleAddToCalendar"
            >
              <CalendarPlus :size="16" />
              Add to Calendar
            </button>
            <p class="mt-1.5 text-[11px] text-isf-slate leading-snug">
              Downloads a .ics file with an 8am daily reminder for each remaining day.
            </p>
          </div>

          <!-- Navigation -->
          <nav class="px-5 py-5 border-b border-isf-tinted">
            <h3 class="text-xs font-bold uppercase tracking-widest text-isf-slate mb-3">
              Links
            </h3>
            <ul class="space-y-0.5">
              <li>
                <NuxtLink to="/about" class="tray-link" @click="emit('close')">
                  About
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/artists" class="tray-link" @click="emit('close')">
                  Contributing Artists
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/privacy" class="tray-link" @click="emit('close')">
                  Privacy Policy
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/releases" class="tray-link" @click="emit('close')">
                  Release Notes
                </NuxtLink>
              </li>
              <li>
                <a
                  href="https://github.com/reece/good-trouble-daily"
                  target="_blank" rel="noopener noreferrer"
                  class="tray-link"
                >
                  GitHub Repo ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/reece/good-trouble-daily/issues"
                  target="_blank" rel="noopener noreferrer"
                  class="tray-link"
                >
                  Report an Issue ↗
                </a>
              </li>
              <li>
                <a
                  href="https://forms.gle/2Zic21S9eiaLqVPR7"
                  target="_blank" rel="noopener noreferrer"
                  class="tray-link"
                >
                  Suggest an Action ↗
                </a>
              </li>
            </ul>
          </nav>

          <!-- Build / data info -->
          <div class="px-5 py-5">
            <h3 class="text-xs font-bold uppercase tracking-widest text-isf-slate mb-3">
              Build Info
            </h3>
            <dl class="text-[11px] leading-relaxed text-isf-blue grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-baseline">
              <dt class="font-semibold text-right text-isf-slate">
                code
              </dt>
              <dd class="m-0">
                <a
                  :href="buildInfo.refUrl"
                  target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-isf-blue-dark transition-colors"
                >{{ buildInfo.ref }}</a>
                (<a
                  :href="`https://github.com/reece/good-trouble-daily/commit/${buildInfo.shortSha}`"
                  target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-isf-blue-dark transition-colors"
                >{{ buildInfo.shortSha }}</a>{{ buildInfo.isDirty ? '+' : '' }})
              </dd>
              <dt class="font-semibold text-right text-isf-slate">
                deployed
              </dt>
              <dd class="m-0">
                <a
                  v-if="buildInfo.runUrl"
                  :href="buildInfo.runUrl"
                  target="_blank" rel="noopener noreferrer"
                  class="underline hover:text-isf-blue-dark transition-colors"
                >{{ buildInfo.date }}</a>
                <span v-else>{{ buildInfo.date }}</span>
              </dd>
              <template v-if="fetchedAt">
                <dt class="font-semibold text-right text-isf-slate">
                  actions
                </dt>
                <dd class="m-0">
                  <button
                    class="flex items-center gap-1 underline hover:text-isf-blue-dark transition-colors cursor-pointer"
                    title="Click to refresh data"
                    @click="loadData"
                  >
                    <span>refreshed {{ dataFreshnessLabel }}</span>
                    <RefreshCw :size="11" />
                  </button>
                </dd>
              </template>
            </dl>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { CalendarPlus, RefreshCw, X } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  actions: ActionItem[]
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const { downloadIcs } = useIcsDownload()

const lastActionDate = computed(() => {
  const dates = props.actions.map(a => a.date)
  return dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date()
})

function handleAddToCalendar() {
  downloadIcs(lastActionDate.value)
  emit('close')
}

const { fetchedAt, loadData } = useGoogleSheetsData()

const config = useRuntimeConfig()
const buildInfo = computed(() => {
  const sha = config.public.commitSha as string
  const shortSha = config.public.commitShortSha as string
  const ref = config.public.commitRef as string
  const date = config.public.buildDate as string
  const iso = new Date(date).toISOString()
  const [datePart, timePart] = iso.split('T')
  const isDirty = sha.endsWith('+')
  const resolvedShortSha = shortSha || sha.replace(/\+$/, '').slice(0, 7)
  const runId = config.public.runId as string
  const isTag = /^\d+\.\d+/.test(ref)
  return {
    ref,
    shortSha: resolvedShortSha,
    isDirty,
    refUrl: isTag
      ? `https://github.com/reece/good-trouble-daily/releases/tag/${ref}`
      : `https://github.com/reece/good-trouble-daily/tree/${ref}`,
    date: `${datePart} ${timePart.slice(0, 5)} UTC`,
    runUrl: runId ? `https://github.com/reece/good-trouble-daily/actions/runs/${runId}` : null,
  }
})

const dataFreshnessLabel = computed(() => {
  if (!fetchedAt.value)
    return ''
  const iso = fetchedAt.value.toISOString()
  const [datePart, timePart] = iso.split('T')
  return `${datePart} ${timePart.slice(0, 5)} UTC`
})
</script>

<style scoped>
.tray-link {
  @apply block py-2 px-2 -mx-2 rounded text-sm text-isf-blue hover:text-isf-blue-dark hover:bg-isf-tinted transition-colors;
}
</style>
