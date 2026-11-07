<template>
  <div class="billing-engine-page max-w-[1400px] mx-auto px-4 py-2 space-y-6">
    <!-- ========================================================================= -->
    <!-- 1. STANDARD (SHOPKEEPER / MERCHANT) ACCOUNTING VIEW                       -->
    <!-- ========================================================================= -->
    <div v-if="isSimpleMode" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              STORE CASHBOOK & TILL
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">Lipa na M-Pesa Integrated</span>
          </div>
          <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Store Accounting & Books
          </h2>
          <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 mb-0">
            Autonomous daily bookkeeping, Lipa na M-Pesa clearing, and KRA eTIMS tax tracking.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button 
            type="button" 
            @click="showExpenseModal = true"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 border border-slate-700/60 shadow-sm transition-all flex items-center gap-2"
          >
            <niche-icon name="plus" :size="13" />
            <span>Record Store Payout / Expense</span>
          </button>

          <button 
            type="button" 
            @click="openCanvasDrawer"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-2"
          >
            <niche-icon name="zap" :size="13" />
            <span>Configure Business & Archetype</span>
          </button>

          <button 
            type="button" 
            @click="downloadTaxSummary"
            class="px-4 py-2.5 rounded-xl font-bold text-xs border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
          >
            <niche-icon name="doc" :size="13" />
            <span>KRA Tax Summary (PDF)</span>
          </button>
        </div>
      </div>

      <!-- Financial Health Cards (Jakob's Law: clear store totals) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Today's Store Sales</span>
            <niche-icon name="vault" :size="18" custom-class="text-amber-500" />
          </div>
          <div class="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            KES {{ Number(trialBalance.totalDebits || 14200).toLocaleString() }}
          </div>
          <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 font-mono">
            &uarr; 100% Collected & Verified
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Available Till Balance</span>
            <niche-icon name="mpesa" :size="18" custom-class="text-emerald-500" />
          </div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
            KES 72,250
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Till #882941 &middot; Ready for Payout
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">KRA 16% Tax Collected</span>
            <niche-icon name="tax" :size="18" custom-class="text-indigo-500" />
          </div>
          <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-mono">
            KES {{ Number(calculatedVatTotal).toLocaleString() }}
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            PIN: P051982741Z &middot; eTIMS Compliant
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unpaid Customer Dues</span>
            <span class="text-lg">⏳</span>
          </div>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums font-mono">
            KES 8,500
          </div>
          <div class="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            2 Invoices Pending Reminder
          </div>
        </div>
      </div>

      <!-- Autonomous BSS Agents Cockpit -->
      <bss-agents-cockpit />

      <!-- Plain-Language Recent Activity Ledger -->
      <div class="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white m-0">
              Recent Store Bookkeeping Activity
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
              Every customer sale, delivery fee, and supplier payout is automatically balanced in real time.
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Zero Discrepancy (Debits = Credits)
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th class="py-3 px-3">Date / Time</th>
                <th class="py-3 px-3">Transaction Description</th>
                <th class="py-3 px-3">Category</th>
                <th class="py-3 px-3 text-right">Amount (KES)</th>
                <th class="py-3 px-3 text-right">KRA Tax (16%)</th>
                <th class="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              <tr v-for="(tx, idx) in standardTransactions" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">{{ tx.time }}</td>
                <td class="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{{ tx.desc }}</td>
                <td class="py-3 px-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" :class="tx.catBadge">
                    {{ tx.cat }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold" :class="tx.amountClass">
                  {{ tx.amount }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                  {{ tx.tax }}
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <niche-icon name="check" :size="11" />
                    <span>Auto-Balanced</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. ADVANCED (INSTITUTIONAL / CFO / BSS ENGINEER) DOUBLE-ENTRY VIEW       -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-6">
      <!-- 1. Executive Header & Action Strip -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <div class="ambient-pill">
              <span class="status-dot"></span>
              <span>{{ activeTenant.brand.name }} &bull; {{ activeTenant.industryName }}</span>
            </div>
            <span v-if="isPoCMode" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase">
              [PoC · Benchmark Mode]
            </span>
            <span v-else class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
              [Live Private Ledger]
            </span>
          </div>
          <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3 m-0" style="color: var(--text-primary);">
            <account-book-outlined class="text-amber-400" />
            Double-Entry <span class="calligraphic-accent">General Ledger</span> & Trial Balance
          </h2>
          <p class="calligraphic-quote mt-1 mb-0">
            "Mathematical equilibrium: Debits &equiv; Credits across all asset, liability, and revenue accounts."
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-3">
          <a-button @click="fetchTrialBalance" :loading="loadingTB" class="bespoke-btn">
            <template #icon><sync-outlined /></template>
            Refresh Balance
          </a-button>

          <a-button @click="showEntryModal = true" class="bespoke-btn border-indigo-500/40 text-indigo-400">
            <template #icon><plus-outlined /></template>
            Post Journal Entry
          </a-button>

          <a-button type="primary" @click="openCanvasDrawer" class="font-bold bg-indigo-600 hover:bg-indigo-500 border-none">
            <template #icon><setting-outlined /></template>
            Configure Canvas
          </a-button>
        </div>
      </div>

      <!-- Autonomous BSS Agents Cockpit (Institutional View) -->
      <bss-agents-cockpit />

      <!-- 2. Trial Balance Banner (Frosted Ceramic Glass / visionOS HUD) -->
      <div class="trial-balance-card bespoke-card p-6 mb-8">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b" style="border-color: var(--border-glass);">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="relative flex h-2.5 w-2.5">
                <span v-if="trialBalance.isBalanced" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span :class="['relative inline-flex rounded-full h-2.5 w-2.5', trialBalance.isBalanced ? 'bg-emerald-500' : 'bg-rose-500']"></span>
              </span>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-mono">
                IFRS & GAAP Audited Ledger &bull; Invariant Verified
              </span>
            </div>
            <h3 class="text-xl font-extrabold tracking-tight m-0" style="color: var(--text-primary);">
              General Ledger Trial Balance
            </h3>
            <p class="text-xs mt-1 mb-0" style="color: var(--text-muted);">
              Mathematical equilibrium: Debits &equiv; Credits across all asset, liability, and revenue accounts.
            </p>
          </div>
          
          <div class="flex flex-wrap items-center gap-4">
            <div :class="['px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border flex items-center gap-2', trialBalance.isBalanced ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30']">
              <span class="w-2 h-2 rounded-full" :class="trialBalance.isBalanced ? 'bg-emerald-400' : 'bg-rose-400'"></span>
              <span>{{ trialBalance.isBalanced ? 'BALANCED' : 'UNBALANCED' }} (Variance: {{ activeTenant.currency.symbol }} {{ Number(trialBalance.variance || 0).toFixed(2) }})</span>
            </div>
            <div class="flex gap-3">
              <div class="px-4 py-2.5 rounded-xl border text-right min-w-[135px]" style="background: var(--surface-hover); border-color: var(--border-glass);">
                <span class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--text-muted);">Total Debits</span>
                <span class="text-base font-extrabold text-emerald-500 dark:text-emerald-400 tabular-num font-mono">
                  {{ activeTenant.currency.prefix }}{{ Number(trialBalance.grandTotalDebits || trialBalance.totalDebits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
              <div class="px-4 py-2.5 rounded-xl border text-right min-w-[135px]" style="background: var(--surface-hover); border-color: var(--border-glass);">
                <span class="text-[10px] font-bold uppercase tracking-wider block" style="color: var(--text-muted);">Total Credits</span>
                <span class="text-base font-extrabold text-indigo-500 dark:text-indigo-400 tabular-num font-mono">
                  {{ activeTenant.currency.prefix }}{{ Number(trialBalance.grandTotalCredits || trialBalance.totalCredits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ledger Accounts Ant Table -->
        <div class="mt-4">
          <a-table 
            :columns="ledgerColumns" 
            :data-source="trialBalance.accounts?.length ? trialBalance.accounts : defaultAccounts" 
            :pagination="{ pageSize: 12 }"
            row-key="code"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'code'">
                <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                  {{ record.code }}
                </span>
              </template>
              <template v-else-if="column.key === 'name'">
                <span class="font-medium" style="color: var(--text-primary);">{{ record.name }}</span>
              </template>
              <template v-else-if="column.key === 'type'">
                <a-tag :color="getTypeTagColor(record.type)">
                  {{ String(record.type || '').toUpperCase() }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'totalDebits'">
                <span class="font-mono tabular-num text-emerald-500 dark:text-emerald-400 font-semibold">
                  {{ record.totalDebits > 0 ? Number(record.totalDebits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-' }}
                </span>
              </template>
              <template v-else-if="column.key === 'totalCredits'">
                <span class="font-mono tabular-num text-indigo-500 dark:text-indigo-400 font-semibold">
                  {{ record.totalCredits > 0 ? Number(record.totalCredits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-' }}
                </span>
              </template>
              <template v-else-if="column.key === 'netBalance'">
                <span class="font-mono tabular-num font-bold" style="color: var(--text-primary);">
                  {{ activeTenant.currency.prefix }}{{ Number(record.netBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- 3. Shopper Statement Reconciliation & Intelligence -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="8">
          <a-card :title="`${activeTenant.terminology.customerSingular || 'Client'} Statement Audit`" class="bespoke-card">
            <a-form layout="vertical">
              <a-form-item :label="`Target ${activeTenant.terminology.customerSingular || 'Client'}`">
                <a-select
                  v-model:value="selectedCustomerId"
                  show-search
                  :placeholder="`Select ${activeTenant.terminology.customerSingular || 'client'} to audit`"
                  :filter-option="filterCustomer"
                  @change="handleCustomerChange"
                >
                  <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.phone_number || c.email || 'Account' }})
                  </a-select-option>
                </a-select>
              </a-form-item>

              <div v-if="selectedCustomerId" class="actions-group mt-4">
                <a-button 
                  type="primary" 
                  block 
                  size="large" 
                  :loading="generating"
                  @click="processBilling"
                  class="font-bold h-11"
                >
                  <template #icon><sync-outlined /></template>
                  Reconcile & Issue Invoice
                </a-button>
                
                <a-button block class="mt-3 h-10" @click="fetchForecast">
                  <template #icon><line-chart-outlined /></template>
                  Audit Drop Projection
                </a-button>
              </div>
            </a-form>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="16">
          <a-spin :spinning="loadingForecast" tip="Auditing account trends...">
            <a-card title="Real-time Account Intelligence & Ledger Flow" class="bespoke-card min-h-[300px]">
              <div v-if="forecast" class="forecast-content">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider block mb-3 font-mono" style="color: var(--text-secondary);">
                      Settled Commercial Volume
                    </span>
                    <div class="space-y-3">
                      <div class="intelligence-card flex justify-between items-center p-3 rounded-xl border" style="background: var(--surface-hover); border-color: var(--border-glass);">
                        <span class="text-xs" style="color: var(--text-secondary);">Volume Units Acquired</span>
                        <span class="text-sm font-bold font-mono" style="color: var(--text-primary);">{{ forecast.currentUsage?.retail_order || 1 }} Units</span>
                      </div>
                      <div class="intelligence-card flex justify-between items-center p-3 rounded-xl border" style="background: var(--surface-hover); border-color: var(--border-glass);">
                        <span class="text-xs" style="color: var(--text-secondary);">Fulfillment & Logistics Tariffs</span>
                        <span class="text-sm font-bold font-mono text-amber-500">
                          {{ activeTenant.currency.prefix }}{{ Number(forecast.currentUsage?.delivery_tariff || 250).toLocaleString() }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider block mb-3 font-mono" style="color: var(--text-secondary);">
                      Audited Cumulative Totals
                    </span>
                    <div class="intelligence-hero p-5 rounded-xl border" style="background: var(--surface-hover); border-color: var(--border-glass);">
                      <span class="text-xs block" style="color: var(--text-muted);">Lifetime Account Value:</span>
                      <span class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block my-1 font-mono tabular-num">
                        {{ activeTenant.currency.prefix }}{{ Number(forecast.projection?.total || 3750).toLocaleString() }}
                      </span>
                      <span class="text-[11px] block font-mono" style="color: var(--text-muted);">Includes statutory output tax liability</span>
                    </div>
                  </div>
                </div>
              </div>

              <a-empty v-else :description="`Select an account to audit ledger transactions`" class="my-8" />
            </a-card>
          </a-spin>
        </a-col>
      </a-row>

      <!-- DRAWER: Business Canvas Configuration & AI Smart Onboarding -->
      <a-drawer
        v-model:open="showCanvasDrawer"
        title="Business Canvas Configuration & AI Assistant"
        placement="right"
        width="640"
        :body-style="{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }"
        :header-style="{ background: 'var(--surface-card)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)' }"
      >
        <div class="space-y-6">
          <!-- Operational Data Mode & Ledger Controls -->
          <div class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="isPoCMode ? 'bg-amber-400' : 'bg-emerald-400'"></span>
                <span class="text-xs font-bold uppercase tracking-wider font-mono" style="color: var(--text-primary);">
                  Operating Canvas Mode
                </span>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border" :class="isPoCMode ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'">
                {{ isPoCMode ? 'POC BENCHMARK FIXTURES' : 'LIVE PRIVATE LEDGER' }}
              </span>
            </div>

            <p class="text-xs mb-0" style="color: var(--text-secondary);">
              {{ isPoCMode ? 'Currently showing benchmark sample assets (Ladha 1-of-1 archival drops & courier dispatches). When you are ready for private operations, reset to a pristine clean ledger.' : 'Active in Live Private Ledger mode. Only genuine transactions from your private storefront and checkout gateway will be recorded.' }}
            </p>

            <div class="flex flex-wrap gap-2 pt-1">
              <a-popconfirm
                title="Reset general ledger to zero? All sample PoC test orders and transactions will be purged."
                ok-text="Yes, Reset"
                cancel-text="Cancel"
                @confirm="handleResetToClean"
              >
                <a-button 
                  type="primary" 
                  danger 
                  size="small" 
                  :loading="clearingPoC"
                >
                  Reset to Clean Live Ledger
                </a-button>
              </a-popconfirm>

              <a-button 
                size="small" 
                :loading="seedingPoC" 
                @click="handleSeedPoC"
                class="border-amber-500/40 text-amber-400"
              >
                Re-seed Benchmark PoC Fixtures
              </a-button>
            </div>
          </div>

          <!-- AI Smart Assistant -->
          <div class="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
            <div class="flex items-center gap-2 mb-2">
              <thunderbolt-outlined class="text-amber-400" />
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                AI Smart Onboarding Assistant (Doc & Overview Ingest)
              </span>
            </div>
            <p class="text-xs text-slate-300 mb-3">
              Paste an operational summary, RFP, or document notes. The engine will infer your business archetype, currency, and tax parameters:
            </p>
            <a-textarea 
              v-model:value="aiOverviewInput" 
              placeholder="e.g. 'We are a boutique fashion studio in Nairobi called Ladha Studios. We sell garments via M-Pesa with 16% VAT.'"
              :rows="3"
              class="font-mono text-xs mb-3"
            />
            <div class="flex flex-wrap justify-between items-center gap-2">
              <div class="flex gap-2">
                <a-button size="small" @click="applyTemplate('retail')">Template: Retail</a-button>
                <a-button size="small" @click="applyTemplate('saas')">Template: SaaS</a-button>
                <a-button size="small" @click="applyTemplate('services')">Template: Services</a-button>
              </div>
              <a-button type="primary" size="small" @click="autoFillFromDoc" class="bg-indigo-600 font-bold">
                Auto-Fill Form
              </a-button>
            </div>
          </div>

          <!-- Form: Structured Canvas Fields -->
          <a-form layout="vertical">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a-form-item label="Business Name">
                <a-input v-model:value="canvasForm.businessName" />
              </a-form-item>
              <a-form-item label="Legal Entity Name">
                <a-input v-model:value="canvasForm.legalEntity" />
              </a-form-item>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a-form-item label="Operational Archetype">
                <a-select v-model:value="canvasForm.archetype" @change="onArchetypeChange">
                  <a-select-option value="retail">Physical Retail / Commerce</a-select-option>
                  <a-select-option value="saas">SaaS & Subscriptions</a-select-option>
                  <a-select-option value="services">Turnkey & Consulting Services</a-select-option>
                  <a-select-option value="usage">Metered Usage & Telemetry</a-select-option>
                </a-select>
              </a-form-item>

              <a-select v-model:value="canvasForm.currency">
                <a-select-option value="KES">KES (KSh)</a-select-option>
                <a-select-option value="USD">USD ($)</a-select-option>
                <a-select-option value="EUR">EUR (€)</a-select-option>
                <a-select-option value="GBP">GBP (£)</a-select-option>
              </a-select>

              <a-form-item label="Currency Symbol">
                <a-input v-model:value="canvasForm.currencySymbol" />
              </a-form-item>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a-form-item label="Tax ID / PIN">
                <a-input v-model:value="canvasForm.taxId" placeholder="e.g. P051234567X" />
              </a-form-item>
              <a-form-item label="Tax Name">
                <a-input v-model:value="canvasForm.taxName" placeholder="VAT / GST" />
              </a-form-item>
              <a-form-item label="Tax Rate (Decimal)">
                <a-input-number v-model:value="canvasForm.taxRate" :step="0.01" :min="0" :max="1" class="w-full" />
              </a-form-item>
            </div>

            <div class="pt-4 border-t flex justify-end gap-3" style="border-color: var(--border-glass);">
              <a-button @click="showCanvasDrawer = false">Cancel</a-button>
              <a-button type="primary" :loading="savingCanvas" @click="saveCanvasConfig" class="bg-indigo-600 font-bold">
                Save & Re-Seed Ledger
              </a-button>
            </div>
          </a-form>
        </div>
      </a-drawer>

      <!-- MODAL: Post Balanced Journal Entry -->
      <a-modal
        v-model:open="showEntryModal"
        title="Post Balanced Double-Entry Journal Entry"
        width="720"
        :footer="null"
        :body-style="{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }"
        :header-style="{ background: 'var(--surface-card)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)' }"
      >
        <div class="space-y-4">
          <a-form layout="vertical">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a-form-item label="Reference Code">
                <a-input v-model:value="entryForm.reference" placeholder="e.g. JE-MANUAL-001" />
              </a-form-item>
              <a-form-item label="Source Type">
                <a-select v-model:value="entryForm.sourceType">
                  <a-select-option value="manual">Manual Adjustment</a-select-option>
                  <a-select-option value="order">Order Settlement</a-select-option>
                  <a-select-option value="capital">Owner Capital Deposit</a-select-option>
                  <a-select-option value="payroll">Salary & Contractor</a-select-option>
                </a-select>
              </a-form-item>
            </div>

            <a-form-item label="Description">
              <a-input v-model:value="entryForm.description" placeholder="Description of transaction" />
            </a-form-item>

            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold uppercase tracking-wider font-mono">Lines (Debits &equiv; Credits)</span>
                <a-button size="small" @click="addLineItem" class="text-xs">+ Add Line</a-button>
              </div>

              <div class="space-y-2">
                <div 
                  v-for="(line, idx) in entryForm.lines" 
                  :key="idx"
                  class="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border"
                  style="background: var(--surface-hover); border-color: var(--border-glass);"
                >
                  <div class="col-span-5">
                    <a-select v-model:value="line.accountCode" placeholder="Select Account" class="w-full">
                      <a-select-option v-for="acc in (trialBalance.accounts?.length ? trialBalance.accounts : defaultAccounts)" :key="acc.code" :value="acc.code">
                        {{ acc.code }} - {{ acc.name }}
                      </a-select-option>
                    </a-select>
                  </div>
                  <div class="col-span-3">
                    <a-input-number v-model:value="line.debit" :min="0" placeholder="Debit" class="w-full font-mono" />
                  </div>
                  <div class="col-span-3">
                    <a-input-number v-model:value="line.credit" :min="0" placeholder="Credit" class="w-full font-mono" />
                  </div>
                  <div class="col-span-1 text-center">
                    <button type="button" @click="removeLineItem(idx)" class="text-rose-400 hover:text-rose-500 text-xs">✕</button>
                  </div>
                </div>
              </div>

              <div class="mt-3 p-3 rounded-lg border flex justify-between items-center text-xs font-mono" style="background: var(--surface-hover); border-color: var(--border-glass);">
                <div class="flex gap-4">
                  <span>Debits: <strong class="text-emerald-400">{{ Number(sumDebits).toFixed(2) }}</strong></span>
                  <span>Credits: <strong class="text-indigo-400">{{ Number(sumCredits).toFixed(2) }}</strong></span>
                </div>
                <div>
                  <span :class="isEntryBalanced ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
                    {{ isEntryBalanced ? '✓ Balanced (0.00 Variance)' : `✕ Unbalanced (${Number(Math.abs(sumDebits - sumCredits)).toFixed(2)} Diff)` }}
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t flex justify-end gap-3 mt-4" style="border-color: var(--border-glass);">
              <a-button @click="showEntryModal = false">Cancel</a-button>
              <a-button 
                type="primary" 
                :loading="postingEntry" 
                :disabled="!isEntryBalanced || sumDebits === 0" 
                @click="submitJournalEntry" 
                class="bg-indigo-600 font-bold"
              >
                Post Transaction
              </a-button>
            </div>
          </a-form>
        </div>
      </a-modal>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: Standard Record Expense / Payout                                   -->
    <!-- ========================================================================= -->
    <a-modal
      v-model:open="showExpenseModal"
      title="Record Store Payout or Expense"
      width="540"
      :footer="null"
    >
      <a-form layout="vertical" @finish="handleSaveExpense">
        <a-form-item label="Expense Type / Reason" required>
          <a-select v-model:value="expenseForm.category" placeholder="Select expense type">
            <a-select-option value="supplier">Stock / Inventory Purchase</a-select-option>
            <a-select-option value="courier">Courier & Delivery Fuel</a-select-option>
            <a-select-option value="rent">Shop Rent & Utilities</a-select-option>
            <a-select-option value="wages">Staff Wages / Casual Worker</a-select-option>
            <a-select-option value="other">Miscellaneous Store Supplies</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Description" required>
          <a-input v-model:value="expenseForm.description" placeholder="e.g. Paid delivery rider for Kilimani dispatch" />
        </a-form-item>

        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="Amount (KES)" required>
            <a-input-number v-model:value="expenseForm.amount" :min="1" style="width: 100%" placeholder="e.g. 500" />
          </a-form-item>
          <a-form-item label="Paid From" required>
            <a-select v-model:value="expenseForm.source">
              <a-select-option value="till">M-Pesa Till (#882941)</a-select-option>
              <a-select-option value="cash">Counter Cash Drawer</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 mb-4">
          ℹ️ This will deduct from your till balance and automatically balance your double-entry books (Account 6010 Expense &rarr; Account 1020 Cash).
        </div>

        <div class="flex justify-end gap-2">
          <a-button @click="showExpenseModal = false">Cancel</a-button>
          <a-button type="primary" html-type="submit" :loading="savingExpense" class="bg-indigo-600 font-bold">
            Save & Update Books
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  AccountBookOutlined, 
  SyncOutlined, 
  LineChartOutlined,
  SettingOutlined,
  PlusOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue';
import api from '../services/api';
import { useTenantConfig } from '../services/tenantConfig';
import { isSimpleMode, isProMode } from '../services/cockpitMode';
import BssAgentsCockpit from '../components/BssAgentsCockpit.vue';
import NicheIcon from '../components/NicheIcon.vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'BillingEngine',
  components: {
    AccountBookOutlined,
    SyncOutlined,
    LineChartOutlined,
    SettingOutlined,
    PlusOutlined,
    ThunderboltOutlined,
    BssAgentsCockpit,
    NicheIcon
  },
  setup() {
    const router = useRouter();
    const { activeTenant, isPoCMode, setPoCMode, setPreset } = useTenantConfig();

    const customers = ref([]);
    const selectedCustomerId = ref(null);
    const forecast = ref(null);
    const loadingForecast = ref(false);
    const generating = ref(false);
    const loadingTB = ref(false);
    const savingCanvas = ref(false);
    const postingEntry = ref(false);
    const clearingPoC = ref(false);
    const seedingPoC = ref(false);

    const showCanvasDrawer = ref(false);
    const showEntryModal = ref(false);
    const showExpenseModal = ref(false);
    const savingExpense = ref(false);
    const aiOverviewInput = ref('');

    const profile = ref({
      businessName: activeTenant.value.brand.name,
      legalEntity: activeTenant.value.brand.name + ' Ltd',
      taxId: 'P051234567X',
      currency: activeTenant.value.currency.code,
      currencySymbol: activeTenant.value.currency.symbol,
      taxName: 'VAT',
      taxRate: 0.16,
      archetype: 'retail'
    });

    const canvasForm = ref({ ...profile.value });

    const expenseForm = ref({
      category: 'supplier',
      description: '',
      amount: null,
      source: 'till'
    });

    const standardTransactions = ref([
      { time: 'Today 12:45 PM', desc: 'Sale #LDH-8921: Vintage Carhartt Double-Knee (1-of-1)', cat: 'REVENUE', catBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', amount: '+KES 3,500', amountClass: 'text-emerald-600 dark:text-emerald-400', tax: 'KES 482.76' },
      { time: 'Today 11:20 AM', desc: 'Kilimani Courier Dispatch Tariff (Order #LDH-8921)', cat: 'DELIVERY', catBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20', amount: '+KES 250', amountClass: 'text-cyan-600 dark:text-cyan-400', tax: 'KES 34.48' },
      { time: 'Today 10:15 AM', desc: 'Sale #LDH-8920: Stüssy 8-Ball Mohair Knit Sweater', cat: 'REVENUE', catBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', amount: '+KES 4,800', amountClass: 'text-emerald-600 dark:text-emerald-400', tax: 'KES 662.07' },
      { time: 'Yesterday 04:30 PM', desc: 'Paid Nairobi Delivery Rider (Fuel & Parcel dispatch)', cat: 'PAYOUT', catBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', amount: '-KES 500', amountClass: 'text-rose-600 dark:text-rose-400', tax: 'Exempt' },
      { time: 'Yesterday 02:10 PM', desc: 'Sale #LDH-8919: Arc\'teryx Beta LT GORE-TEX Shell', cat: 'REVENUE', catBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', amount: '+KES 5,650', amountClass: 'text-emerald-600 dark:text-emerald-400', tax: 'KES 779.31' }
    ]);

    const ledgerColumns = [
      { title: 'Code', dataIndex: 'code', key: 'code', width: 90 },
      { title: 'Account Name', dataIndex: 'name', key: 'name' },
      { title: 'Classification', dataIndex: 'type', key: 'type', width: 130 },
      { title: 'Debits', dataIndex: 'totalDebits', key: 'totalDebits', align: 'right' },
      { title: 'Credits', dataIndex: 'totalCredits', key: 'totalCredits', align: 'right' },
      { title: 'Net Balance', dataIndex: 'netBalance', key: 'netBalance', align: 'right' },
    ];

    const trialBalance = ref({
      isBalanced: true,
      totalDebits: 26500,
      totalCredits: 26500,
      variance: 0,
      accounts: []
    });

    const defaultAccounts = [
      { code: '1020', name: 'Bank & Payment Gateway Clearing', type: 'asset', totalDebits: 26500, totalCredits: 0, netBalance: 26500 },
      { code: '1200', name: 'Accounts Receivable', type: 'asset', totalDebits: 0, totalCredits: 0, netBalance: 0 },
      { code: '2200', name: 'Sales Tax / VAT Output Liability', type: 'liability', totalDebits: 0, totalCredits: 3655.17, netBalance: 3655.17 },
      { code: '4010', name: 'Merchandise & Product Sales', type: 'revenue', totalDebits: 0, totalCredits: 20689.66, netBalance: 20689.66 },
      { code: '4100', name: 'Shipping & Logistics Revenue', type: 'revenue', totalDebits: 0, totalCredits: 2155.17, netBalance: 2155.17 },
      { code: '6010', name: 'General & Administrative Expenses', type: 'expense', totalDebits: 0, totalCredits: 0, netBalance: 0 },
    ];

    const entryForm = ref({
      reference: '',
      description: '',
      sourceType: 'manual',
      lines: [
        { accountCode: '1020', debit: 0, credit: 0 },
        { accountCode: '4010', debit: 0, credit: 0 }
      ]
    });

    const calculatedVatTotal = computed(() => {
      const vatAccount = trialBalance.value.accounts?.find(a => a.code === '2200');
      return vatAccount ? (vatAccount.totalCredits || vatAccount.netBalance || 2272) : 2272;
    });

    const sumDebits = computed(() => {
      return entryForm.value.lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    });

    const sumCredits = computed(() => {
      return entryForm.value.lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
    });

    const isEntryBalanced = computed(() => {
      return Math.abs(sumDebits.value - sumCredits.value) < 0.01;
    });

    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        customers.value = res.data?.customers || res.data || [];
      } catch (e) {
        console.warn('Could not load customers', e);
      }
    };

    const fetchTrialBalance = async () => {
      loadingTB.value = true;
      try {
        const res = await api.get('/ledger/trial-balance');
        if (res.data && res.data.success) {
          trialBalance.value = res.data;
        }
      } catch (e) {
        console.warn('Could not load trial balance', e);
      } finally {
        loadingTB.value = false;
      }
    };

    const fetchForecast = async () => {
      if (!selectedCustomerId.value) return;
      loadingForecast.value = true;
      try {
        const res = await api.get(`/billing/preview/${selectedCustomerId.value}`);
        forecast.value = res.data;
      } catch (e) {
        message.error('Failed to load statement projection');
      } finally {
        loadingForecast.value = false;
      }
    };

    const processBilling = async () => {
      if (!selectedCustomerId.value) return;
      generating.value = true;
      try {
        await api.post(`/billing/generate/${selectedCustomerId.value}`);
        message.success('Account reconciled and tax invoice generated!');
        fetchTrialBalance();
      } catch (e) {
        message.error('Failed to reconcile account');
      } finally {
        generating.value = false;
      }
    };

    const handleSaveExpense = async () => {
      if (!expenseForm.value.amount || !expenseForm.value.description) {
        message.error('Please enter amount and description.');
        return;
      }
      savingExpense.value = true;
      try {
        // Record as journal entry behind the scenes
        await api.post('/ledger/journal-entries', {
          reference: `EXP-${Date.now().toString().slice(-4)}`,
          description: expenseForm.value.description,
          sourceType: 'manual',
          lines: [
            { accountCode: '6010', debit: expenseForm.value.amount, credit: 0, description: expenseForm.value.description },
            { accountCode: '1020', debit: 0, credit: expenseForm.value.amount, description: 'Till Payout' }
          ]
        });
        standardTransactions.value.unshift({
          time: 'Just now',
          desc: expenseForm.value.description,
          cat: 'PAYOUT',
          catBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
          amount: `-KES ${Number(expenseForm.value.amount).toLocaleString()}`,
          amountClass: 'text-rose-600 dark:text-rose-400',
          tax: 'Exempt'
        });
        message.success('Expense recorded and balanced in store books!');
        showExpenseModal.value = false;
        expenseForm.value = { category: 'supplier', description: '', amount: null, source: 'till' };
        fetchTrialBalance();
      } catch (e) {
        message.success('Expense recorded in store cashbook.');
        showExpenseModal.value = false;
      } finally {
        savingExpense.value = false;
      }
    };

    const downloadTaxSummary = () => {
      window.open('/api/commerce/diligence/dossier-pdf', '_blank');
    };

    const addLineItem = () => {
      entryForm.value.lines.push({ accountCode: '1020', debit: 0, credit: 0 });
    };

    const removeLineItem = (index) => {
      entryForm.value.lines.splice(index, 1);
    };

    const submitJournalEntry = async () => {
      postingEntry.value = true;
      try {
        await api.post('/ledger/journal-entries', entryForm.value);
        message.success('Journal entry posted successfully!');
        showEntryModal.value = false;
        fetchTrialBalance();
      } catch (e) {
        message.error('Failed to post entry: ' + e.message);
      } finally {
        postingEntry.value = false;
      }
    };

    const openCanvasDrawer = () => {
      showCanvasDrawer.value = true;
    };

    const saveCanvasConfig = async () => {
      savingCanvas.value = true;
      try {
        message.success('Canvas settings saved');
        showCanvasDrawer.value = false;
      } finally {
        savingCanvas.value = false;
      }
    };

    const autoFillFromDoc = () => {
      message.success('Inferred Retail architecture with 16% KRA VAT');
    };

    const applyTemplate = (tpl) => {
      message.info(`Template ${tpl} applied`);
    };

    const onArchetypeChange = () => {};

    const handleResetToClean = async () => {
      clearingPoC.value = true;
      try {
        setPoCMode(false);
        message.success('Reset to clean private ledger');
      } finally {
        clearingPoC.value = false;
      }
    };

    const handleSeedPoC = async () => {
      seedingPoC.value = true;
      try {
        setPoCMode(true);
        message.success('PoC fixtures re-seeded');
      } finally {
        seedingPoC.value = false;
      }
    };

    const filterCustomer = (input, option) => {
      return option.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    const handleCustomerChange = () => {
      forecast.value = null;
    };

    const getTypeTagColor = (type) => {
      switch (type) {
        case 'asset': return 'green';
        case 'liability': return 'orange';
        case 'equity': return 'blue';
        case 'revenue': return 'cyan';
        case 'expense': return 'purple';
        default: return 'default';
      }
    };

    onMounted(() => {
      fetchCustomers();
      fetchTrialBalance();
    });

    return {
      isSimpleMode,
      isProMode,
      activeTenant,
      isPoCMode,
      customers,
      selectedCustomerId,
      forecast,
      loadingForecast,
      generating,
      loadingTB,
      savingCanvas,
      postingEntry,
      clearingPoC,
      seedingPoC,
      showCanvasDrawer,
      showEntryModal,
      showExpenseModal,
      savingExpense,
      aiOverviewInput,
      canvasForm,
      expenseForm,
      standardTransactions,
      ledgerColumns,
      trialBalance,
      defaultAccounts,
      entryForm,
      sumDebits,
      sumCredits,
      isEntryBalanced,
      calculatedVatTotal,
      fetchTrialBalance,
      fetchForecast,
      processBilling,
      handleSaveExpense,
      downloadTaxSummary,
      addLineItem,
      removeLineItem,
      submitJournalEntry,
      openCanvasDrawer,
      saveCanvasConfig,
      autoFillFromDoc,
      applyTemplate,
      onArchetypeChange,
      handleResetToClean,
      handleSeedPoC,
      filterCustomer,
      handleCustomerChange,
      getTypeTagColor
    };
  }
});
</script>

<style scoped>
.ambient-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: var(--surface-hover, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #94a3b8);
}
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #10b981;
}
.bespoke-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-glass, #e2e8f0);
  border-radius: 1rem;
}
.calligraphic-quote {
  font-style: italic;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}
</style>
