import { ref, computed } from 'vue';

const STORAGE_KEY = 'qx_ui_view_mode';

function getInitialMode() {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'advanced' || saved === 'standard') {
        return saved;
      }
      // Migrate legacy 'track' / 'street' if present
      const legacy = localStorage.getItem('qx_cockpit_mode');
      if (legacy === 'track') return 'advanced';
      if (legacy === 'street') return 'standard';
    }
  } catch (e) {
    console.warn('[ViewMode] Storage access warning:', e);
  }
  // Default to standard (assisted & clean) so simpler users are welcomed smoothly
  return 'standard';
}

const currentMode = ref(getInitialMode());

export function useCockpitMode() {
  const isProMode = computed(() => currentMode.value === 'advanced');
  const isSimpleMode = computed(() => currentMode.value === 'standard');

  // Backward compatibility aliases
  const isExpertMode = isProMode;
  const isStreetMode = isSimpleMode;

  function setMode(mode) {
    let normalized = mode;
    if (mode === 'street') normalized = 'standard';
    if (mode === 'track') normalized = 'advanced';

    if (normalized !== 'standard' && normalized !== 'advanced') return;
    currentMode.value = normalized;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, normalized);
      }
    } catch (e) {
      // ignore
    }
  }

  function toggleMode() {
    const next = currentMode.value === 'standard' ? 'advanced' : 'standard';
    setMode(next);
  }

  return {
    currentMode,
    isProMode,
    isSimpleMode,
    isExpertMode,
    isStreetMode,
    setMode,
    toggleMode
  };
}
