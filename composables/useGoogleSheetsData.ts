import type { ActionItem } from '~/composables/googleSheets'
import { ref } from 'vue'
import { fetchCountdownItems } from '~/composables/googleSheets'

// Module-level refs so state is shared across layout and pages.
const communityActions = ref<ActionItem[] | null>(null)
const fetchedAt = ref<Date | null>(null)

export function useGoogleSheetsData() {
  const loadData = async () => {
    communityActions.value = await fetchCountdownItems()
    fetchedAt.value = new Date()
  }

  return { communityActions, fetchedAt, loadData }
}
