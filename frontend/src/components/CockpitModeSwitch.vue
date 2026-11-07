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

/* Minimalist Professional Segmented Control */
.mode-segmented-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mode-segment-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  height: 24px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #94a3b8;
  background: transparent;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.mode-segment-btn:hover {
  color: #f1f5f9;
}

.mode-segment-btn.is-active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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

/* Light Mode Overrides */
:root[data-theme="light"] .mode-segmented-pill,
body:not(.dark) .mode-segmented-pill {
  background: #f1f5f9;
  border-color: rgba(0, 0, 0, 0.08);
}

:root[data-theme="light"] .mode-segment-btn,
body:not(.dark) .mode-segment-btn {
  color: #64748b;
}

:root[data-theme="light"] .mode-segment-btn.is-active,
body:not(.dark) .mode-segment-btn.is-active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
