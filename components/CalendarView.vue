<template>
  <div class="w-full">
    <div v-if="!isMounted" class="w-full h-96 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-isf-red" />
    </div>
    <div v-else class="calendar-view">
      <h2 class="heading-2 mb-4">
        {{ calendarHeading }}
      </h2>
      <div class="calendar-grid">
        <!-- Day headers (Monday as week start) -->
        <div
          v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          :key="day"
          class="text-center font-semibold text-isf-slate py-2"
        >
          {{ day }}
        </div>

        <!-- Calendar cells -->
        <div v-for="(dateInfo, index) in allDates" :id="actionIdForCell(dateInfo.date, dateInfo.month)" :key="`${dateInfo.month}-${dateInfo.date}-${index}`" class="calendar-cell">
          <template v-if="dateInfo.date !== null && dateInfo.month !== null">
            <ActionCard
              v-if="getActionForDate(dateInfo.date, dateInfo.month)"
              :action="getActionForDate(dateInfo.date, dateInfo.month)!"
              :allow-modal="true"
            />
            <div v-else class="calendar-cell-empty flex items-start p-1.5">
              <span class="text-xs text-isf-slate font-medium leading-none">{{ dateInfo.month }}/{{ dateInfo.date }}</span>
            </div>
          </template>
          <div v-else class="calendar-cell-empty" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { computed, onMounted, ref } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'
import ActionCard from './ActionCard.vue'

interface Props {
  actions: ActionItem[]
}

const props = defineProps<Props>()

const isMounted = ref(false)

// Derive the calendar date range from the data
const calendarRange = computed(() => {
  if (!props.actions.length)
    return null
  const times = props.actions.map(a => a.date.getTime())
  return {
    min: new Date(Math.min(...times)),
    max: new Date(Math.max(...times)),
  }
})

const calendarHeading = computed(() => {
  if (!calendarRange.value)
    return ''
  const { min, max } = calendarRange.value
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const yearSuffix = min.getFullYear() === max.getFullYear()
    ? `, ${max.getFullYear()}`
    : `, ${min.getFullYear()} – ${max.getFullYear()}`
  return `${fmt(min)} – ${fmt(max)}${yearSuffix}`
})

const allDates = computed(() => {
  if (!calendarRange.value)
    return []
  const { min, max } = calendarRange.value
  const dates: { date: number | null, month: number | null }[] = []

  // Calculate offset for Monday start (Mon=0 … Sun=6)
  const startDay = min.getDay()
  const offsetDays = startDay === 0 ? 6 : startDay - 1
  for (let i = 0; i < offsetDays; i++) {
    dates.push({ date: null, month: null })
  }

  // Iterate day-by-day from min to max
  const current = new Date(min)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (current <= max) {
    dates.push({ date: current.getDate(), month: current.getMonth() + 1 })
    current.setDate(current.getDate() + 1)
  }

  return dates
})

function getActionForDate(day: number, month: number) {
  return props.actions.find((action) => {
    const actionDate = action.date
    return actionDate.getDate() === day && (actionDate.getMonth() + 1) === month
  })
}

function actionIdForCell(day: number | null, month: number | null): string | undefined {
  if (!day || !month)
    return undefined
  const action = getActionForDate(day, month)
  return action ? `action-${formatDateKey(action.date)}` : undefined
}

onMounted(() => {
  isMounted.value = true
})
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-cell {
  aspect-ratio: 1;
  min-height: 150px;
}

.calendar-cell-empty {
  aspect-ratio: 1;
  min-height: 150px;
}

@media (max-width: 768px) {
  .calendar-grid {
    gap: 0.25rem;
  }

  .calendar-cell {
    min-height: 120px;
  }
}

@media (max-width: 640px) {
  .calendar-cell {
    min-height: 100px;
  }
}
</style>
