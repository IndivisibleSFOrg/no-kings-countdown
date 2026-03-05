import type { Ref } from 'vue'
import type { ActionItem } from '~/composables/googleSheets'
import { computed } from 'vue'
import { useDevMode } from '~/composables/useDevMode'

/**
 * Filters a list of ActionItems to exclude actions labelled "testing"
 * in production. In dev mode, testing actions are included.
 */
export function useVisibleActions(actions: Ref<ActionItem[] | null>) {
  const { isDevMode: isDev } = useDevMode()

  return computed(() =>
    (actions.value ?? []).filter(a =>
      isDev.value || !a.labels.includes('testing'),
    ),
  )
}
