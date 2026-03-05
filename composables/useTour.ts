import type { Config, DriveStep } from 'driver.js'
import { driver } from 'driver.js'

const baseConfig: Partial<Config> = {
  showProgress: true,
  animate: true,
  allowClose: true,
  overlayOpacity: 0.4,
  stagePadding: 8,
  stageRadius: 8,
  progressText: '{{current}} of {{total}}',
  nextBtnText: 'Next →',
  prevBtnText: '← Back',
  doneBtnText: 'Done',
}

// Module-level flag so concurrent tours don't fight each other.
// Set true when any driver starts, false in its onDestroyed.
let anyTourActive = false

/** Run `fn` once no other tour is active, polling every 200 ms. */
function whenTourIdle(fn: () => void) {
  if (!anyTourActive) {
    fn()
    return
  }
  const id = setInterval(() => {
    if (!anyTourActive) {
      clearInterval(id)
      fn()
    }
  }, 200)
}

/** Tour for the main landing page. Call inside onMounted. */
export function useHomeTour() {
  const { settings, set } = useSettings()

  const startHomeTour = () => {
    if (settings.value.tourSeenHome)
      return

    const steps: DriveStep[] = [
      {
        element: '#tour-title',
        popover: {
          title: 'Welcome to No Kings Countdown',
          description:
            'Each day unlocks a civic action you can take in under 15 minutes. Complete them, track your progress, and help build the movement.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-score',
        popover: {
          title: 'See and Share Your Progress',
          description:
            'Your completed action count is shown here. The dot grid gives you a bird\'s-eye view of the whole campaign at a glance. Your progress is tracked only on your device — no personal data is collected or shared. Share your progress with friends to inspire others to join the movement!',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-main',
        popover: {
          title: 'Daily Actions',
          description:
            'Browse the calendar — cards will be revealed each day leading up to the No Kings March on March 28, 2026. Click on any revealed cards to see details and take action.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-footer',
        popover: {
          title: 'More Links',
          description:
            'Find out more about this project on the About page, read our Privacy Statement, suggest a new action, or report an issue on GitHub.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#action-2026-03-01',
        popover: {
          title: 'Get Started! Sign Up for No Kings 3',
          description:
            'March 1 is the single most important action in the whole countdown — signing up for the No Kings March on March 28. If you do only one thing, make it this.',
          side: 'top',
          align: 'center',
        },
      },
    ]

    // Only include steps whose target element exists in the DOM
    const validSteps = steps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    )
    if (!validSteps.length)
      return

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        anyTourActive = false
        set('tourSeenHome', true)
      },
    })

    anyTourActive = true
    driverObj.drive()
  }

  return { startHomeTour }
}

/** Tour for the action-detail modal. Call inside onMounted of ActionModal. */
export function useModalTour() {
  const { settings, set } = useSettings()

  const startModalTour = () => {
    if (settings.value.tourSeenModal)
      return
    // Don't overwhelm new users — wait until the home tour has been seen
    if (!settings.value.tourSeenHome)
      return

    const allSteps: DriveStep[] = [
      {
        element: '#tour-action-cta',
        popover: {
          title: 'Take Action',
          description:
            'This button links directly to the action — a petition, contact form, event, or resource.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-action-complete',
        popover: {
          title: 'Mark It Complete',
          description:
            'After taking the action, tap this button to log your completion and add it to your score.',
          side: 'left',
          align: 'center',
        },
      },
    ]

    // Only include steps whose target element exists in the DOM
    const validSteps = allSteps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    )
    if (!validSteps.length)
      return

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        anyTourActive = false
        set('tourSeenModal', true)
      },
    })

    anyTourActive = true
    driverObj.drive()
  }

  return { startModalTour }
}

/** Tour shown immediately after the user completes their first action. */
export function useShareTour() {
  const { settings, set } = useSettings()

  const _driveShare = (detailShareSelector?: string) => {
    if (settings.value.tourSeenShare)
      return

    const allSteps: DriveStep[] = [
      ...(detailShareSelector
        ? [{
            element: detailShareSelector,
            popover: {
              title: 'Share This Action',
              description:
            'Nice work! Let your network know what you just did — sharing this specific action can inspire others to take it too.',
              side: 'left' as const,
              align: 'center' as const,
            },
          }]
        : []),
      {
        element: '#tour-share-progress',
        popover: {
          title: 'Share Your Score',
          description:
            'You can also share your overall progress to motivate friends to join the movement.',
          side: 'bottom',
          align: 'end',
        },
      },
    ]

    // Only include steps whose target element exists in the DOM
    const validSteps = allSteps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    )
    if (!validSteps.length)
      return

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        anyTourActive = false
        set('tourSeenShare', true)
      },
    })

    anyTourActive = true
    driverObj.drive()
  }

  const startShareTour = (detailShareSelector?: string) => {
    if (settings.value.tourSeenShare)
      return
    whenTourIdle(() => _driveShare(detailShareSelector))
  }

  return { startShareTour }
}
