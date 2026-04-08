import type { ActionItem } from '~/composables/googleSheets'
import { fetchCountdownItems } from '~/composables/googleSheets'

export function useGoogleSheetsData(slug: string, actionsUrl: string) {
  const communityActions = useState<ActionItem[] | null>(`sheets-actions-${slug}`, () => null)
  const fetchedAt = useState<Date | null>(`sheets-fetchedAt-${slug}`, () => null)

  const loadData = async () => {
    communityActions.value = await fetchCountdownItems(actionsUrl)
    fetchedAt.value = new Date()
  }

  return { communityActions, fetchedAt, loadData }
}
