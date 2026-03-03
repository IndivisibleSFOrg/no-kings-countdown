import { ref, readonly } from 'vue';

const STORAGE_KEY = 'isf-settings';

export interface AppSettings {
  tourSeenHome: boolean;
  tourSeenModal: boolean;
  // Internal only — not user-visible. null means "no explicit override; auto-detect".
  devModeOverride: boolean | null;
}

const DEFAULTS: AppSettings = {
  tourSeenHome: false,
  tourSeenModal: false,
  devModeOverride: null,
};

// Module-level ref so state is shared across all component instances.
const settings = ref<AppSettings>({ ...DEFAULTS });
let initialized = false;

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    settings.value = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    settings.value = { ...DEFAULTS };
  }
  initialized = true;
};

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
};

export const useSettings = () => {
  if (!initialized && typeof localStorage !== 'undefined') {
    load();
  }

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value;
    save();
  };

  return { settings: readonly(settings), set };
};
