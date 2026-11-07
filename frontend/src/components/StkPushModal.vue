<template>
  <a-modal
    :open="visible"
    title="Lipa na M-Pesa • Live STK Push"
    :footer="null"
    @cancel="handleClose"
    width="440px"
    class="stk-push-modal"
  >
    <div class="stk-push-body text-center font-sans py-2">
      <!-- 1. Pending Countdown State -->
      <template v-if="state === 'pending'">
        <div class="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
          <!-- Circular SVG Countdown Track -->
          <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              class="text-slate-200 dark:text-slate-800"
              stroke-width="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              class="text-emerald-500 transition-all duration-1000 ease-linear"
              stroke-width="6"
              :stroke-dasharray="276.46"
              :stroke-dashoffset="strokeOffset"
              stroke-linecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <!-- Vibrating Phone Icon inside Circle -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <niche-icon name="phone" :size="30" custom-class="text-emerald-500 animate-pulse" />
            <span class="text-xs font-mono font-black text-slate-800 dark:text-slate-100 mt-1">
              {{ countdown }}s
            </span>
          </div>
        </div>

        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
          Awaiting Customer's M-Pesa PIN
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
          STK push prompt sent to <strong class="font-mono text-emerald-600 dark:text-emerald-400">+254 {{ phone }}</strong> for <strong class="font-mono">KES {{ amount.toLocaleString() }}</strong>.
        </p>

        <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 mb-4 text-left">
          <div class="flex items-center gap-1.5 font-bold mb-0.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Daraja API Gateway: Live Polling</span>
          </div>
          <div>Prompting customer device... Check for Lipa na M-Pesa popup.</div>
        </div>

        <div class="flex items-center justify-center gap-2">
          <button 
            type="button" 
            @click="simulateSuccess" 
            class="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-200"
          >
            Simulate Customer Approved &check;
          </button>
          <button 
            type="button" 
            @click="handleClose" 
            class="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </template>

      <!-- 2. Verified Success State -->
      <template v-else-if="state === 'success'">
        <div class="w-16 h-16 mx-auto my-3 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl shadow-inner">
          &check;
        </div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
          M-Pesa Payment Confirmed!
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Funds verified and credited to Till #882941.
        </p>

        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left font-mono text-xs space-y-1 mb-4">
          <div class="flex justify-between">
            <span class="text-slate-400">RECEIPT:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ generatedReceipt }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">AMOUNT:</span>
            <span class="font-bold">KES {{ amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">CUSTOMER:</span>
            <span>+254 {{ phone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">LEDGER:</span>
            <span class="text-emerald-500 font-bold">BALANCED (0.00 VARIANCE)</span>
          </div>
        </div>

        <button 
          type="button" 
          @click="completeFlow" 
          class="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md"
        >
          Close & View Invoice
        </button>
      </template>

      <!-- 3. Timeout or Rejected State -->
      <template v-else-if="state === 'timeout'">
        <div class="w-16 h-16 mx-auto my-3 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl shadow-inner">
          &times;
        </div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
          PIN Entry Timed Out or Cancelled
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          The customer did not enter their M-Pesa PIN within 45 seconds or dismissed the prompt.
        </p>

        <div class="flex items-center justify-center gap-2">
          <button 
            type="button" 
            @click="restartStk" 
            class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
          >
            Retry STK Push
          </button>
          <button 
            type="button" 
            @click="handleClose" 
            class="px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
          >
            Dismiss
          </button>
        </div>
      </template>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, computed, watch, onUnmounted } from 'vue';
import NicheIcon from './NicheIcon.vue';

export default defineComponent({
  name: 'StkPushModal',
  components: {
    NicheIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      default: '712345678'
    },
    amount: {
      type: Number,
      default: 4500
    },
    invoiceId: {
      type: String,
      default: '1042'
    }
  },
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const state = ref('pending'); // 'pending' | 'success' | 'timeout'
    const countdown = ref(45);
    let timer = null;

    // Circumference of r=44 is 2 * PI * 44 ≈ 276.46
    const CIRCUMFERENCE = 2 * Math.PI * 44;
    const strokeOffset = computed(() => {
      const remainingRatio = countdown.value / 45;
      return CIRCUMFERENCE * (1 - remainingRatio);
    });

    const generatedReceipt = ref('QK' + Math.floor(10000000 + Math.random() * 90000000));

    const startTimer = () => {
      state.value = 'pending';
      countdown.value = 45;
      if (timer) clearInterval(timer);

      timer = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          clearInterval(timer);
          state.value = 'timeout';
        }
      }, 1000);
    };

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        startTimer();
      } else {
        if (timer) clearInterval(timer);
      }
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const simulateSuccess = () => {
      if (timer) clearInterval(timer);
      generatedReceipt.value = 'QK' + Math.floor(10000000 + Math.random() * 90000000);
      state.value = 'success';
    };

    const restartStk = () => {
      startTimer();
    };

    const handleClose = () => {
      if (timer) clearInterval(timer);
      emit('update:visible', false);
    };

    const completeFlow = () => {
      emit('success', {
        receipt: generatedReceipt.value,
        amount: props.amount,
        phone: props.phone,
        invoiceId: props.invoiceId
      });
      handleClose();
    };

    return {
      state,
      countdown,
      strokeOffset,
      generatedReceipt,
      simulateSuccess,
      restartStk,
      handleClose,
      completeFlow
    };
  }
});
</script>

<style scoped>
.stk-push-body {
  min-height: 220px;
}
</style>
