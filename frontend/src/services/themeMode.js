import { ref, computed } from 'vue';

const THEME_STORAGE_KEY = 'qx_theme_preference';

// Options: 'system' | 'light' | 'dark'
function getStoredThemePreference() {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.warn('[ThemeMode] Storage access warning:', e);
  }
  // Default to system standard (matches user's device OS mode)
  return 'system';
}

export const themePreference = ref(getStoredThemePreference());

// System device preference detector
const deviceIsDark = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
);

// Active resolved theme: 'dark' | 'light'
export const isDark = computed(() => {
  if (themePreference.value === 'dark') return true;
  if (themePreference.value === 'light') return false;
  return deviceIsDark.value;
});

export const activeThemeName = computed(() => (isDark.value ? 'dark' : 'light'));

export function applyThemeToDom() {
  if (typeof document === 'undefined') return;
  const themeName = activeThemeName.value;
  document.documentElement.setAttribute('data-theme', themeName);
  if (themeName === 'dark') {
    document.documentElement.classList.add('dark');
    if (document.body) document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    if (document.body) document.body.classList.remove('dark');
  }
  if (document.body) {
    document.body.setAttribute('data-theme', themeName);
  }
}

export function setThemePreference(pref) {
  if (pref !== 'system' && pref !== 'light' && pref !== 'dark') return;
  themePreference.value = pref;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
      localStorage.setItem('theme', activeThemeName.value);
    }
  } catch (e) {
    // ignore
  }
  applyThemeToDom();
}

export function cycleTheme() {
  // Cycle: system -> light -> dark -> system
  if (themePreference.value === 'system') {
    setThemePreference('light');
  } else if (themePreference.value === 'light') {
    setThemePreference('dark');
  } else {
    setThemePreference('system');
  }
}

// Set up device listener
if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      deviceIsDark.value = e.matches;
      if (themePreference.value === 'system') {
        applyThemeToDom();
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
  } catch (e) {
    console.warn('[ThemeMode] Media query listener warning:', e);
  }
}
