<template>
  <div class="payment-processing-container max-w-[1400px] mx-auto px-4 py-2 space-y-6">
    <!-- ========================================================================= -->
    <!-- 1. STANDARD (SHOPKEEPER) M-PESA SETTLEMENTS & TILL HUB                    -->
    <!-- ========================================================================= -->
    <div v-if="isSimpleMode" class="space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              TILL #882941 &bull; LIPA NA M-PESA
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">Real-time C2B Gateway</span>
          </div>
          <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            M-Pesa Settlements & Till Hub
          </h2>
          <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 mb-0">
            Monitor incoming Till payments, prompt customer phones for PIN entry, and match unassigned receipts.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button 
            type="button" 
            @click="openStkModal"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <span>📱</span>
            <span>Send M-Pesa STK Prompt</span>
          </button>

          <button 
            type="button" 
            @click="openUnclaimedDrawer"
            class="px-3.5 py-2.5 rounded-xl font-bold text-xs border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Unmatched Payments (2)</span>
          </button>
        </div>
      </div>

      <!-- Till Status Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available Till Balance</span>
            <span class="text-lg">📱</span>
          </div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
            KES 72,250
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Till #882941 &middot; Active & Settling
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Cash Inflow</span>
            <span class="text-lg">💵</span>
          </div>
          <div class="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            KES 14,200
          </div>
          <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            &uarr; 100% Reconciled to Orders
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unmatched Payments</span>
            <span class="text-lg">⚠️</span>
          </div>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums font-mono">
            2 Payments (KES 5,300)
          </div>
          <div class="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Click "Unmatched" to link to bills
          </div>
        </div>
      </div>

      <!-- Prompt Customer Phone Direct Card -->
      <div class="p-6 rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-slate-50 dark:via-slate-900 to-transparent border-emerald-500/20 shadow-sm">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
              <span>📱</span> Direct Customer M-Pesa STK Prompt
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-0">
              Sends an instant PIN prompt directly to the customer's Safaricom phone. Funds settle into Till #882941 in under 5 seconds.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Phone Number</label>
            <input
              v-model="quickStkPhone"
              type="text"
              placeholder="+254 712 345 678"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (KES)</label>
            <input
              v-model.number="quickStkAmount"
              type="number"
              min="1"
              placeholder="e.g. 3500"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="flex items-end">
            <button
              type="button"
              @click="handleSendQuickStk"
              class="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <span>⚡</span>
              <span>Send STK Prompt Now</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Live M-Pesa Feed Table -->
      <div class="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white m-0">
              Live Lipa na M-Pesa Receipts Stream
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
              Transactions verified via Safaricom Daraja C2B callback endpoint.
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Webhook Gateway Active
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                <th class="py-3 px-3">Receipt Code</th>
                <th class="py-3 px-3">Customer / Sender</th>
                <th class="py-3 px-3">Time</th>
                <th class="py-3 px-3 text-right">Amount (KES)</th>
                <th class="py-3 px-3">Linked Order</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              <tr v-for="(tx, idx) in mpesaTransactions" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {{ tx.code }}
                </td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ tx.sender }}</div>
                  <div class="text-[11px] text-slate-500 font-mono">{{ tx.phone }}</div>
                </td>
                <td class="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">{{ tx.time }}</td>
                <td class="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                  KES {{ Number(tx.amount).toLocaleString() }}
                </td>
                <td class="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {{ tx.orderRef }}
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span>✓</span> MATCHED
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <button
                    type="button"
                    @click="sendWhatsAppReceipt(tx)"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 flex items-center gap-1 mx-auto"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. ADVANCED (INSTITUTIONAL GATEWAY & SIMULATOR) VIEW                       -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-white m-0">Payment Processing & Gateway Simulator</h2>
          <p class="text-xs text-slate-400 mt-1 mb-0">Daraja C2B/B2C gateway endpoints, SSL handshake latency, and simulated callbacks.</p>
        </div>
      </div>

      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="12">
          <a-card title="Select Invoice to Pay" class="standard-card">
            <a-form layout="vertical">
              <a-form-item label="Invoice">
                <a-select v-model:value="selectedInvoiceId" placeholder="Select an invoice" show-search>
                  <a-select-option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
                    {{ invoice.invoiceNumber }} - {{ invoice.Customer?.name }} (KSh {{ invoice.amountDue }})
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card title="Gateway Carrier Method" class="standard-card">
            <a-radio-group v-model:value="paymentMethod" button-style="solid" class="w-full flex">
              <a-radio-button value="mpesa" class="flex-1 text-center">Safaricom M-Pesa</a-radio-button>
              <a-radio-button value="credit_card" class="flex-1 text-center">Card (Stripe)</a-radio-button>
            </a-radio-group>

            <a-button type="primary" :loading="processing" @click="processPayment" class="mt-6" block size="large">
              {{ processing ? 'Processing...' : 'Simulate Carrier Callback' }}
            </a-button>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Modals & Drawers -->
    <stk-push-modal
      :visible="stkModalVisible"
      :phone="activeStkPhone"
      :amount="activeStkAmount"
      account-reference="TILL-882941"
      @close="stkModalVisible = false"
      @success="onStkSuccess"
    />

    <unclaimed-mpesa-drawer
      :visible="unclaimedDrawerVisible"
      @close="unclaimedDrawerVisible = false"
      @matched="onUnclaimedMatched"
    />
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { isSimpleMode, isProMode } from '../services/cockpitMode';
import StkPushModal from '../components/StkPushModal.vue';
import UnclaimedMpesaDrawer from '../components/UnclaimedMpesaDrawer.vue';
import api from '../services/api';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'PaymentProcessing',
  components: {
    StkPushModal,
    UnclaimedMpesaDrawer
  },
  setup() {
    const stkModalVisible = ref(false);
    const unclaimedDrawerVisible = ref(false);
    const quickStkPhone = ref('+254 712 334 556');
    const quickStkAmount = ref(3500);
    const activeStkPhone = ref('+254 712 334 556');
    const activeStkAmount = ref(3500);

    const selectedInvoiceId = ref(null);
    const paymentMethod = ref('mpesa');
    const processing = ref(false);
    const invoices = ref([]);

    const mpesaTransactions = ref([
      { code: 'QKL98214M', sender: 'Kevin Ochieng', phone: '+254 712 334 556', time: 'Today 12:45 PM', amount: 3750, orderRef: 'LDH-8921-KE' },
      { code: 'QKL88102K', sender: 'Amina Wangari', phone: '+254 722 984 102', time: 'Today 11:15 AM', amount: 5050, orderRef: 'LDH-8920-KE' },
      { code: 'QKL77631P', sender: 'Brian Mutua', phone: '+254 733 112 450', time: 'Yesterday 04:30 PM', amount: 3200, orderRef: 'LDH-8919-KE' },
      { code: 'QKL66190X', sender: 'Faith Chebet', phone: '+254 701 556 778', time: 'Yesterday 02:10 PM', amount: 2050, orderRef: 'LDH-8918-KE' }
    ]);

    const openStkModal = () => {
      activeStkPhone.value = quickStkPhone.value;
      activeStkAmount.value = quickStkAmount.value;
      stkModalVisible.value = true;
    };

    const handleSendQuickStk = () => {
      openStkModal();
    };

    const openUnclaimedDrawer = () => {
      unclaimedDrawerVisible.value = true;
    };

    const onStkSuccess = (payload) => {
      message.success(`M-Pesa payment received! Receipt: ${payload?.receipt || 'VERIFIED'}`);
      mpesaTransactions.value.unshift({
        code: payload?.receipt || `QK${Math.floor(100000 + Math.random() * 900000)}X`,
        sender: 'Prompted Customer',
        phone: activeStkPhone.value,
        time: 'Just now',
        amount: activeStkAmount.value,
        orderRef: 'LDH-COUNTER'
      });
    };

    const onUnclaimedMatched = (item) => {
      message.success(`Payment ${item.code} linked to invoice! Ledger balanced.`);
    };

    const sendWhatsAppReceipt = (tx) => {
      const phone = (tx.phone || '').replace(/[^0-9]/g, '');
      const text = encodeURIComponent(
        `Hello ${tx.sender}! Thank you for your payment of KES ${Number(tx.amount).toLocaleString()} ` +
        `to Lipa na M-Pesa Till #882941 (Receipt: ${tx.code}). Your order ${tx.orderRef} is confirmed!`
      );
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices');
        invoices.value = res.data?.invoices || res.data || [];
      } catch (e) {
        console.warn('Invoices load warning', e);
      }
    };

    const processPayment = async () => {
      processing.value = true;
      setTimeout(() => {
        processing.value = false;
        message.success('Carrier callback simulated successfully.');
      }, 1000);
    };

    onMounted(() => {
      fetchInvoices();
    });

    return {
      isSimpleMode,
      isProMode,
      stkModalVisible,
      unclaimedDrawerVisible,
      quickStkPhone,
      quickStkAmount,
      activeStkPhone,
      activeStkAmount,
      selectedInvoiceId,
      paymentMethod,
      processing,
      invoices,
      mpesaTransactions,
      openStkModal,
      handleSendQuickStk,
      openUnclaimedDrawer,
      onStkSuccess,
      onUnclaimedMatched,
      sendWhatsAppReceipt,
      processPayment
    };
  }
});
</script>

<style scoped>
.standard-card {
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
}
</style>
