import { driver } from 'driver.js';
import type { Config, DriveStep } from 'driver.js';

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
};

/** Tour for the main landing page. Call inside onMounted. */
export function useHomeTour() {
  const { settings, set } = useSettings();

  const startHomeTour = () => {
    if (settings.value.tourSeenHome) return;

    const steps: DriveStep[] = [
      {
        element: '#tour-title',
        popover: {
          title: 'Welcome to No Kings Countdown',
          description:
            'Each day unlocks a civic action you can take in under 15 minutes. Complete them, track your score, and help build the movement.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-score',
        popover: {
          title: 'Track Your Progress',
          description:
            'Your completed action count is shown here. The dot grid gives you a bird\'s-eye view of the whole campaign at a glance.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-main',
        popover: {
          title: 'Daily Actions',
          description:
            'Browse the calendar — click any unlocked day to see the full action, follow the link, and mark it complete. On mobile you\'ll see a card grid instead.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-share-progress',
        popover: {
          title: 'Spread the Word',
          description:
            'Share your progress with friends to inspire others to join the movement.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#action-2026-03-01',
        popover: {
          title: 'Start Here: Sign Up for No Kings 3',
          description:
            'March 1 is the single most important action in the whole countdown — signing up for the No Kings March on March 28. If you do only one thing, make it this.',
          side: 'top',
          align: 'center',
        },
      },
    ];

    // Only include steps whose target element exists in the DOM
    const validSteps = steps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    );
    if (!validSteps.length) return;

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        set('tourSeenHome', true);
      },
    });

    driverObj.drive();
  };

  return { startHomeTour };
}

/** Tour for the action-detail modal. Call inside onMounted of ActionModal. */
export function useModalTour() {
  const { settings, set } = useSettings();

  const startModalTour = () => {
    if (settings.value.tourSeenModal) return;
    // Don't overwhelm new users — wait until the home tour has been seen
    if (!settings.value.tourSeenHome) return;

    const allSteps: DriveStep[] = [
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
    ];

    // Only include steps whose target element exists in the DOM
    const validSteps = allSteps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    );
    if (!validSteps.length) return;

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        set('tourSeenModal', true);
      },
    });

    driverObj.drive();
  };

  return { startModalTour };
}

/** Tour shown immediately after the user completes their first action. */
export function useShareTour() {
  const { settings, set } = useSettings();

  const startShareTour = () => {
    if (settings.value.tourSeenShare) return;

    const allSteps: DriveStep[] = [
      {
        element: '#tour-action-share',
        popover: {
          title: 'Share This Action',
          description:
            'Nice work! Let your network know what you just did — sharing this specific action can inspire others to take it too.',
          side: 'left',
          align: 'center',
        },
      },
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
    ];

    // Only include steps whose target element exists in the DOM
    const validSteps = allSteps.filter(
      s => !s.element || !!document.querySelector(s.element as string),
    );
    if (!validSteps.length) return;

    const driverObj = driver({
      ...baseConfig,
      steps: validSteps,
      onDestroyed: () => {
        set('tourSeenShare', true);
      },
    });

    driverObj.drive();
  };

  return { startShareTour };
}
