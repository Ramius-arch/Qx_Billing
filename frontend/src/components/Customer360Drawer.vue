<template>
  <a-drawer
    :open="open"
    :width="isMobile ? '100%' : 640"
    :closable="true"
    rootClassName="customer-360-drawer"
    @close="$emit('close')"
  >
    <template #title>
      <div v-if="summary?.customer" class="c360-title-wrap">
        <div class="c360-avatar font-mono">{{ initial }}</div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="c360-name">{{ summary.customer.name }}</span>
            <span class="c360-seg-pill" :class="'seg-' + (summary.insights?.segment || 'no_purchases')">
              {{ summary.insights?.segmentLabel || 'Customer' }}
            </span>
            <span v-if="summary.customer.status === 'archived'" class="c360-archived-pill">ARCHIVED</span>
          </div>
          <div class="c360-subline font-mono">
            <span>{{ formatPhone(summary.customer.phone_number) }}</span>
            <span v-if="summary.customer.address"> · {{ summary.customer.address }}</span>
            <span v-if="summary.customer.email"> · {{ summary.customer.email }}</span>
          </div>
        </div>
      </div>
      <span v-else class="font-bold">Customer Profile</span>
    </template>

    <div v-if="loading" class="py-16 flex flex-col items-center justify-center gap-3">
      <a-spin size="large" />
      <span class="c360-muted text-xs font-mono">Loading purchase & payment history...</span>
    </div>

    <div v-else-if="summary" class="c360-body space-y-5">
      <!-- Action bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="c360-btn-wa" @click="sendWhatsApp">
            <niche-icon name="whatsapp" :size="14" />
            <span>{{ hasDebt ? 'Remind on WhatsApp' : 'Chat on WhatsApp' }}</span>
          </button>
          <button type="button" class="c360-btn-bill" @click="$emit('bill', summary.customer)">
            <niche-icon name="plus" :size="14" />
            <span>Issue Bill</span>
          </button>
          <button type="button" class="c360-btn-ghost" @click="$emit('edit', summary.customer)">
            <span>Edit Details</span>
          </button>
        </div>

        <a-popconfirm
          v-if="summary.customer.status !== 'archived'"
          title="Archive this customer? Their order & M-Pesa history stays preserved."
          ok-text="Archive"
          cancel-text="Cancel"
          @confirm="$emit('archive', summary.customer.id)"
        >
          <button type="button" class="c360-btn-danger-ghost">Archive</button>
        </a-popconfirm>
      </div>

      <!-- Plain-language Next Step -->
      <div
        class="c360-nextstep"
        :class="hasDebt ? 'tone-debt' : (summary.insights.segment === 'lapsing' ? 'tone-warn' : 'tone-ok')"
      >
        <div class="flex items-start gap-2.5">
          <niche-icon :name="hasDebt ? 'warning' : 'zap'" :size="16" class="mt-0.5 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="c360-nextstep-kicker font-mono">SUGGESTED NEXT STEP</div>
            <div class="c360-nextstep-text">{{ summary.insights.nextStep }}</div>
          </div>
        </div>
      </div>

      <!-- 4 Key Figures -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="c360-kpi-card">
          <div class="c360-kpi-label font-mono">LIFETIME SPEND</div>
          <div class="c360-kpi-value font-mono">KES {{ formatKes(summary.insights.lifetimeSpend) }}</div>
        </div>
        <div class="c360-kpi-card">
          <div class="c360-kpi-label font-mono">ORDERS</div>
          <div class="c360-kpi-value font-mono">{{ summary.insights.orderCount }}</div>
          <div v-if="summary.insights.averageOrderValue" class="c360-kpi-sub">
            Avg KES {{ formatKes(summary.insights.averageOrderValue) }}
          </div>
        </div>
        <div class="c360-kpi-card">
          <div class="c360-kpi-label font-mono">LAST PURCHASE</div>
          <div class="c360-kpi-value">{{ formatLastPurchase(summary.insights.daysSinceLastPurchase) }}</div>
          <div v-if="summary.insights.lastPurchaseAt" class="c360-kpi-sub">
            {{ formatShortDate(summary.insights.lastPurchaseAt) }}
          </div>
        </div>
        <div class="c360-kpi-card" :class="hasDebt ? 'c360-kpi-alert' : ''">
          <div class="c360-kpi-label font-mono">BALANCE OWED</div>
          <div class="c360-kpi-value font-mono">KES {{ formatKes(summary.insights.balanceDue) }}</div>
          <div class="c360-kpi-sub">{{ hasDebt ? 'Follow up due' : 'All settled' }}</div>
        </div>
      </div>

      <!-- Advanced technical bar -->
      <div v-if="isProMode" class="c360-pro-strip font-mono">
        <span>ID #{{ summary.customer.id }}</span>
        <span v-if="summary.customer.Plan">Plan: {{ summary.customer.Plan.name }}</span>
        <span>Status: {{ (summary.customer.status || 'active').toUpperCase() }}</span>
        <span>Joined: {{ formatShortDate(summary.customer.createdAt) }}</span>
      </div>

      <!-- Open Invoices / Dues -->
      <section v-if="summary.openInvoices?.length" class="c360-section">
        <div class="c360-section-hdr">
          <h4 class="c360-section-title">Open Bills & Dues ({{ summary.openInvoices.length }})</h4>
          <span class="c360-muted text-xs font-mono">Unpaid credit</span>
        </div>
        <div class="space-y-2">
          <div v-for="inv in summary.openInvoices" :key="inv.id" class="c360-row-card">
            <div>
              <div class="font-mono text-xs font-bold c360-strong">{{ inv.invoiceNumber }}</div>
              <div class="c360-muted text-xs">Due {{ formatShortDate(inv.dueDate) }}</div>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="c360-status-pill" :class="inv.status === 'overdue' ? 'st-overdue' : 'st-pending'">
                {{ (inv.status || 'pending').toUpperCase() }}
              </span>
              <span class="font-mono text-sm font-extrabold c360-amber">KES {{ formatKes(inv.amountDue) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Order History -->
      <section class="c360-section">
        <div class="c360-section-hdr">
          <h4 class="c360-section-title">Purchase History ({{ summary.orders?.length || 0 }})</h4>
          <span class="c360-muted text-xs font-mono">Recent orders & items</span>
        </div>
        <div v-if="!summary.orders?.length" class="c360-empty">
          No recorded purchases yet for this customer.
        </div>
        <div v-else class="space-y-2.5">
          <div v-for="ord in summary.orders" :key="ord.id" class="c360-order-card">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-extrabold c360-strong">{{ ord.orderNumber }}</span>
                <span class="c360-status-pill" :class="'st-' + (ord.status || 'paid')">
                  {{ (ord.status || 'paid').toUpperCase() }}
                </span>
              </div>
              <span class="font-mono text-sm font-extrabold c360-strong">
                KES {{ formatKes(ord.total ?? ord.totalAmount) }}
              </span>
            </div>
            <div class="c360-muted text-xs flex flex-wrap items-center gap-2 mt-1">
              <span>{{ formatShortDate(ord.createdAt) }}</span>
              <span v-if="ord.paymentMethod">· {{ String(ord.paymentMethod).toUpperCase() }}</span>
              <span v-if="ord.paymentReceipt || ord.mpesaReceipt" class="font-mono c360-receipt-tag">
                {{ ord.paymentReceipt || ord.mpesaReceipt }}
              </span>
            </div>
            <ul v-if="(ord.lines || ord.items)?.length" class="c360-items-list mt-2">
              <li v-for="(line, lIdx) in (ord.lines || ord.items)" :key="lIdx" class="flex justify-between text-xs">
                <span class="c360-item-name">{{ line.quantity || line.qty || 1 }}x {{ line.title || line.name }}</span>
                <span class="font-mono c360-muted">
                  KES {{ formatKes(line.lineTotal ?? ((line.unitPrice || line.price || 0) * (line.quantity || line.qty || 1))) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Payment Receipts -->
      <section class="c360-section">
        <div class="c360-section-hdr">
          <h4 class="c360-section-title">Payment Receipts ({{ summary.payments?.length || 0 }})</h4>
          <span class="c360-muted text-xs font-mono">M-Pesa & Cash</span>
        </div>
        <div v-if="!summary.payments?.length" class="c360-empty">
          No completed payments recorded yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="pay in summary.payments" :key="pay.id" class="c360-row-card">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold c360-strong">
                  {{ pay.receipt_number || 'CASH-RECEIPT' }}
                </span>
                <span class="c360-muted text-xs uppercase">{{ pay.payment_method || 'mpesa' }}</span>
              </div>
              <div class="c360-muted text-xs">{{ formatShortDate(pay.payment_date) }}</div>
            </div>
            <span class="font-mono text-sm font-bold c360-emerald">+ KES {{ formatKes(pay.amount) }}</span>
          </div>
        </div>
      </section>
    </div>
  </a-drawer>
</template>

<script>
import { computed } from 'vue';
import NicheIcon from './NicheIcon.vue';
import { isProMode } from '../services/cockpitMode';

export default {
  name: 'Customer360Drawer',
  components: { NicheIcon },
  props: {
    open: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    summary: { type: Object, default: null },
    isMobile: { type: Boolean, default: false },
  },
  emits: ['close', 'edit', 'bill', 'archive'],
  setup(props) {
    const initial = computed(() => {
      const name = props.summary?.customer?.name || 'C';
      return name.trim().charAt(0).toUpperCase();
    });

    const hasDebt = computed(() => (props.summary?.insights?.balanceDue || 0) > 0);

    const formatKes = (val) => Math.round(Number(val) || 0).toLocaleString('en-KE');

    const formatPhone = (raw) => {
      const digits = String(raw || '').replace(/\D/g, '');
      if (digits.startsWith('254') && digits.length === 12) {
        return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
      }
      return raw || '—';
    };

    const formatShortDate = (iso) => {
      if (!iso) return '—';
      try {
        return new Date(iso).toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch (e) {
        return String(iso).slice(0, 10);
      }
    };

    const formatLastPurchase = (days) => {
      if (days === null || days === undefined) return 'Never';
      if (days <= 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
    };

    const sendWhatsApp = () => {
      const c = props.summary?.customer;
      if (!c) return;
      const phone = String(c.phone_number || '').replace(/\D/g, '');
      if (!phone) return;
      const firstName = (c.name || 'Customer').split(' ')[0];
      const owed = props.summary?.insights?.balanceDue || 0;
      const text = owed > 0
        ? `Hello ${firstName}, friendly reminder of your open balance of KES ${formatKes(owed)} at Ladha Store. Let us know when you'd like to clear via M-Pesa.`
        : `Hello ${firstName}! Greetings from Ladha Store. Let us know if we can help with your next order.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return {
      isProMode,
      initial,
      hasDebt,
      formatKes,
      formatPhone,
      formatShortDate,
      formatLastPurchase,
      sendWhatsApp,
    };
  },
};
</script>

<style>
.customer-360-drawer .ant-drawer-content {
  background: #ffffff !important;
  color: #0f172a !important;
}
.customer-360-drawer .ant-drawer-header {
  background: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 16px 20px !important;
}
.customer-360-drawer .ant-drawer-close {
  color: #475569 !important;
}

:root[data-theme='dark'] .customer-360-drawer .ant-drawer-content,
[data-theme='dark'] .customer-360-drawer .ant-drawer-content {
  background: #0b1120 !important;
  color: #f1f5f9 !important;
}
:root[data-theme='dark'] .customer-360-drawer .ant-drawer-header,
[data-theme='dark'] .customer-360-drawer .ant-drawer-header {
  background: #070c18 !important;
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
}
:root[data-theme='dark'] .customer-360-drawer .ant-drawer-close,
[data-theme='dark'] .customer-360-drawer .ant-drawer-close {
  color: #94a3b8 !important;
}

.customer-360-drawer .c360-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.customer-360-drawer .c360-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
}
:root[data-theme='dark'] .customer-360-drawer .c360-avatar {
  background: rgba(67, 56, 202, 0.45);
  color: #e0e7ff;
  border-color: rgba(129, 140, 248, 0.4);
}
.customer-360-drawer .c360-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}
:root[data-theme='dark'] .customer-360-drawer .c360-name {
  color: #ffffff;
}
.customer-360-drawer .c360-subline {
  font-size: 11.5px;
  color: #475569;
  margin-top: 2px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-subline {
  color: #94a3b8;
}

.customer-360-drawer .c360-seg-pill,
.customer-360-drawer .c360-archived-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.customer-360-drawer .c360-seg-pill.seg-vip { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.customer-360-drawer .c360-seg-pill.seg-regular { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.customer-360-drawer .c360-seg-pill.seg-new { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
.customer-360-drawer .c360-seg-pill.seg-lapsing { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.customer-360-drawer .c360-seg-pill.seg-no_purchases { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.customer-360-drawer .c360-archived-pill { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

:root[data-theme='dark'] .customer-360-drawer .c360-seg-pill.seg-vip { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border-color: rgba(245, 158, 11, 0.4); }
:root[data-theme='dark'] .customer-360-drawer .c360-seg-pill.seg-regular { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.35); }
:root[data-theme='dark'] .customer-360-drawer .c360-seg-pill.seg-new { background: rgba(99, 102, 241, 0.22); color: #c7d2fe; border-color: rgba(129, 140, 248, 0.4); }
:root[data-theme='dark'] .customer-360-drawer .c360-seg-pill.seg-lapsing { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }
:root[data-theme='dark'] .customer-360-drawer .c360-seg-pill.seg-no_purchases,
:root[data-theme='dark'] .customer-360-drawer .c360-archived-pill { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.3); }

.customer-360-drawer .c360-btn-wa,
.customer-360-drawer .c360-btn-bill,
.customer-360-drawer .c360-btn-ghost,
.customer-360-drawer .c360-btn-danger-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.customer-360-drawer .c360-btn-wa { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.customer-360-drawer .c360-btn-bill { background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }
.customer-360-drawer .c360-btn-ghost { background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; }
.customer-360-drawer .c360-btn-danger-ghost { background: transparent; color: #b91c1c; border: 1px solid #fecaca; }

:root[data-theme='dark'] .customer-360-drawer .c360-btn-wa { background: rgba(6, 95, 70, 0.4); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.4); }
:root[data-theme='dark'] .customer-360-drawer .c360-btn-bill { background: rgba(55, 48, 163, 0.45); color: #c7d2fe; border-color: rgba(129, 140, 248, 0.4); }
:root[data-theme='dark'] .customer-360-drawer .c360-btn-ghost { background: rgba(255, 255, 255, 0.06); color: #e2e8f0; border-color: rgba(255, 255, 255, 0.12); }
:root[data-theme='dark'] .customer-360-drawer .c360-btn-danger-ghost { color: #fca5a5; border-color: rgba(239, 68, 68, 0.35); }

.customer-360-drawer .c360-nextstep {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.customer-360-drawer .c360-nextstep.tone-debt { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.customer-360-drawer .c360-nextstep.tone-warn { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.customer-360-drawer .c360-nextstep.tone-ok { background: #eef2ff; border-color: #c7d2fe; color: #312e81; }
:root[data-theme='dark'] .customer-360-drawer .c360-nextstep.tone-debt { background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #fde68a; }
:root[data-theme='dark'] .customer-360-drawer .c360-nextstep.tone-warn { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.35); color: #fca5a5; }
:root[data-theme='dark'] .customer-360-drawer .c360-nextstep.tone-ok { background: rgba(99, 102, 241, 0.14); border-color: rgba(129, 140, 248, 0.35); color: #e0e7ff; }

.customer-360-drawer .c360-nextstep-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  opacity: 0.85;
}
.customer-360-drawer .c360-nextstep-text {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
}

.customer-360-drawer .c360-kpi-card {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.customer-360-drawer .c360-kpi-card.c360-kpi-alert {
  background: #fffbeb;
  border-color: #fcd34d;
}
:root[data-theme='dark'] .customer-360-drawer .c360-kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.09);
}
:root[data-theme='dark'] .customer-360-drawer .c360-kpi-card.c360-kpi-alert {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.35);
}
.customer-360-drawer .c360-kpi-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #64748b;
}
:root[data-theme='dark'] .customer-360-drawer .c360-kpi-label { color: #94a3b8; }
.customer-360-drawer .c360-kpi-value {
  font-size: 15px;
  font-weight: 800;
  margin-top: 4px;
  color: #0f172a;
}
:root[data-theme='dark'] .customer-360-drawer .c360-kpi-value { color: #ffffff; }
.customer-360-drawer .c360-kpi-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-kpi-sub { color: #94a3b8; }

.customer-360-drawer .c360-pro-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
}
:root[data-theme='dark'] .customer-360-drawer .c360-pro-strip {
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
}

.customer-360-drawer .c360-section-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.customer-360-drawer .c360-section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
:root[data-theme='dark'] .customer-360-drawer .c360-section-title { color: #f8fafc; }

.customer-360-drawer .c360-row-card,
.customer-360-drawer .c360-order-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}
.customer-360-drawer .c360-row-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-row-card,
:root[data-theme='dark'] .customer-360-drawer .c360-order-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.09);
}

.customer-360-drawer .c360-items-list {
  list-style: none;
  padding: 8px 0 0;
  margin: 8px 0 0;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-items-list {
  border-top-color: rgba(255, 255, 255, 0.1);
}
.customer-360-drawer .c360-item-name { color: #334155; font-weight: 600; }
:root[data-theme='dark'] .customer-360-drawer .c360-item-name { color: #cbd5e1; }

.customer-360-drawer .c360-receipt-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #334155;
  font-size: 10.5px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-receipt-tag {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.customer-360-drawer .c360-status-pill {
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 800;
}
.customer-360-drawer .st-paid,
.customer-360-drawer .st-fulfilled { background: #ecfdf5; color: #065f46; }
.customer-360-drawer .st-pending { background: #fffbeb; color: #92400e; }
.customer-360-drawer .st-overdue { background: #fee2e2; color: #991b1b; }
:root[data-theme='dark'] .customer-360-drawer .st-paid,
:root[data-theme='dark'] .customer-360-drawer .st-fulfilled { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
:root[data-theme='dark'] .customer-360-drawer .st-pending { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
:root[data-theme='dark'] .customer-360-drawer .st-overdue { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

.customer-360-drawer .c360-empty {
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 12.5px;
}
:root[data-theme='dark'] .customer-360-drawer .c360-empty {
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.customer-360-drawer .c360-strong { color: #0f172a; }
.customer-360-drawer .c360-muted { color: #64748b; }
.customer-360-drawer .c360-amber { color: #b45309; }
.customer-360-drawer .c360-emerald { color: #047857; }
:root[data-theme='dark'] .customer-360-drawer .c360-strong { color: #f8fafc; }
:root[data-theme='dark'] .customer-360-drawer .c360-muted { color: #94a3b8; }
:root[data-theme='dark'] .customer-360-drawer .c360-amber { color: #fbbf24; }
:root[data-theme='dark'] .customer-360-drawer .c360-emerald { color: #34d399; }
</style>
