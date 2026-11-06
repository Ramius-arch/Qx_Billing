<template>
  <div class="luxury-loading-stage" @click="enterDirectly">
    <!-- Ambient Spatial Atmospheric Light (BMW / Apple Keynote Depth) -->
    <div class="ambient-substrate" aria-hidden="true"></div>

    <main class="loader-portal">
      <!-- 1. Precision Circular Specular Ring -->
      <div class="circular-stage">
        <svg class="ring-svg" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="specularGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="60%" stop-color="#818cf8" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#d4af37" stop-opacity="0.9" />
            </linearGradient>
          </defs>

          <!-- Outer Inactive Hairline Track -->
          <circle 
            class="ring-track" 
            cx="80" 
            cy="80" 
            r="68" 
          />

          <!-- Active Luminous Specular Stroke -->
          <circle 
            class="ring-progress" 
            cx="80" 
            cy="80" 
            r="68"
            :style="{ strokeDashoffset: strokeOffset }"
          />
        </svg>

        <!-- Central Floating Emblem -->
        <div class="emblem-center">
          <img 
            src="/assets/logo.png" 
            :alt="activeTenant.brand.name" 
            class="brand-emblem" 
          />
        </div>
      </div>

      <!-- 2. Restrained Brand Identity (Zero geeky text, high-end automotive / Apple poise) -->
      <div class="brand-caption">
        <h1 class="brand-monogram font-sans">
          {{ activeTenant.brand.name }} <span class="brand-sub">{{ activeTenant.brand.accent }}</span>
        </h1>
        <div class="sub-whisper font-mono">
          <span class="status-pulse-dot"></span>
          <span class="whisper-text">{{ progress >= 100 ? 'READY' : 'INITIALIZING' }}</span>
          <span class="whisper-percentage tabular-nums">{{ Math.round(progress) }}%</span>
        </div>
      </div>
    </main>

    <!-- Faint Footer Hint (Whisper quiet) -->
    <footer class="luxury-footer font-mono">
      <span>{{ activeTenant.industryName }} &bull; Double-Entry Canvas</span>
      <span class="skip-hint">Click anywhere to enter &rarr;</span>
    </footer>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTenantConfig } from '../services/tenantConfig';

export default defineComponent({
  name: 'LoadingPage',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { activeTenant } = useTenantConfig();

    const progress = ref(0);
    let animationFrame = null;
    let startTime = null;

    // Circumference of r=68 circle: 2 * PI * 68 ≈ 427.256
    const CIRCUMFERENCE = 2 * Math.PI * 68;

    const strokeOffset = computed(() => {
      const p = Math.min(Math.max(progress.value, 0), 100);
      return CIRCUMFERENCE - (p / 100) * CIRCUMFERENCE;
    });

    // Pacing duration: 2.2 seconds of silky smooth cinematic motion
    const DURATION = 2200;

    const stepAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      // Apple standard cubic easing: 1 - pow(1 - t, 3)
      const eased = 1 - Math.pow(1 - t, 3);
      progress.value = Math.min(eased * 100, 100);

      if (t < 1) {
        animationFrame = requestAnimationFrame(stepAnimation);
      } else {
        progress.value = 100;
        // Smooth automatic transition into terminal
        setTimeout(() => {
          enterDirectly();
        }, 350);
      }
    };

    const enterDirectly = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      const target = route.query.redirect || '/dashboard';
      router.push(target);
    };

    onMounted(() => {
      startTime = null;
      animationFrame = requestAnimationFrame(stepAnimation);
    });

    onUnmounted(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    });

    return {
      activeTenant,
      progress,
      strokeOffset,
      enterDirectly
    };
  }
});
</script>

<style scoped>
/* ==========================================================================
   Luxury Automotive / Apple Keynote Circular Loading Philosophy
   Zero visual noise. No walls of text. Pure continuous circular poise.
   ========================================================================== */

.luxury-loading-stage {
  min-height: 100vh;
  width: 100%;
  background-color: #030712;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 48px 24px;
  cursor: pointer;
  user-select: none;
}

/* Subtle Spatial Depth Substrate */
.ambient-substrate {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
    radial-gradient(circle at 60% 55%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.04) 0%, transparent 50%);
  z-index: 1;
}

.loader-portal {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
}

/* Precision Circular Stage */
.circular-stage {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  overflow: visible;
}

.ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 1.5;
}

.ring-progress {
  fill: none;
  stroke: url(#specularGlow);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 427.256;
  transition: stroke-dashoffset 0.1s linear;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.45));
}

/* Emblem Center with Breathing Scale */
.emblem-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.brand-emblem {
  width: 52px;
  height: 52px;
  object-fit: contain;
  opacity: 0.95;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6));
  animation: emblem-breath 3.6s ease-in-out infinite;
}

@keyframes emblem-breath {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
    filter: drop-shadow(0 0 14px rgba(212, 175, 55, 0.35));
  }
}

/* Restrained Brand Caption */
.brand-caption {
  margin-top: 32px;
  text-align: center;
}

.brand-monogram {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
}

.brand-sub {
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: 0.22em;
}

.sub-whisper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.status-pulse-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
}

.whisper-text {
  font-weight: 600;
  color: #94a3b8;
}

.whisper-percentage {
  color: #d4af37;
  font-weight: 600;
  min-width: 32px;
  text-align: right;
}

/* Quiet Luxury Footer */
.luxury-footer {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #475569;
  letter-spacing: 0.05em;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.skip-hint {
  color: #64748b;
  transition: color 0.2s ease;
}

.luxury-loading-stage:hover .skip-hint {
  color: #a5b4fc;
}

@media (max-width: 640px) {
  .luxury-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
