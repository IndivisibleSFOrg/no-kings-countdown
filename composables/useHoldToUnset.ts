import { onUnmounted, ref } from 'vue'

/**
 * Provides hold-to-unset behaviour for toggle buttons.
 *
 * Usage (button is currently "set"):
 *   - Holding ≥ HOLD_DURATION → calls `onUnset()` and clears hold state
 *   - Releasing before HOLD_DURATION → sets `showHint` for HINT_DURATION so the
 *     template can display "Hold briefly to reset"
 *
 * Wire up the three event handlers and use `isHolding` for visual feedback:
 *   @pointerdown.stop="isSet ? hold.start($event) : undefined"
 *   @pointerup.stop="hold.cancel()"
 *   @pointerleave="hold.cancel()"
 */

const HOLD_DURATION = 1000
const HINT_DURATION = 2500

export function useHoldToUnset(onUnset: () => void) {
  const isHolding = ref(false)
  const showHint = ref(false)
  // Set to true when the hold completes so the subsequent click event can be consumed
  const holdCompleted = ref(false)
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let hintTimer: ReturnType<typeof setTimeout> | null = null

  function start(e: PointerEvent) {
    // Ignore non-primary mouse buttons
    if (e.pointerType === 'mouse' && e.button !== 0)
      return
    // Clear any existing hint timer
    if (hintTimer) {
      clearTimeout(hintTimer)
      hintTimer = null
      showHint.value = false
    }
    isHolding.value = true
    holdTimer = setTimeout(() => {
      holdTimer = null
      isHolding.value = false
      holdCompleted.value = true
      onUnset()
    }, HOLD_DURATION)
  }

  function cancel() {
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = null
    }
    if (isHolding.value) {
      // Released too early — show hint
      isHolding.value = false
      showHint.value = true
      if (hintTimer)
        clearTimeout(hintTimer)
      hintTimer = setTimeout(() => {
        showHint.value = false
        hintTimer = null
      }, HINT_DURATION)
    }
  }

  onUnmounted(() => {
    if (holdTimer)
      clearTimeout(holdTimer)
    if (hintTimer)
      clearTimeout(hintTimer)
  })

  return { isHolding, showHint, holdCompleted, start, cancel }
}
