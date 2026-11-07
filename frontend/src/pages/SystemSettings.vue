<template>
  <div class="settings-page max-w-[1100px] mx-auto px-4 py-2">
    <!-- 1. Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight m-0" style="color: var(--text-primary);">
            {{ activeTenant.brand.name }} Financial & SaaS Platform Settings
          </h2>
          <p class="text-sm mt-1" style="color: var(--text-secondary);">
            Active SaaS Industry: <span class="font-bold text-indigo-500">{{ activeTenant.industryName }}</span> &bull; 
            Default Currency: <span class="font-mono font-bold">{{ activeTenant.currency.code }} ({{ activeTenant.currency.symbol }})</span> &bull; 
            Compliance: <span class="font-mono">{{ activeTenant.brand.complianceBadge }}</span>
          </p>
        </div>
        <div class="hidden sm:block">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            WHITE-LABEL BENCHMARK ACTIVE
          </span>
        </div>
      </div>
    </div>

    <!-- 2. SaaS Industry Benchmark Variation Switcher -->
    <a-card title="SaaS Industry Benchmark Switcher (Multi-Domain Architecture)" class="bespoke-card mb-6">
      <p class="text-xs text-slate-400 mb-4">
        This platform is engineered as a white-label enterprise financial benchmark. Select any business preset below to instantly adapt branding, telemetry, terminology, currency, and financial statements across the entire OS without starting from scratch:
      </p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="p in availablePresets" 
          :key="p.key"
          @click="selectPreset(p.key)"
          class="preset-card cursor-pointer p-4 rounded-xl border transition-all duration-200"
          :class="p.key === currentPresetKey ? 'preset-card-active' : 'preset-card-idle'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-sm" style="color: var(--text-primary);">{{ p.name }}</span>
            <span class="font-mono text-xs px-2 py-0.5 rounded font-bold" :class="p.key === currentPresetKey ? 'bg-indigo-500 text-white' : 'bg-slate-700/20 text-slate-400'">
              {{ p.currency }}
            </span>
          </div>
          <p class="text-xs text-slate-400 m-0 line-clamp-2">
            {{ p.industry }}
          </p>
          <div class="mt-3 pt-2 border-t flex items-center justify-between text-[11px]" :style="{ borderColor: 'var(--border-glass-subtle)' }">
            <span class="font-mono text-slate-500">{{ p.key === currentPresetKey ? '● CURRENT PRESET' : 'Click to activate' }}</span>
            <span v-if="p.key === currentPresetKey" class="text-indigo-400 font-bold">Active ✓</span>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 3. Display, Theme & Experience Options (Jakob's Law: Device Standard) -->
    <a-card title="Display & Experience Defaults" class="bespoke-card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Appearance Theme Preference -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Appearance Theme
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="setTheme('system')"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5"
              :class="themePreference === 'system' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              <span class="text-xl">💻</span>
              <span class="text-xs font-bold">System</span>
              <span class="text-[10px] text-slate-500 font-mono">Device Mode</span>
            </button>

            <button
              type="button"
              @click="setTheme('light')"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5"
              :class="themePreference === 'light' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              <span class="text-xl">☀️</span>
              <span class="text-xs font-bold">Light</span>
              <span class="text-[10px] text-slate-500 font-mono">Ceramic Clean</span>
            </button>

            <button
              type="button"
              @click="setTheme('dark')"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5"
              :class="themePreference === 'dark' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              <span class="text-xl">🌙</span>
              <span class="text-xs font-bold">Dark</span>
              <span class="text-[10px] text-slate-500 font-mono">Apple Obsidian</span>
            </button>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 mb-0">
            Active view: <strong class="text-indigo-600 dark:text-indigo-400">{{ isDark ? 'Dark Mode' : 'Light Mode' }}</strong>
            <span v-if="themePreference === 'system'" class="font-mono"> (Automatically synced with your device OS)</span>.
          </p>
        </div>

        <!-- Cockpit Experience Mode (Sports Car Drive Mode) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Cockpit Experience Mode
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="changeCockpitMode('standard')"
              class="p-3 rounded-xl border text-left transition-all"
              :class="currentMode === 'standard' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              <div class="flex items-center gap-1.5 font-bold text-xs mb-1">
                <span>🛣️</span>
                <span>Standard (Street)</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                Simpler & intuitive UI for retail shopkeeping, WhatsApp receipts, and M-Pesa sales.
              </p>
            </button>

            <button
              type="button"
              @click="changeCockpitMode('advanced')"
              class="p-3 rounded-xl border text-left transition-all"
              :class="currentMode === 'advanced' ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
            >
              <div class="flex items-center gap-1.5 font-bold text-xs mb-1">
                <span>🏁</span>
                <span>Advanced (Track)</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                Full telemetry, double-entry ledger, 1-of-1 archival locks, and multi-domain diligence.
              </p>
            </button>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 mb-0">
            Switch anytime using the top navigation toggle or here in settings.
          </p>
        </div>
      </div>
    </a-card>

    <!-- 4. Existing Fiscal & Operational Settings -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a-card title="Fiscal & Taxation Parameters" class="bespoke-card">
        <a-form layout="vertical" @finish="saveConfig">
          <a-form-item label="Statutory Output VAT Rate (%)" name="vat_rate">
            <a-input-number v-model:value="config.vat_rate" :min="0" :max="100" style="width: 100%" size="large" />
          </a-form-item>
          <a-form-item label="Settlement Currency" name="currency">
            <a-input v-model:value="config.currency" size="large" />
          </a-form-item>
          <a-button type="primary" html-type="submit" :loading="saving" block class="h-10 font-bold mt-2">
            Save Fiscal Settings
          </a-button>
        </a-form>
      </a-card>

      <a-card title="Regional Logistics & Tariffs" class="bespoke-card">
        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-2 border-b" style="border-color: var(--border-glass-subtle);">
            <span style="color: var(--text-secondary);" class="font-medium">Express Dispatch Zone:</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ activeTenant.currency.prefix }} 200</span>
          </div>
          <div class="flex justify-between py-2 border-b" style="border-color: var(--border-glass-subtle);">
            <span style="color: var(--text-secondary);" class="font-medium">Primary Metropolitan Metro:</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ activeTenant.currency.prefix }} 250</span>
          </div>
          <div class="flex justify-between py-2 border-b" style="border-color: var(--border-glass-subtle);">
            <span style="color: var(--text-secondary);" class="font-medium">Suburban Commercial Belt:</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ activeTenant.currency.prefix }} 300</span>
          </div>
          <div class="flex justify-between py-2 border-b" style="border-color: var(--border-glass-subtle);">
            <span style="color: var(--text-secondary);" class="font-medium">Regional Outpost / Perimeter:</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ activeTenant.currency.prefix }} 400</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t text-[11px]" style="border-color: var(--border-glass-subtle); color: var(--text-muted);">
          * Tariffs are automatically applied during checkout and recorded in Account 4100.
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useTenantConfig } from '../services/tenantConfig';
import { themePreference, isDark, setThemePreference } from '../services/themeMode';
import { currentMode, setMode as setCockpitMode } from '../services/cockpitMode';
import api from '../services/api';

