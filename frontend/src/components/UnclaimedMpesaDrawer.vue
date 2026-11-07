<template>
  <a-drawer
    :open="visible"
    title="Unmatched M-Pesa Receipts (Reconciliation Bucket)"
    placement="right"
    width="480"
    @close="handleClose"
    class="mpesa-drawer"
  >
    <div class="unclaimed-mpesa-content font-sans">
      <!-- Context Banner -->
      <div class="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <span class="text-xl">⚠️</span>
        <div>
          <h4 class="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Unassigned Lipa na M-Pesa Payments ({{ unclaimedList.length }})
          </h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            These payments arrived in your Till/Paybill but had no invoice reference. Link them to an open invoice with 1 click to balance your books.
          </p>
        </div>
      </div>

      <!-- Receipts List -->
      <div class="space-y-3">
        <div 
          v-for="item in unclaimedList" 
          :key="item.mpesaCode"
          class="receipt-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {{ item.mpesaCode }}
                </span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ item.senderName }}</span>
              </div>
              <div class="text-[10px] font-mono text-slate-400 mt-0.5">
                {{ item.phone }} &bull; {{ item.timestamp }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                KES {{ item.amount.toLocaleString() }}
              </div>
              <span class="text-[9px] font-mono text-slate-400 uppercase">Till #882941</span>
            </div>
          </div>

          <!-- Matching Selector -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            <select 
              v-model="item.selectedInvoiceId" 
              class="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200"
            >
              <option value="" disabled selected>Select unpaid invoice to match...</option>
              <option v-for="inv in openInvoices" :key="inv.id" :value="inv.id">
                #{{ inv.id }} - {{ inv.customerName }} (KES {{ inv.amount.toLocaleString() }})
              </option>
            </select>

            <button 
              type="button" 
              :disabled="!item.selectedInvoiceId"
              @click="reconcileItem(item)"
              class="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-1"
            >
              <span>Match</span>
              <span>&check;</span>
            </button>
          </div>
        </div>

        <div v-if="unclaimedList.length === 0" class="text-center py-12 text-slate-400 font-mono text-xs">
          <div class="text-3xl mb-2">🎉</div>
          <p class="font-bold">Zero Unmatched Payments</p>
          <p class="text-[11px] text-slate-500">Every Lipa na M-Pesa transaction is reconciled to an invoice.</p>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'UnclaimedMpesaDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'reconciled'],
  setup(props, { emit }) {
    const unclaimedList = ref([
      {
        mpesaCode: 'QK8912LX01',
        senderName: 'Faith Wangari',
        phone: '+254 722 *** 819',
        amount: 4500,
        timestamp: '14 mins ago',
        selectedInvoiceId: ''
      },
      {
        mpesaCode: 'QK8909AB34',
        senderName: 'Kevin Otieno',
        phone: '+254 711 *** 402',
        amount: 8200,
        timestamp: '1 hour ago',
        selectedInvoiceId: ''
      },
      {
        mpesaCode: 'QK8876ZZ91',
        senderName: 'Dennis Mutua',
        phone: '+254 798 *** 115',
        amount: 3500,
        timestamp: '3 hours ago',
        selectedInvoiceId: ''
      }
    ]);

    const openInvoices = ref([
      { id: '1042', customerName: 'John Mwangi', amount: 4500 },
      { id: '1043', customerName: 'Nairobi Streetwear Hub', amount: 8200 },
      { id: '1044', customerName: 'Archival Vault Ltd', amount: 3500 },
      { id: '1045', customerName: 'Grace Achieng', amount: 12000 }
    ]);

    const handleClose = () => {
      emit('update:visible', false);
    };

    const reconcileItem = (item) => {
      if (!item.selectedInvoiceId) return;

      const idx = unclaimedList.value.findIndex(r => r.mpesaCode === item.mpesaCode);
      if (idx !== -1) {
        unclaimedList.value.splice(idx, 1);
      }

      message.success(`Reconciled: Payment ${item.mpesaCode} (KES ${item.amount.toLocaleString()}) attached to Invoice #${item.selectedInvoiceId}. Ledger balanced.`);
      emit('reconciled', {
        mpesaCode: item.mpesaCode,
        invoiceId: item.selectedInvoiceId,
        amount: item.amount
      });
    };

    return {
      unclaimedList,
      openInvoices,
      handleClose,
      reconcileItem
    };
  }
});
</script>

<style scoped>
.receipt-card {
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.receipt-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
}
</style>
