<template>
  <div class="cockpit-mode-switch-wrapper">
    <a-tooltip 
      :title="isExpertMode 
        ? 'TRACK MODE ACTIVE: Full double-entry telemetry, eTIMS, and audit dossiers. Click to switch to Street Mode.' 
        : 'STREET MODE ACTIVE: Simple commerce, plain language, and assisted M-Pesa flows. Click to switch to Track Mode.'"
      placement="bottom"
    >
      <button 
        type="button" 
        class="drive-mode-selector font-mono"
        :class="currentMode"
        @click="toggleMode"
        aria-label="Toggle Cockpit Driving Mode"
      >
        <!-- Mechanical Housing Bezel -->
        <div class="dial-segment" :class="{ 'is-active': isStreetMode }">
          <span class="mode-icon">☕</span>
          <span class="mode-text">STREET</span>
        </div>

        <div class="dial-divider"></div>

        <div class="dial-segment" :class="{ 'is-active': isExpertMode }">
          <span class="mode-icon">🏁</span>
          <span class="mode-text">TRACK</span>
        </div>

        <!-- Glowing Active Position Beacon -->
        <div class="active-indicator" :class="currentMode">
          <span class="beacon-pulse"></span>
        </div>
      </button>
    </a-tooltip>
  </div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useCockpitMode } from '../services/cockpitMode';

export default defineComponent({
  name: 'CockpitModeSwitch',
  setup() {
    const { currentMode, isExpertMode, isStreetMode, toggleMode, setMode } = useCockpitMode();

    // Hotkey: Alt + M to toggle drive modes like pressing a steering wheel button!
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
      isExpertMode,
      isStreetMode,
      toggleMode,
      setMode
    };
  }
});
</script>

<style scoped>
.cockpit-mode-switch-wrapper {
  display: inline-flex;
  align-items: center;
}

/* Mechanical Automotive Rocker / Dial Housing */
.drive-mode-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 2px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  user-select: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drive-mode-selector:hover {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.25);
}

.dial-segment {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  height: 26px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.8);
  border-radius: 9999px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2;
}

.dial-segment.is-active {
  color: #ffffff;
}

.drive-mode-selector.street .dial-segment.is-active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.drive-mode-selector.track .dial-segment.is-active {
  background: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  box-shadow: 0 0 14px rgba(99, 102, 241, 0.4);
}

.dial-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 1px;
}

.mode-icon {
  font-size: 11px;
  line-height: 1;
}

.mode-text {
  line-height: 1;
}

/* Glowing Indicator Beacon */
.active-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  border-radius: 9999px;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

.drive-mode-selector.street .active-indicator {
  left: 3px;
  width: calc(50% - 3px);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.drive-mode-selector.track .active-indicator {
  left: calc(50%);
  width: calc(50% - 3px);
  border: 1px solid rgba(165, 180, 252, 0.5);
}

/* Light Theme Adjustments */
:root[data-theme="light"] .drive-mode-selector,
body:not(.dark) .drive-mode-selector {
  background: rgba(241, 245, 249, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

:root[data-theme="light"] .dial-segment,
body:not(.dark) .dial-segment {
  color: #64748b;
}

:root[data-theme="light"] .drive-mode-selector.street .dial-segment.is-active,
body:not(.dark) .drive-mode-selector.street .dial-segment.is-active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

:root[data-theme="light"] .drive-mode-selector.track .dial-segment.is-active,
body:not(.dark) .drive-mode-selector.track .dial-segment.is-active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
