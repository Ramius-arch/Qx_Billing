<template>
  <div class="business-coach-hud mb-6 transition-all duration-300">
    <!-- 1. Coach Top Ribbon (Sports Trainer Header) -->
    <div class="coach-ribbon-card p-5 rounded-2xl border transition-all">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Left: Trainer Identity & Vitality Score Dial -->
        <div class="flex items-start sm:items-center gap-4">
          <!-- Circular Vitality Dial -->
          <div class="vitality-dial-wrapper flex-shrink-0">
            <div class="vitality-dial relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-emerald-500/40 bg-emerald-500/5 shadow-inner">
              <span class="text-xl font-mono font-black text-slate-900 dark:text-white leading-none">
                {{ storeVitality.score }}
              </span>
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <!-- Coach Headline & Diagnosis -->
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border" :class="storeVitality.badgeColor">
                ● FORM: {{ storeVitality.grade }}
              </span>
              <span class="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                EA-Style Business Coach HUD
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white m-0 tracking-tight">
              Store Operational Vitality & Runway
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 mb-0 max-w-xl">
              {{ storeVitality.summary }}
            </p>
          </div>
        </div>

        <!-- Right: Trainer Telemetry Metrics & HUD Toggle -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="hidden sm:flex items-center gap-3 font-mono text-xs">
            <!-- Cash Runway -->
            <div class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Cash Runway</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ financialBreakdown.cashRunwayDays }} Days Safe</span>
            </div>

            <!-- Stock Provision -->
            <div class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Stock Balance</span>
              <span class="font-bold text-amber-600 dark:text-amber-400">{{ stockHealth.starvingItems.length }} Starving SKUs</span>
            </div>

            <!-- Net Spendable -->
            <div class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">True Net Margin</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">KES {{ financialBreakdown.netProfit.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Coach Interactive Toggle -->
          <button
            type="button"
            @click="toggleCoachHUD"
            class="px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border shadow-xs"
            :class="isCoachActive ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-500/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'"
            title="Toggle Business Coach Advice Cards"
          >
            <span>🎮</span>
            <span>{{ isCoachActive ? 'Coach: Active' : 'Coach: Muted' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Expandable Trainer Briefing Cards (The EA Sports "Tactical Advice" Layer) -->
      <div v-if="isCoachActive" class="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ⚡ Real-Time Tactical Coaching Briefs ({{ coachBriefings.length }} Insights)
            </span>
          </div>
          <span class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            Simulated Benchmark: Nairobi Streetwear Retail
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div
            v-for="brief in coachBriefings"
            :key="brief.id"
            class="coach-brief-card p-4 rounded-xl border transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-lg">{{ brief.icon }}</span>
                  <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {{ brief.category }}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" :class="getBadgeClass(brief.badgeType)">
                  {{ brief.badge }}
                </span>
              </div>
              <h4 class="text-xs font-black text-slate-900 dark:text-white m-0 leading-tight">
                {{ brief.headline }}
              </h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1.5 mb-3 leading-relaxed">
                {{ brief.body }}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                @click="handleBriefAction(brief.actionKey)"
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>{{ brief.actionLabel }}</span>
                <span>&rarr;</span>
              </button>
              <span class="text-[10px] font-mono text-slate-400">Actionable Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Modal: Reorder Assistant & Stock Runway Breakdown -->
    <a-modal
      v-model:open="showReorderModal"
      title="Stock Depletion & Reorder Radar"
      :footer="null"
      width="640px"
    >
      <div class="space-y-4 py-2 font-sans">
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Calculated burn rate across your physical catalog. Items in the <strong class="text-amber-600">Starving Zone</strong> have less than 3 days of remaining inventory at current shopper demand.
        </p>

        <div class="space-y-2.5">
          <div
            v-for="item in coachMetrics.inventoryItems"
            :key="item.id"
            class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
          >
            <div>
              <div class="font-bold text-xs text-slate-900 dark:text-white">{{ item.title }}</div>
              <div class="text-[11px] font-mono text-slate-500 mt-0.5">
                Stock: {{ item.stockUnits }} units &bull; Velocity: {{ item.dailyBurnRate }} sales/day
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-right font-mono">
                <span class="text-xs font-bold block" :class="item.runwayDays <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                  {{ item.runwayDays }} Days Left
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ item.runwayDays <= 3 ? 'REORDER NOW' : 'SAFE RUNWAY' }}
                </span>
              </div>
              <button
                type="button"
                @click="quickReorder(item)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                + Restock
              </button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 4. Modal: True Net Profit & KRA VAT Segregation -->
    <a-modal
      v-model:open="showTaxModal"
      title="True Net Margin vs Statutory Deductions"
      :footer="null"
      width="560px"
    >
      <div class="space-y-4 py-2 font-sans text-xs">
        <p class="text-slate-600 dark:text-slate-400">
          Why color-coding is not enough: here is the exact financial breakdown separating your spendable cash from legal tax obligations and logistics payouts.
        </p>

        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
          <div class="flex justify-between py-1 text-slate-700 dark:text-slate-300">
            <span>Gross Settled Sales (GMV):</span>
            <span class="font-bold text-slate-900 dark:text-white">KES {{ financialBreakdown.gmv.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-1 text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>- Statutory 16% KRA eTIMS VAT:</span>
            <span>- KES {{ financialBreakdown.vatReserve.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-1 text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>- Courier & Boda Delivery Tariffs:</span>
            <span>- KES {{ financialBreakdown.deliveryCosts.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between pt-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
            <span>Clean Bankable Profit:</span>
            <span>KES {{ financialBreakdown.netProfit.toLocaleString() }} ({{ financialBreakdown.profitMarginPercent }}%)</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          ✓ <strong>Peace of Mind Guarantee</strong>: The KES {{ financialBreakdown.vatReserve.toLocaleString() }} tax buffer is segregated. You will have no surprise penalty when filing your monthly KRA return on the 20th.
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import {
  isCoachActive,
  toggleCoachHUD,
  storeVitality,
  financialBreakdown,
  stockHealth,
  coachBriefings,
  coachMetrics
} from '../services/businessCoach';

export default defineComponent({
  name: 'BusinessCoachHUD',
  setup() {
    const showReorderModal = ref(false);
    const showTaxModal = ref(false);

    const getBadgeClass = (type) => {
      if (type === 'amber') return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      if (type === 'indigo') return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30';
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
    };

    const handleBriefAction = (actionKey) => {
      if (actionKey === 'reorder') {
        showReorderModal.value = true;
      } else if (actionKey === 'tax-breakdown') {
        showTaxModal.value = true;
      } else if (actionKey === 'riders') {
        message.info('Opening delivery rider tracker & WhatsApp dispatch pins.');
        window.location.hash = '#/usage-tracker';
      }
    };

    const quickReorder = (item) => {
      item.stockUnits += 5;
      item.runwayDays = Math.round(((item.stockUnits / item.dailyBurnRate)) * 10) / 10;
      message.success(`Restock order recorded! Added 5 units to ${item.title}. New runway: ${item.runwayDays} days.`);
    };

    return {
      isCoachActive,
      toggleCoachHUD,
      storeVitality,
      financialBreakdown,
      stockHealth,
      coachBriefings,
      coachMetrics,
      showReorderModal,
      showTaxModal,
      getBadgeClass,
      handleBriefAction,
      quickReorder
    };
  }
});
</script>

<style scoped>
.coach-ribbon-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
    0 2px 10px -2px rgba(15, 23, 42, 0.04);
}

:root[data-theme='dark'] .coach-ribbon-card {
  background: #0f172a;
  border-color: #1e293b;
  box-shadow: 
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.10),
    0 10px 30px -4px rgba(0, 0, 0, 0.6);
}

.coach-brief-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 1px 0 #ffffff;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

:root[data-theme='dark'] .coach-brief-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.coach-brief-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 16px -2px rgba(99, 102, 241, 0.10);
}
</style>
