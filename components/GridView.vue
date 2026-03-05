<template>
  <div class="w-full">
    <div class="grid-view">
      <div
        v-for="action in sortedActions"
        :id="`action-${formatDateKey(action.date)}`"
        :key="action.date.toISOString()"
        :class="{ 'today-card': isTodayDate(action.date) }"
        style="border-radius: 0.75rem;"
      >
        <ActionCard
          :action="action"
          :show-day-name="true"
          date-label-size="text-3xl"
          :highlight="highlightDate === formatDateKey(action.date)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActionItem } from '~/composables/googleSheets'
import { computed } from 'vue'
import { formatDateKey } from '~/composables/dateHelpers'
import ActionCard from './ActionCard.vue'

interface Props {
  actions: ActionItem[]
  highlightDate?: string | null
}

const props = defineProps<Props>()

const sortedActions = computed(() =>
  [...props.actions].sort((a, b) => a.date.getTime() - b.date.getTime()),
)

function isTodayDate(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  )
}
</script>

<style scoped>
.card-flip {
  perspective: 1000px;
  width: 100%;
}

.card-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-flip.flipped .card-flip-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  top: 0;
  left: 0;
}

.card-back {
  transform: rotateY(180deg);
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.today-card {
  animation: today-ring 2.4s ease-out forwards;
}

@keyframes today-ring {
  0%   { box-shadow: 0 0 0 0   rgba(59, 130, 246, 0.7); }
  40%  { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4); }
  100% { box-shadow: 0 0 0 14px rgba(59, 130, 246, 0); }
}

@media (min-width: 640px) {
  .grid-view {
    gap: 1.5rem;
  }
}

@media (min-width: 768px) {
  .grid-view {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-view {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
</style>
