import { ref, computed } from 'vue';

const STORAGE_KEY = 'qx_cockpit_mode';

function getInitialMode() {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'track' || saved === 'street') {
        return saved;
      }
    }
  } catch (e) {
    console.warn('[CockpitMode] Storage access warning:', e);
  }
  // Default to street (assisted & simple) so new and simpler users are welcomed smoothly
  return 'street';
}

const currentMode = ref(getInitialMode());

/**
 * Play an elegant mechanical drive-mode selector tactile audio click (Web Audio API)
 * Simulates a satisfying weighted rotary dial click like in a Porsche / BMW M cockpit.
 */
function playModeClickSound(targetMode) {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (targetMode === 'track') {
      // Sportier high-pitch authoritative mechanical engagement (track mode)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    } else {
      // Smooth, warm, dampened hydraulic mechanical click (street mode)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (err) {
    // Non-blocking if audio context is restricted
  }
}

export function useCockpitMode() {
  const isExpertMode = computed(() => currentMode.value === 'track');
  const isStreetMode = computed(() => currentMode.value === 'street');

  function setMode(mode) {
    if (mode !== 'street' && mode !== 'track') return;
    currentMode.value = mode;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch (e) {
      // ignore
    }
    playModeClickSound(mode);
  }

  function toggleMode() {
    const next = currentMode.value === 'street' ? 'track' : 'street';
    setMode(next);
  }

  return {
    currentMode,
    isExpertMode,
    isStreetMode,
    setMode,
    toggleMode
  };
}
