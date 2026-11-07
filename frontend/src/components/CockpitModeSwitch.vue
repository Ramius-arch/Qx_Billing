<template>
  <div class="view-mode-switch-wrapper">
    <a-tooltip 
      :title="isProMode 
        ? 'Advanced Mode: Full double-entry ledger, KRA eTIMS telemetry, and audit dossiers. Click to switch to Standard Mode.' 
        : 'Standard Mode: Simple daily commerce, M-Pesa receipts, and 1-click WhatsApp billing. Click to switch to Advanced Mode.'"
      placement="bottom"
    >
      <div 
        class="mode-segmented-pill font-mono"
        role="group"
        aria-label="UI View Mode Selector"
      >
        <button 
          type="button" 
          class="mode-segment-btn"
          :class="{ 'is-active': isSimpleMode }"
          @click="setMode('standard')"
        >
          <span class="mode-dot" v-if="isSimpleMode"></span>
          <span>Standard</span>
        </button>

        <button 
          type="button" 
          class="mode-segment-btn"
          :class="{ 'is-active': isProMode }"
          @click="setMode('advanced')"
        >
          <span class="mode-dot pro-dot" v-if="isProMode"></span>
          <span>Advanced</span>
        </button>
      </div>
    </a-tooltip>
  </div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useCockpitMode } from '../services/cockpitMode';

export default defineComponent({
  name: 'CockpitModeSwitch',
  setup() {
    const { currentMode, isProMode, isSimpleMode, toggleMode, setMode } = useCockpitMode();

    const handleKeydown = (e) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleMode();
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      currentMode,
      isProMode,
      isSimpleMode,
      toggleMode,
      setMode
    };
  }
});
</script>

<style scoped>
.view-mode-switch-wrapper {
  display: inline-flex;
  align-items: center;
}

/* Dark Mode (Default / Base) */
.mode-segmented-pill {
  display: inline-flex;
  align-items: center;
  padding: 2.5px;
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mode-segment-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 11px;
  height: 24px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #94a3b8 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.mode-segment-btn:hover {
  color: #f1f5f9 !important;
}

.mode-segment-btn.is-active {
  background: rgba(255, 255, 255, 0.14) !important;
  color: #ffffff !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4) !important;
}

.mode-dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.pro-dot {
  background: #818cf8;
  box-shadow: 0 0 6px #818cf8;
}

/* Light Mode Explicit Scoping */
:root[data-theme="light"] .mode-segmented-pill,
[data-theme="light"] .mode-segmented-pill {
  background: #f1f5f9 !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:root[data-theme="light"] .mode-segment-btn,
[data-theme="light"] .mode-segment-btn {
  color: #64748b !important;
}

:root[data-theme="light"] .mode-segment-btn:hover,
[data-theme="light"] .mode-segment-btn:hover {
  color: #0f172a !important;
}

:root[data-theme="light"] .mode-segment-btn.is-active,
[data-theme="light"] .mode-segment-btn.is-active {
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}
</style>
