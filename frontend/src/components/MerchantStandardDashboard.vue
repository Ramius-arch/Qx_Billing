<template>
  <div class="merchant-dashboard-root font-sans">
    <!-- 1. Merchant Cash Register Hero (Stripe & Square Inspired) -->
    <section class="merchant-hero-card mb-6">
      <div class="hero-top-row">
        <div class="till-identity">
          <div class="flex items-center gap-2 mb-1">
            <span class="store-badge font-mono">TILL #882941</span>
            <span class="gateway-live-badge font-mono">
              <span class="live-dot"></span>
              Lipa na M-Pesa Live
            </span>
          </div>
          <h1 class="store-title">
            {{ activeTenant.brand.name }} <span class="font-normal text-slate-500 dark:text-slate-400">Store</span>
          </h1>
          <p class="store-subtitle">
            Daily shop sales, customer WhatsApp billing, and M-Pesa Till reconciliation
          </p>
        </div>

        <!-- Big Primary Action Bar (Jakob's Law: dominant action) -->
        <div class="hero-action-buttons">
          <button 
            type="button" 
            class="btn-primary-sale"
            @click="$emit('create-sale')"
          >
            <span class="btn-icon">➕</span>
            <span>Make a Sale / Issue Bill</span>
          </button>

          <button 
            type="button" 
            class="btn-secondary-action btn-whatsapp"
            @click="$emit('open-whatsapp')"
          >
            <span>💬</span>
            <span>WhatsApp Bill</span>
          </button>

          <button 
            type="button" 
            class="btn-secondary-action"
            @click="$emit('open-stk')"
          >
            <span>📱</span>
            <span>M-Pesa STK Prompt</span>
          </button>
        </div>
      </div>

      <!-- Quick Numbers Strip (Glanceable Financial Reality) -->
      <div class="merchant-numbers-grid">
        <div class="stat-box primary-box">
          <span class="box-label">TODAY'S CASH RECEIVED</span>
          <div class="box-value-row">
            <span class="box-currency font-mono">KES</span>
            <span class="box-amount tabular-nums">14,200</span>
          </div>
          <span class="box-meta font-mono">4 customer sales settled today</span>
        </div>

        <div class="stat-box">
          <span class="box-label">THIS MONTH'S TOTAL SALES</span>
          <div class="box-value-row">
            <span class="box-currency font-mono">KES</span>
            <span class="box-amount tabular-nums">328,000</span>
          </div>
          <span class="box-trend text-emerald-500 font-mono font-bold">↑ 18.5% vs last month</span>
        </div>

        <div class="stat-box">
          <span class="box-label">UNPAID CUSTOMER BILLS</span>
          <div class="box-value-row">
            <span class="box-currency font-mono">KES</span>
            <span class="box-amount tabular-nums text-amber-500">16,500</span>
          </div>
          <span class="box-meta text-amber-500/90 font-mono font-bold">3 customers pending payment</span>
        </div>

        <div class="stat-box">
          <span class="box-label">AVAILABLE TILL BALANCE</span>
          <div class="box-value-row">
            <span class="box-currency font-mono">KES</span>
            <span class="box-amount tabular-nums text-emerald-600 dark:text-emerald-400">72,250</span>
          </div>
          <span class="box-meta font-mono">Safaricom Merchant Holding</span>
        </div>
      </div>
    </section>

    <!-- 2. Action Required / Merchant Inbox (Stripe & Shopify Pattern) -->
    <section v-if="unclaimedCount > 0 || overdueCount > 0" class="action-inbox-section mb-6">
      <div class="inbox-header">
        <div class="flex items-center gap-2">
          <span class="inbox-warning-icon">⚠️</span>
          <h2 class="inbox-title">Action Required ({{ unclaimedCount + overdueCount }} items)</h2>
        </div>
        <span class="inbox-hint font-mono text-xs text-slate-400">Review before end of day</span>
      </div>

      <div class="inbox-items-grid">
        <!-- Unclaimed M-Pesa Item -->
        <div v-if="unclaimedCount > 0" class="inbox-card">
          <div class="inbox-card-left">
            <div class="item-tag tag-amber font-mono">UNMATCHED M-PESA</div>
            <div class="item-main-text">
              <strong>Faith Wangari</strong> paid <strong>KES 4,500</strong> on Till #882941 with no order reference.
            </div>
            <div class="item-sub-text font-mono text-slate-400">
              Receipt: QK8912LX01 &bull; 14 minutes ago
            </div>
          </div>
          <button 
            type="button" 
            class="inbox-btn-action"
            @click="$emit('open-unclaimed')"
          >
            <span>Match to Customer Bill</span>
            <span>&rarr;</span>
          </button>
        </div>

        <!-- Overdue Bill Reminder Item -->
        <div v-if="overdueCount > 0" class="inbox-card">
          <div class="inbox-card-left">
            <div class="item-tag tag-rose font-mono">UNPAID INVOICE</div>
            <div class="item-main-text">
              <strong>John Mwangi</strong> has an unpaid invoice #1042 for <strong>KES 4,500</strong>.
            </div>
            <div class="item-sub-text font-mono text-slate-400">
              Sent 3 days ago &bull; Due on delivery
            </div>
          </div>
          <button 
            type="button" 
            class="inbox-btn-action btn-green"
            @click="$emit('open-whatsapp', { id: '1042', customerName: 'John Mwangi', customerPhone: '712345678', amount: 4500 })"
          >
            <span>Send WhatsApp Reminder</span>
            <span>💬</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 3. Main Operational Grid: Sales Timeline & Recent Register -->
    <div class="merchant-body-grid">
      <!-- Left: Clean Daily Sales Timeline (Single Sleek Area Chart) -->
      <div class="timeline-panel">
        <div class="panel-header-clean">
          <div>
            <h2 class="panel-title-clean">Sales Trend</h2>
            <p class="panel-subtitle-clean">Daily customer collections and cashflow</p>
          </div>

          <div class="period-pills font-mono">
            <button 
              type="button" 
              class="pill-btn" 
              :class="{ 'is-active': period === '7d' }"
              @click="$emit('change-period', '7d')"
            >
              7 Days
            </button>
            <button 
              type="button" 
              class="pill-btn" 
              :class="{ 'is-active': period === '30d' }"
              @click="$emit('change-period', '30d')"
            >
              30 Days
            </button>
          </div>
        </div>

        <div class="chart-canvas-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>

        <div class="timeline-summary-bar font-mono">
          <div class="flex items-center gap-2">
            <span class="summary-dot"></span>
            <span>Average Daily Sales: <strong>KES 10,933</strong></span>
          </div>
          <span class="text-slate-400">Highest Day: Week 4 (KES 26,800)</span>
        </div>
      </div>

      <!-- Right: Live Customer Sales Register (Scannable Feed) -->
      <div class="register-panel">
        <div class="panel-header-clean">
          <div>
            <h2 class="panel-title-clean">Recent Sales Register</h2>
            <p class="panel-subtitle-clean">Live customer purchases & payments</p>
          </div>

          <router-link to="/usage-tracker" class="view-all-link font-mono">
            View All Orders &rarr;
          </router-link>
        </div>

        <div class="register-feed">
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="register-row"
            @click="selectOrder(order)"
          >
            <div class="row-left">
              <div class="customer-avatar" :class="order.paymentMethod === 'M-Pesa' ? 'avatar-mpesa' : 'avatar-cash'">
                {{ order.customerName ? order.customerName.charAt(0) : 'C' }}
              </div>
              <div class="order-details">
                <div class="order-customer-name">{{ order.customerName }}</div>
                <div class="order-meta font-mono">
                  <span class="method-tag" :class="order.paymentMethod === 'M-Pesa' ? 'tag-green' : 'tag-slate'">
                    {{ order.paymentMethod }}
                  </span>
                  <span>&bull;</span>
                  <span>{{ order.time }}</span>
                </div>
              </div>
            </div>

            <div class="row-right">
              <div class="order-amount font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                + KES {{ Number(order.amount).toLocaleString() }}
              </div>
              <div class="row-quick-actions">
                <button 
                  type="button" 
                  class="btn-row-action"
                  title="Share Receipt on WhatsApp"
                  @click.stop="$emit('open-whatsapp', order)"
                >
                  💬
                </button>
                <span class="status-chip font-mono" :class="order.status === 'Completed' ? 'chip-green' : 'chip-amber'">
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Slide-Over Order Detail Drawer (Stripe Pattern) -->
    <a-drawer
      :open="drawerVisible"
      title="Sale & Receipt Details"
      placement="right"
      width="420"
      @close="drawerVisible = false"
    >
      <div v-if="selectedOrder" class="drawer-sale-details font-sans">
        <div class="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span class="text-xs font-mono text-slate-400 uppercase">Total Amount Paid</span>
          <div class="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 my-1">
            KES {{ Number(selectedOrder.amount).toLocaleString() }}
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            {{ selectedOrder.paymentMethod }} &bull; Confirmed
          </span>
        </div>

        <div class="space-y-3 mb-6 text-xs font-mono">
          <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span class="text-slate-400">CUSTOMER:</span>
            <span class="font-bold text-slate-800 dark:text-slate-100">{{ selectedOrder.customerName }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span class="text-slate-400">PHONE:</span>
            <span>+254 {{ selectedOrder.customerPhone || '712345678' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span class="text-slate-400">M-PESA RECEIPT:</span>
            <span class="font-bold text-indigo-500">{{ selectedOrder.receipt || 'QK89123847' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span class="text-slate-400">ITEMS:</span>
            <span class="text-right">{{ selectedOrder.description || 'Ladha Archival Drop Item' }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <button 
            type="button" 
            class="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            @click="$emit('open-whatsapp', selectedOrder); drawerVisible = false"
          >
            <span>💬</span>
            <span>Send Receipt on WhatsApp</span>
          </button>
          
          <button 
            type="button" 
            class="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            @click="$emit('create-sale'); drawerVisible = false"
          >
            <span>➕</span>
            <span>Record Another Sale</span>
          </button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { Bar } from 'vue-chartjs';

export default defineComponent({
  name: 'MerchantStandardDashboard',
  components: {
    Bar
  },
  props: {
    activeTenant: {
      type: Object,
      required: true
    },
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      required: true
    },
    period: {
      type: String,
      default: '30d'
    }
  },
  emits: ['create-sale', 'open-whatsapp', 'open-stk', 'open-unclaimed', 'change-period'],
  setup(props, { emit }) {
    const unclaimedCount = ref(3);
    const overdueCount = ref(1);
    const drawerVisible = ref(false);
    const selectedOrder = ref(null);

    const recentOrders = ref([
      {
        id: '1042',
        customerName: 'John Mwangi',
        customerPhone: '712345678',
        amount: 4500,
        paymentMethod: 'M-Pesa',
        receipt: 'QK8912LX01',
        time: '14 mins ago',
        description: 'Ladha Heavyweight Obsidian Hoodie',
        status: 'Completed'
      },
      {
        id: '1043',
        customerName: 'Grace Achieng',
        customerPhone: '722998811',
        amount: 8200,
        paymentMethod: 'M-Pesa',
        receipt: 'QK8909AB34',
        time: '1 hour ago',
        description: 'Nocturne Oversized Streetwear Set',
        status: 'Completed'
      },
      {
        id: '1044',
        customerName: 'Kevin Otieno',
        customerPhone: '733445566',
        amount: 3500,
        paymentMethod: 'Cash',
        receipt: 'CASH-991',
        time: '3 hours ago',
        description: 'Archival Canvas Cap',
        status: 'Completed'
      },
      {
        id: '1045',
        customerName: 'Dennis Mutua',
        customerPhone: '798112233',
        amount: 12000,
        paymentMethod: 'M-Pesa',
        receipt: 'QK8876ZZ91',
        time: '5 hours ago',
        description: 'Limited Edition Drop Jacket',
        status: 'Completed'
      }
    ]);

    const selectOrder = (order) => {
      selectedOrder.value = order;
      drawerVisible.value = true;
    };

    return {
      unclaimedCount,
      overdueCount,
      recentOrders,
      drawerVisible,
      selectedOrder,
      selectOrder
    };
  }
});
</script>

<style scoped>
.merchant-dashboard-root {
  padding-bottom: 30px;
}

/* 1. Hero Card */
.merchant-hero-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

:root[data-theme="dark"] .merchant-hero-card,
body.dark .merchant-hero-card {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);
}

.hero-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
}

:root[data-theme="dark"] .hero-top-row,
body.dark .hero-top-row {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.store-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.gateway-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #10b981;
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.store-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 4px 0 2px 0;
  color: #0f172a;
}

:root[data-theme="dark"] .store-title,
body.dark .store-title {
  color: #f8fafc;
}

.store-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Action Buttons (Dominant Calls to Action) */
.hero-action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary-sale {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: #059669;
  color: #ffffff;
  font-weight: 800;
  font-size: 13px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
  transition: all 0.2s ease;
}

.btn-primary-sale:hover {
  background: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.45);
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(241, 245, 249, 0.9);
  color: #334155;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root[data-theme="dark"] .btn-secondary-action,
body.dark .btn-secondary-action {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.08);
}

.btn-secondary-action:hover {
  background: rgba(226, 232, 240, 0.9);
}

.btn-whatsapp {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.3);
}

:root[data-theme="dark"] .btn-whatsapp,
body.dark .btn-whatsapp {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.3);
}

/* Numbers Grid */
.merchant-numbers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  padding-top: 20px;
}

