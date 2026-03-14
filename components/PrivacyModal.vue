<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/60" @click="emit('close')" />

      <div
        class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        role="dialog" aria-modal="true" aria-label="Privacy"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-isf-tinted">
          <h2 class="font-bold text-isf-blue-dark text-lg">
            Privacy Policy
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
        <div class="px-5 py-5 space-y-3">
          <p class="text-isf-blue-dark text-base leading-relaxed">
            This site uses <strong>Google Analytics</strong> to collect anonymous usage data (pages visited, time on
            site, city-level location). We have disabled Google signals and ads personalization. Google Analytics does
            not record your full IP address.
          </p>
          <p class="text-isf-blue-dark text-base leading-relaxed">
            This site also uses <strong>Plausible Analytics</strong>, a privacy-focused service that sets no cookies
            and collects no personal data or cross-site identifiers. Plausible records only anonymous, aggregate event
            counts (e.g. which actions were viewed or completed). Data is processed under <a
              href="https://plausible.io/data-policy"
              target="_blank" rel="noopener" class="underline hover:text-isf-blue"
            >Plausible's data policy</a>.
          </p>
          <p class="text-isf-blue-dark text-base leading-relaxed">
            <strong>We use these data solely to understand how many people visit and which content is most useful to
              users collectively — not to identify you, build profiles, or target advertising. We do not sell or share
              visitor data with anyone.</strong>
          </p>
          <p class="text-isf-blue-dark text-base leading-relaxed">
            To opt out: use <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank" rel="noopener" class="underline hover:text-isf-blue"
            >Google's opt-out browser add-on</a> for Google Analytics; or run
            <code class="text-sm bg-isf-tinted px-1 rounded">localStorage.setItem('plausible_ignore','true')</code>
            in your browser console to opt out of Plausible.
          </p>
          <p class="text-isf-blue-dark text-base leading-relaxed">
            Your action progress is saved locally on your device only and is transmitted only when you explicitly choose
            to share your progress.
          </p>
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 flex justify-end">
          <button
            class="bg-btn-primary hover:bg-btn-primary-dark text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            @click="emit('close')"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