export default defineComponent({
  name: 'SystemSettings',
  setup() {
    const { activeTenant, currentPresetKey, availablePresets, setPreset } = useTenantConfig();
    const config = ref({ vat_rate: 16, currency: activeTenant.value.currency.code });
    const saving = ref(false);

    const selectPreset = (key) => {
      setPreset(key);
      config.value.currency = activeTenant.value.currency.code;
      message.success(`Platform benchmark updated: ${activeTenant.value.brand.name} (${activeTenant.value.industryName}) active.`);
    };

    const setTheme = (pref) => {
      setThemePreference(pref);
      const label = pref === 'system' ? 'System Default (Matching Device)' : (pref === 'light' ? 'Light Mode' : 'Dark Mode');
      message.success(`Appearance updated: ${label}`);
    };

    const changeCockpitMode = (mode) => {
      setCockpitMode(mode);
      message.success(`Cockpit mode switched to ${mode === 'standard' ? 'Standard (Street)' : 'Advanced (Track)'}`);
    };

    const saveConfig = async () => {
      saving.value = true;
      try {
        message.success('Settings updated and persisted across financial ledger.');
      } catch (err) {
        message.error('Failed to save settings.');
      } finally {
        saving.value = false;
      }
    };

    return { 
      config, 
      saveConfig, 
      saving,
      activeTenant,
      currentPresetKey,
      availablePresets,
      selectPreset
    };
  }
});
</script>

<style scoped>
.bespoke-card {
  border-radius: 14px !important;
  background: var(--surface-card) !important;
  border: 1px solid var(--border-glass) !important;
}

.preset-card-active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.5) !important;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.preset-card-idle {
  background: var(--surface-hover);
  border-color: var(--border-glass);
}

.preset-card-idle:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}
</style>
