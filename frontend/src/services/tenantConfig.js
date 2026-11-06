import { ref, computed } from 'vue';
import { SAAS_PRESETS } from '../config/saasPresets';

// Check if a preset is requested via URL query param or saved in localStorage
function getInitialPreset() {
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPreset = urlParams.get('preset');
      if (queryPreset && SAAS_PRESETS[queryPreset]) {
        localStorage.setItem('saas_benchmark_preset', queryPreset);
        return queryPreset;
      }
      const saved = localStorage.getItem('saas_benchmark_preset');
      if (saved && SAAS_PRESETS[saved]) {
        return saved;
      }
    }
  } catch (e) {
    console.warn('[TenantConfig] Storage access warning:', e);
  }
  return 'd2c_archival';
}

function getInitialPoCMode() {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qx_is_poc_mode');
      if (saved !== null) {
        return saved === 'true';
      }
    }
  } catch (e) {
    // ignore
  }
  return true; // Default to benchmark Proof of Concept mode until owner switches to Live Private Ledger
}

const currentPresetKey = ref(getInitialPreset());
const isPoCMode = ref(getInitialPoCMode());

export function useTenantConfig() {
  const activeTenant = computed(() => {
    const base = SAAS_PRESETS[currentPresetKey.value] || SAAS_PRESETS.d2c_archival;
    return {
      ...base,
      isPoC: isPoCMode.value,
      pocBadge: isPoCMode.value ? '[PoC · Benchmark Mode]' : '[Live Private Ledger]'
    };
  });

  const availablePresets = computed(() => {
    return Object.keys(SAAS_PRESETS).map(key => ({
      key,
      name: SAAS_PRESETS[key].brand.name + ' ' + SAAS_PRESETS[key].brand.accent,
      industry: SAAS_PRESETS[key].industryName,
      currency: SAAS_PRESETS[key].currency.code
    }));
  });

  function setPreset(key) {
    if (SAAS_PRESETS[key]) {
      currentPresetKey.value = key;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('saas_benchmark_preset', key);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  function setPoCMode(val) {
    isPoCMode.value = !!val;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('qx_is_poc_mode', isPoCMode.value ? 'true' : 'false');
      }
    } catch (e) {
      // ignore
    }
  }

  function formatMoney(amount) {
    const tenant = activeTenant.value;
    const num = Number(amount) || 0;
    const formatted = Math.round(num).toLocaleString(tenant.currency.locale || 'en-US');
    return `${tenant.currency.prefix}${formatted}${tenant.currency.suffix}`;
  }

  return {
    activeTenant,
    currentPresetKey,
    availablePresets,
    isPoCMode,
    setPoCMode,
    setPreset,
    formatMoney
  };
}
