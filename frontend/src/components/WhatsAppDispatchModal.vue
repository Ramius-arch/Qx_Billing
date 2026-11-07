<template>
  <a-modal
    :open="visible"
    title="1-Click WhatsApp Invoice Dispatch"
    :footer="null"
    @cancel="handleClose"
    width="520px"
    class="whatsapp-modal"
  >
    <div class="whatsapp-dispatch-stage font-sans">
      <!-- Kenyan WhatsApp Header Banner -->
      <div class="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl shadow-md">
          <span>💬</span>
        </div>
        <div>
          <h4 class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Direct Customer Dispatch
          </h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-400">
            Send formal invoice details, M-Pesa Till/Paybill payment steps, and receipt link directly to your customer's WhatsApp.
          </p>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3 mb-4">
        <div>
          <label class="block text-[11px] font-mono font-bold text-slate-500 mb-1">
            CUSTOMER PHONE NUMBER (KENYA SAFARICOM / AIRTEL)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">+254</span>
            <input 
              v-model="phoneNumber" 
              type="tel" 
              placeholder="712345678" 
              class="w-full pl-14 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span class="text-[10px] text-slate-400">Format: 7XXXXXXXX or 1XXXXXXXX (without leading zero)</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-mono font-bold text-slate-500 mb-1">CUSTOMER NAME</label>
            <input 
              v-model="customerName" 
              type="text" 
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label class="block text-[11px] font-mono font-bold text-slate-500 mb-1">INVOICE AMOUNT</label>
            <input 
              v-model="invoiceAmount" 
              type="text" 
              class="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-mono font-bold text-slate-500 mb-1">M-PESA PAYMENT INSTRUCTIONS</label>
          <select 
            v-model="paymentMethod" 
            class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
          >
            <option value="buygoods">Lipa na M-Pesa • Buy Goods Till: 882941 (Ladha Store)</option>
            <option value="paybill">Lipa na M-Pesa • Paybill: 400200 | Acc: INV-{{ invoiceNumber }}</option>
            <option value="bank">Direct Bank Transfer / PesaLink: NCBA Bank</option>
          </select>
        </div>

        <!-- Live Message Preview Box -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-[11px] font-mono font-bold text-slate-500">LIVE MESSAGE PREVIEW</label>
            <button type="button" @click="copyMessageText" class="text-[10px] text-indigo-500 hover:underline">
              {{ copied ? '✓ Copied' : 'Copy Text' }}
            </button>
          </div>
          <div class="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-line text-slate-800 dark:text-slate-200 max-h-40 overflow-y-auto">
            {{ generatedMessage }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <button 
          type="button" 
          @click="handleClose" 
          class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          Cancel
        </button>
        <button 
          type="button" 
          @click="launchWhatsApp" 
          class="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <span>Open in WhatsApp</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'WhatsAppDispatchModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    invoice: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'dispatched'],
  setup(props, { emit }) {
    const phoneNumber = ref(props.invoice.customerPhone || '712345678');
    const customerName = ref(props.invoice.customerName || 'John Mwangi');
    const invoiceAmount = ref(props.invoice.amount ? `KES ${props.invoice.amount.toLocaleString()}` : 'KES 4,500');
    const invoiceNumber = ref(props.invoice.id || '1042');
    const paymentMethod = ref('buygoods');
    const copied = ref(false);

    const generatedMessage = computed(() => {
      let paymentText = '';
      if (paymentMethod.value === 'buygoods') {
        paymentText = `1. Go to Lipa na M-Pesa\n2. Select Buy Goods and Services\n3. Till Number: 882941 (Ladha Store)\n4. Amount: ${invoiceAmount.value}`;
      } else if (paymentMethod.value === 'paybill') {
        paymentText = `1. Go to Lipa na M-Pesa\n2. Select Paybill\n3. Business No: 400200\n4. Account No: INV-${invoiceNumber.value}\n5. Amount: ${invoiceAmount.value}`;
      } else {
        paymentText = `Bank: NCBA Bank\nBranch: Upper Hill\nAccount: 1002938472\nRef: INV-${invoiceNumber.value}`;
      }

      return `Habari ${customerName.value},\n\nHere is your official invoice #${invoiceNumber.value} for ${invoiceAmount.value}.\n\n*Payment Steps:*\n${paymentText}\n\nView or download your audited tax invoice here:\nhttps://qx-billing-client.netlify.app/invoices/${invoiceNumber.value}\n\nThank you for choosing Ladha. Feel free to reply here once payment is sent!`;
    });

    const handleClose = () => {
      emit('update:visible', false);
    };

    const copyMessageText = async () => {
      try {
        await navigator.clipboard.writeText(generatedMessage.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      } catch (e) {
        // ignore
      }
    };

    const launchWhatsApp = () => {
      // Clean phone number (strip spaces, leading 0, plus)
      let cleanPhone = phoneNumber.value.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.slice(1);
      } else if (!cleanPhone.startsWith('254')) {
        cleanPhone = '254' + cleanPhone;
      }

      const encodedText = encodeURIComponent(generatedMessage.value);
      const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      window.open(url, '_blank');
      emit('dispatched', { phone: cleanPhone, invoiceId: invoiceNumber.value });
      handleClose();
    };

    return {
      phoneNumber,
      customerName,
      invoiceAmount,
      invoiceNumber,
      paymentMethod,
      copied,
      generatedMessage,
      handleClose,
      copyMessageText,
      launchWhatsApp
    };
  }
});
</script>

<style scoped>
.whatsapp-dispatch-stage {
  padding-top: 4px;
}
</style>
