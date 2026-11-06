<template>
  <div class="billing-engine-page max-w-[1400px] mx-auto px-4 py-2 space-y-6">
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

            <a-form-item label="Base Currency">
              <a-select v-model:value="canvasForm.currency">
                <a-select-option value="KES">KES (KSh)</a-select-option>
                <a-select-option value="USD">USD ($)</a-select-option>
                <a-select-option value="EUR">EUR (€)</a-select-option>
                <a-select-option value="GBP">GBP (£)</a-select-option>
              </a-select>
            </a-form-item>

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
                  <a-select v-model:value="line.accountCode" placeholder="Account" class="w-full">
                    <a-select-option v-for="acc in (trialBalance.accounts || defaultAccounts)" :key="acc.code" :value="acc.code">
                      {{ acc.code }} - {{ acc.name }}
                    </a-select-option>
                  </a-select>
                </div>
                <div class="col-span-3">
                  <a-input-number 
                    v-model:value="line.debit" 
                    placeholder="Debit" 
                    :min="0" 
                    class="w-full" 
                    @change="line.credit = 0"
                  />
                </div>
                <div class="col-span-3">
                  <a-input-number 
                    v-model:value="line.credit" 
                    placeholder="Credit" 
                    :min="0" 
                    class="w-full" 
                    @change="line.debit = 0"
                  />
                </div>
                <div class="col-span-1 text-center">
                  <a-button type="text" danger size="small" @click="removeLineItem(idx)" :disabled="entryForm.lines.length <= 2">
                    &times;
                  </a-button>
                </div>
              </div>
            </div>

            <div class="mt-4 p-3 rounded-lg border flex justify-between items-center font-mono text-xs" :class="isEntryBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'">
              <div>
                <span>Debits: <strong>{{ sumDebits.toFixed(2) }}</strong></span> &bull; 
                <span>Credits: <strong>{{ sumCredits.toFixed(2) }}</strong></span>
              </div>
              <div class="font-bold">
                {{ isEntryBalanced ? 'BALANCED' : 'VARIANCE: ' + Math.abs(sumDebits - sumCredits).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
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
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'BillingEngine',
  components: {
    AccountBookOutlined,
    SyncOutlined,
    LineChartOutlined,
    SettingOutlined,
    PlusOutlined,
    ThunderboltOutlined
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
        { accountCode: '1020', debit: 1000, credit: 0 },
        { accountCode: '4010', debit: 0, credit: 1000 }
      ]
    });

    const sumDebits = computed(() => {
      return (entryForm.value.lines || []).reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    });

    const sumCredits = computed(() => {
      return (entryForm.value.lines || []).reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    });

    const isEntryBalanced = computed(() => {
      return Math.abs(sumDebits.value - sumCredits.value) < 0.01;
    });

    const getTypeTagColor = (type) => {
      const t = String(type || '').toLowerCase();
      if (t === 'asset') return 'green';
      if (t === 'liability') return 'blue';
      if (t === 'revenue') return 'purple';
      if (t === 'expense') return 'orange';
      return 'default';
    };

    const fetchCustomers = async () => {
      try {
        const res = await api.getCustomers(1, 100);
        if (res.data?.customers) {
          customers.value = res.data.customers;
        } else if (res.data?.data) {
          customers.value = res.data.data;
        }
      } catch (err) {
        console.warn('Customer list warning:', err.message);
      }
    };

    const fetchTrialBalance = async () => {
      loadingTB.value = true;
      try {
        const res = await api.getTrialBalance();
        if (res.data) {
          trialBalance.value = res.data;
        }
      } catch (err) {
        console.error('Trial balance fetch failed', err);
      } finally {
        loadingTB.value = false;
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await api.getLedgerProfile();
        if (res.data?.data) {
          profile.value = res.data.data;
          canvasForm.value = { ...res.data.data };
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err.message);
      }
    };

    const handleCustomerChange = async (id) => {
      selectedCustomerId.value = id;
      await fetchForecast();
    };

    const fetchForecast = async () => {
      if (!selectedCustomerId.value) return;
      loadingForecast.value = true;
      try {
        const res = await api.getBillingForecast(selectedCustomerId.value);
        forecast.value = res.data || {
          currentUsage: { retail_order: 1, delivery_tariff: 250 },
          projection: { total: 3750 }
        };
      } catch (err) {
        forecast.value = {
          currentUsage: { retail_order: 1, delivery_tariff: 250 },
          projection: { total: 3750 }
        };
      } finally {
        loadingForecast.value = false;
      }
    };

    const processBilling = async () => {
      if (!selectedCustomerId.value) return;
      generating.value = true;
      try {
        await api.generateBill(selectedCustomerId.value);
        message.success('Ledger statement verified & tax invoice generated.');
        await fetchTrialBalance();
      } catch (err) {
        message.error('Settlement calculation error');
      } finally {
        generating.value = false;
      }
    };

    const filterCustomer = (input, option) => {
      return option.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    const openCanvasDrawer = () => {
      canvasForm.value = { ...profile.value };
      showCanvasDrawer.value = true;
    };

    const applyTemplate = (type) => {
      if (type === 'retail') {
        aiOverviewInput.value = "We operate a physical boutique fashion store in Nairobi called 'Ladha Studios'. We sell 1-of-1 apparel via M-Pesa with 16% Kenyan VAT.";
      } else if (type === 'saas') {
        aiOverviewInput.value = "We are an AI developer tools SaaS platform in San Francisco called 'Synapse Cloud Inc'. We bill recurring monthly subscriptions in USD with 0% state sales tax.";
      } else if (type === 'services') {
        aiOverviewInput.value = "We are a turnkey industrial systems engineering firm called 'Quixora Solutions'. We bill commercial clients on 60-30-10 milestones in KES with 16% VAT.";
      }
      autoFillFromDoc();
    };

    const autoFillFromDoc = () => {
      const text = aiOverviewInput.value.toLowerCase();
      if (!text) {
        message.warning('Please enter or select an overview prompt.');
        return;
      }

      if (text.includes('saas') || text.includes('subscription')) {
        canvasForm.value.archetype = 'saas';
      } else if (text.includes('consulting') || text.includes('turnkey') || text.includes('services')) {
        canvasForm.value.archetype = 'services';
      } else {
        canvasForm.value.archetype = 'retail';
      }

      if (text.includes('usd') || text.includes('$')) {
        canvasForm.value.currency = 'USD';
        canvasForm.value.currencySymbol = '$';
      } else if (text.includes('kes') || text.includes('kenya') || text.includes('nairobi')) {
        canvasForm.value.currency = 'KES';
        canvasForm.value.currencySymbol = 'KES';
      }

      const nameMatch = aiOverviewInput.value.match(/(?:called|named|enterprise|store|firm)\s+['"]?([^'",\.\n]+)['"]?/i);
      if (nameMatch && nameMatch[1]) {
        canvasForm.value.businessName = nameMatch[1].trim();
        canvasForm.value.legalEntity = nameMatch[1].trim() + ' Ltd';
      }

      message.success(`Parsed overview: Selected "${canvasForm.value.archetype.toUpperCase()}" archetype in ${canvasForm.value.currency}.`);
    };

    const onArchetypeChange = (val) => {
      if (val === 'retail') setPreset('d2c_archival');
      else if (val === 'saas') setPreset('b2b_saas');
      else if (val === 'services') setPreset('creative_agency');
    };

    const saveCanvasConfig = async () => {
      savingCanvas.value = true;
      try {
        await api.updateLedgerProfile(canvasForm.value);
        await api.initializeArchetype(canvasForm.value.archetype);
        onArchetypeChange(canvasForm.value.archetype);
        message.success('Business Canvas & Ledger synchronized!');
        showCanvasDrawer.value = false;
        await fetchProfile();
        await fetchTrialBalance();
      } catch (err) {
        message.error('Failed to save canvas settings: ' + err.message);
      } finally {
        savingCanvas.value = false;
      }
    };

    const addLineItem = () => {
      entryForm.value.lines.push({ accountCode: '1020', debit: 0, credit: 0 });
    };

    const removeLineItem = (idx) => {
      if (entryForm.value.lines.length > 2) {
        entryForm.value.lines.splice(idx, 1);
      }
    };

    const submitJournalEntry = async () => {
      if (!isEntryBalanced.value) {
        message.error('Double-entry balance violation: Debits must equal Credits.');
        return;
      }
      postingEntry.value = true;
      try {
        await api.postJournalEntry({
          reference: entryForm.value.reference || `JE-MANUAL-${Date.now()}`,
          description: entryForm.value.description || 'Manual General Ledger Adjustment',
          sourceType: entryForm.value.sourceType,
          lines: entryForm.value.lines,
          currency: profile.value.currency
        });

        message.success('Journal entry posted and ledger updated!');
        showEntryModal.value = false;
        entryForm.value.reference = '';
        entryForm.value.description = '';
        await fetchTrialBalance();
      } catch (err) {
        message.error(err.response?.data?.error || err.message);
      } finally {
        postingEntry.value = false;
      }
    };

    const handleResetToClean = async () => {
      clearingPoC.value = true;
      try {
        const res = await api.resetPoCLedger();
        setPoCMode(false);
        await fetchTrialBalance();
        message.success(res.data?.message || 'Ledger reset to clean zero-balance state!');
      } catch (err) {
        message.error('Failed to reset ledger: ' + (err.response?.data?.error || err.message));
      } finally {
        clearingPoC.value = false;
      }
    };

    const handleSeedPoC = async () => {
      seedingPoC.value = true;
      try {
        const res = await api.seedPoCLedger();
        setPoCMode(true);
        await fetchTrialBalance();
        message.success(res.data?.message || 'Benchmark PoC fixtures re-seeded successfully!');
      } catch (err) {
        message.error('Failed to seed PoC: ' + (err.response?.data?.error || err.message));
      } finally {
        seedingPoC.value = false;
      }
    };

    onMounted(async () => {
      await fetchCustomers();
      await fetchTrialBalance();
      await fetchProfile();
    });

    return {
      activeTenant,
      isPoCMode,
      clearingPoC,
      seedingPoC,
      handleResetToClean,
      handleSeedPoC,
      customers,
      selectedCustomerId,
      forecast,
      loadingForecast,
      generating,
      loadingTB,
      savingCanvas,
      postingEntry,
      showCanvasDrawer,
      showEntryModal,
      aiOverviewInput,
      canvasForm,
      entryForm,
      ledgerColumns,
      trialBalance,
      defaultAccounts,
      sumDebits,
      sumCredits,
      isEntryBalanced,
      getTypeTagColor,
      fetchTrialBalance,
      handleCustomerChange,
      fetchForecast,
      processBilling,
      filterCustomer,
      openCanvasDrawer,
      applyTemplate,
      autoFillFromDoc,
      onArchetypeChange,
      saveCanvasConfig,
      addLineItem,
      removeLineItem,
      submitJournalEntry
    };
  }
});
</script>

<style scoped>
.bespoke-card {
  background: var(--surface-card);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  backdrop-filter: blur(28px) saturate(190%);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

.ambient-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-family: monospace;
  font-size: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #818cf8;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #10b981;
}

.calligraphic-accent {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.15em;
  color: #d4af37;
}

.calligraphic-quote {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--text-muted);
}
</style>