.stat-box {
  padding: 16px;
  background: rgba(248, 250, 252, 0.6);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 14px;
}

:root[data-theme="dark"] .stat-box,
body.dark .stat-box {
  background: rgba(15, 23, 42, 0.4);
  border-color: rgba(255, 255, 255, 0.05);
}

.primary-box {
  background: rgba(16, 185, 129, 0.04);
  border-color: rgba(16, 185, 129, 0.2);
}

.box-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #64748b;
  margin-bottom: 6px;
}

.box-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.box-currency {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
}

.box-amount {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

:root[data-theme="dark"] .box-amount,
body.dark .box-amount {
  color: #f8fafc;
}

.box-meta, .box-trend {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  color: #64748b;
}

/* 2. Action Inbox Section (Stripe Style) */
.action-inbox-section {
  padding: 18px 20px;
  background: rgba(254, 243, 199, 0.4);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
}

:root[data-theme="dark"] .action-inbox-section,
body.dark .action-inbox-section {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
}

.inbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.inbox-title {
  font-size: 14px;
  font-weight: 800;
  color: #92400e;
  margin: 0;
}

:root[data-theme="dark"] .inbox-title,
body.dark .inbox-title {
  color: #fcd34d;
}

.inbox-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.inbox-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
}

:root[data-theme="dark"] .inbox-card,
body.dark .inbox-card {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.08);
}

