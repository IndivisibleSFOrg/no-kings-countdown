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
            'A daily action calendar counting down to the No Kings March on March 28, 2026. Each day unlocks one civic action you can complete in under 15 minutes.',
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
          title: 'Daily Action Cards',
          description:
            'Click any unlocked card to see its full details, follow the link to take action, and mark it complete.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-share-progress',
        popover: {
          title: 'Spread the Word',
          description:
            'Share your progress with friends to inspire others and help build the movement toward March 28!',
          side: 'bottom',
          align: 'end',
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

/** Tour for the action-detail modal. Call inside onMounted of ActionDetails. */
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
      {
        element: '#tour-action-share',
        popover: {
          title: 'Share This Action',
          description:
            'Share this specific action with your network to multiply the movement\'s impact.',
          side: 'left',
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
