<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />

      <div
        class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog" aria-modal="true" aria-label="About"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-isf-tinted flex-shrink-0">
          <h2 class="font-bold text-isf-blue-dark text-lg">
            About No Kings Countdown
          </h2>
          <button
            class="text-isf-slate hover:text-isf-blue-dark bg-transparent rounded-full p-1.5 transition-colors"
            aria-label="Close" @click="emit('close')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-5 space-y-4 overflow-y-auto">
          <p class="text-isf-blue-dark text-base leading-relaxed">
            The <a
              href="https://nokings.org/" target="_blank" rel="noopener noreferrer"
              class="underline hover:text-isf-blue"
            >No Kings</a> march is a nationwide mobilization to defend democratic
            norms and oppose authoritarian overreach. This app helps people show up for the cause every day in the weeks
            leading up to the march — not just on the day itself.
          </p>
          <p class="text-isf-blue-dark text-base leading-relaxed">
            Each day unlocks one short, meaningful action: calling a representative, sharing a message, supporting an
            organization, building community, learning and training, or finding local causes to support.
            <strong>Progress is tracked privately in your browser — nothing is sent to any server.</strong> (<button
              class="underline hover:text-isf-blue transition-colors" @click="emit('privacy')"
            >
              See our Privacy Policy
            </button>)
          </p>

          <div>
            <h3 class="font-semibold text-isf-blue-dark text-base mb-2">
              Actions will be:
            </h3>
            <ul class="space-y-1.5">
              <li class="flex gap-2 text-base text-isf-blue-dark leading-relaxed">
                <span class="mt-0.5 text-isf-blue flex-shrink-0">✓</span>
                <span><strong>Tied to the resistance</strong> — focused on democratic norms, anti-authoritarianism, or
                  civic engagement</span>
              </li>
              <li class="flex gap-2 text-base text-isf-blue-dark leading-relaxed">
                <span class="mt-0.5 text-isf-blue flex-shrink-0">✓</span>
                <span><strong>Broadly accessible</strong> — relevant to people across the US, requiring no special
                  skills or prior activist experience</span>
              </li>
              <li class="flex gap-2 text-base text-isf-blue-dark leading-relaxed">
                <span class="mt-0.5 text-isf-blue flex-shrink-0">✓</span>
                <span><strong>Concrete and specific</strong> — a clear task with a defined end state</span>
              </li>
              <li class="flex gap-2 text-base text-isf-blue-dark leading-relaxed">
                <span class="mt-0.5 text-isf-blue flex-shrink-0">✓</span>
                <span><strong>Completable in under 15 minutes</strong> — no lengthy commitments or sign-ups
                  required</span>
              </li>
              <li class="flex gap-2 text-base text-isf-blue-dark leading-relaxed">
                <span class="mt-0.5 text-isf-blue flex-shrink-0">✓</span>
                <span><strong>Varied in type</strong> — contacting representatives, sharing on social media, showing up
                  locally, supporting organizations</span>
              </li>
            </ul>
          </div>

          <p class="text-isf-blue-dark text-base leading-relaxed">
            Have an idea for an action? <a
              href="https://forms.gle/2Zic21S9eiaLqVPR7" target="_blank"
              rel="noopener noreferrer" class="underline hover:text-isf-blue"
            >Submit a suggestion →</a>
          </p>

          <p class="text-isf-blue-dark text-base leading-relaxed">
            Images courtesy of our <button
              class="underline hover:text-isf-blue transition-colors"
              @click="navigateTo('/artists')"
            >
              contributing artists →
            </button>
          </p>

          <!-- ISF Logo -->
          <div class="flex justify-center pt-2">
            <a href="https://indivisiblesf.org/" target="_blank" rel="noopener noreferrer">
              <img
                src="/isf-logo.webp" alt="Indivisible SF"
                class="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
              >
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 pt-3 border-t border-isf-tinted flex items-end justify-between gap-4 flex-shrink-0">
          <!-- Build & data info -->
          <dl class="text-[10px] leading-[0.8rem] text-isf-blue grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-baseline">
            <dt class="font-semibold text-right">
              code
            </dt>
            <dd class="m-0">
              <a
                :href="buildInfo.refUrl"
                target="_blank" rel="noopener noreferrer" class="underline hover:text-isf-blue transition-colors"
              >{{ buildInfo.ref }}</a>
              (<a
                :href="`https://github.com/IndivisibleSFOrg/no-kings-countdown/commit/${buildInfo.shortSha}`"
                target="_blank" rel="noopener noreferrer" class="underline hover:text-isf-blue transition-colors"
              >{{ buildInfo.shortSha }}</a>{{ buildInfo.isDirty ? '+' : '' }})
            </dd>
            <dt class="font-semibold text-right">
              deployed
            </dt>
            <dd class="m-0">
              <a
                v-if="buildInfo.runUrl" :href="buildInfo.runUrl" target="_blank" rel="noopener noreferrer"
                class="underline hover:text-isf-blue transition-colors"
              >{{ buildInfo.date }}</a>
              <span v-else>{{ buildInfo.date }}</span>
            </dd>
            <template v-if="fetchedAt">
              <dt class="font-semibold text-right">
                actions
              </dt>
              <dd class="m-0">
                <button
                  class="flex items-center gap-1 underline hover:text-isf-blue transition-colors cursor-pointer"
                  title="Click to refresh data" @click="emit('refresh')"
                >
                  <span>refreshed at {{ dataFreshnessLabel }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </dd>
            </template>
          </dl>
          <button
            class="bg-btn-primary hover:bg-btn-primary-dark text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fetchedAt?: Date | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [], refresh: [], privacy: [] }>()

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
      ? `https://github.com/IndivisibleSFOrg/no-kings-countdown/releases/tag/${ref}`
      : `https://github.com/IndivisibleSFOrg/no-kings-countdown/tree/${ref}`,
    date: `${datePart} ${timePart.slice(0, 5)} UTC`,
    runUrl: runId ? `https://github.com/IndivisibleSFOrg/no-kings-countdown/actions/runs/${runId}` : null,
  }
})

const dataFreshnessLabel = computed(() => {
  if (!props.fetchedAt)
    return ''
  const iso = props.fetchedAt.toISOString()
  const [datePart, timePart] = iso.split('T')
  return `${datePart} ${timePart.slice(0, 5)} UTC`
})
</script>