.item-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.tag-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.tag-rose {
  background: rgba(244, 63, 94, 0.15);
  color: #e11d48;
}

.item-main-text {
  font-size: 12.5px;
  color: #1e293b;
}

:root[data-theme="dark"] .item-main-text,
body.dark .item-main-text {
  color: #e2e8f0;
}

.inbox-btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.inbox-btn-action:hover {
  background: #4f46e5;
  color: #ffffff;
}

.inbox-btn-action.btn-green {
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.inbox-btn-action.btn-green:hover {
  background: #059669;
  color: #ffffff;
}

/* 3. Merchant Body Grid */
.merchant-body-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 1024px) {
  .merchant-body-grid {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

.timeline-panel, .register-panel {
  padding: 22px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

:root[data-theme="dark"] .timeline-panel,
:root[data-theme="dark"] .register-panel,
body.dark .timeline-panel,
body.dark .register-panel {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

.panel-header-clean {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title-clean {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

:root[data-theme="dark"] .panel-title-clean,
body.dark .panel-title-clean {
  color: #f8fafc;
}

.panel-subtitle-clean {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.period-pills {
  display: flex;
  gap: 4px;
  background: rgba(241, 245, 249, 0.8);
  padding: 3px;
  border-radius: 8px;
}

:root[data-theme="dark"] .period-pills,
body.dark .period-pills {
  background: rgba(30, 41, 59, 0.8);
}

.pill-btn {
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill-btn.is-active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] .pill-btn.is-active,
body.dark .pill-btn.is-active {
  background: #4f46e5;
  color: #ffffff;
}

.chart-canvas-wrapper {
  height: 240px;
  position: relative;
}

.timeline-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  font-size: 11px;
  color: #64748b;
}

:root[data-theme="dark"] .timeline-summary-bar,
body.dark .timeline-summary-bar {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #4f46e5;
}

/* Register Feed */
.register-feed {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root[data-theme="dark"] .register-row,
body.dark .register-row {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.05);
}

.register-row:hover {
  border-color: #6366f1;
  transform: translateX(2px);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.avatar-mpesa {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.avatar-cash {
  background: rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

.order-customer-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

:root[data-theme="dark"] .order-customer-name,
body.dark .order-customer-name {
  color: #f8fafc;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.method-tag {
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.tag-green {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.tag-slate {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-amount {
  font-size: 14px;
  font-weight: 800;
}

.row-quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-row-action {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
}

:root[data-theme="dark"] .btn-row-action,
body.dark .btn-row-action {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.status-chip {
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.chip-green {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.chip-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.view-all-link {
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}
</style>
