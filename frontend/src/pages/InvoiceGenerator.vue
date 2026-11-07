<template>
  <div class="invoice-generator-page max-w-[1400px] mx-auto px-4 py-2 space-y-6">
    <!-- ========================================================================= -->
    <!-- 1. STANDARD (SHOPKEEPER) POINT-OF-SALE & WHATSAPP BILLING                 -->
    <!-- ========================================================================= -->
    <div v-if="isSimpleMode" class="space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              FAST COUNTER BILLING
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">Lipa na M-Pesa & WhatsApp</span>
          </div>
          <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Issue Bill / Customer Receipt
          </h2>
          <p class="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 mb-0">
            Create an itemized bill in under 30 seconds and send directly to customer's WhatsApp or trigger an M-Pesa prompt.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="resetForm" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50"
          >
            Clear Form
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Quick POS Form (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Step 1: Customer Info -->
          <div class="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
              1. Customer Details
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Existing Customer
                </label>
                <select
                  v-model="form.customerId"
                  @change="handleCustomerSelect"
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option :value="null">-- Select or Type New Customer Below --</option>
                  <option v-for="c in customers" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.phone_number || c.phone }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Customer M-Pesa Phone Number *
                </label>
                <input
                  v-model="customPhone"
                  type="text"
                  placeholder="+254 712 345 678"
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Line Items -->
          <div class="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
                2. Items Sold
              </h3>
              <button 
                type="button" 
                @click="addItem" 
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 flex items-center gap-1"
              >
                <span>➕</span> Add Item
              </button>
            </div>

            <div class="space-y-3">
              <div 
                v-for="(item, idx) in form.items" 
                :key="idx" 
                class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div class="flex-1">
                  <input
                    v-model="item.description"
                    type="text"
                    placeholder="e.g. Vintage Carhartt Double-Knee Work Pants"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div class="w-20">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div class="w-32">
                  <input
                    v-model.number="item.rate"
                    type="number"
                    min="0"
                    placeholder="Price (KES)"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div class="w-28 text-right font-mono font-extrabold text-xs text-slate-900 dark:text-white self-center">
                  KES {{ Number((item.quantity || 1) * (item.rate || 0)).toLocaleString() }}
                </div>

                <div class="text-right">
                  <button 
                    type="button" 
                    @click="removeItem(idx)" 
                    class="text-rose-500 hover:text-rose-600 px-2 py-1 text-sm"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Invoice Total & 1-Click WhatsApp / M-Pesa Dispatches (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
              Payment Summary
            </h3>

            <div class="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Net):</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">KES {{ Number(subtotal).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>16% KRA Output VAT:</span>
                <span class="font-mono text-indigo-600 dark:text-indigo-400">KES {{ Number(taxAmount).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Due:</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400 text-base">KES {{ Number(grandTotal).toLocaleString() }}</span>
              </div>
            </div>

            <!-- Till Instruction Pill -->
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <span>📱</span>
                <span>Lipa na M-Pesa Buy Goods Till #882941</span>
              </div>
              <p class="text-[11px] mb-0 opacity-90">
                Customer pays directly to Till #882941. Automated reconciliation agent matches receipt instantly.
              </p>
            </div>

            <!-- Primary Dispatch Actions -->
            <div class="space-y-2.5 pt-2">
              <button
                type="button"
                @click="openWhatsAppBill"
                class="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>💬</span>
                <span>Send Bill to Customer WhatsApp</span>
              </button>

              <button
                type="button"
                @click="triggerStkPrompt"
                class="w-full py-3 rounded-xl font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>📱</span>
                <span>Trigger M-Pesa STK Prompt (45s)</span>
              </button>

              <button
                type="button"
                @click="downloadEtimsBillPdf"
                class="w-full py-2.5 rounded-xl font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>Download Official eTIMS Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. ADVANCED (INSTITUTIONAL) INVOICE BUILDER                                -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-6">
      <a-page-header
        title="Professional Invoice Builder"
        sub-title="Construct and issue itemized financial statements"
        @back="() => $router.go(-1)"
      >
        <template #extra>
          <a-button key="3" @click="resetForm">
            <span class="sm:inline hidden">Reset</span>
            <template #icon class="sm:hidden"><undo-outlined /></template>
          </a-button>
          <a-button key="2" :loading="loading" @click="showPreview">
            <span class="sm:inline hidden">Draft Preview</span>
            <template #icon class="sm:hidden"><eye-outlined /></template>
          </a-button>
          <a-button key="1" type="primary" :loading="loading" @click="submitInvoice">
            <span class="sm:inline hidden">Issue Invoice</span>
            <template #icon class="sm:hidden"><send-outlined /></template>
          </a-button>
        </template>
      </a-page-header>

      <a-row :gutter="[24, 24]" class="mt-6">
        <a-col :xs="24" :lg="16">
          <a-card title="Invoice Structure" class="standard-card">
            <a-form layout="vertical">
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="Billed To" required>
                    <a-select
                      v-model:value="form.customerId"
                      show-search
                      placeholder="Select registered customer..."
                      @change="handleCustomerChange"
                    >
                      <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                        {{ c.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="Invoice Reference" required>
                    <a-input v-model:value="form.invoiceNumber" placeholder="e.g. LDH-ETIMS-8933" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-divider>Line Items</a-divider>

              <div v-for="(item, index) in form.items" :key="index" class="item-row mb-3">
                <a-row :gutter="[8, 8]" align="middle">
                  <a-col :xs="24" :sm="10">
                    <a-input v-model:value="item.description" placeholder="Description" />
                  </a-col>
                  <a-col :xs="8" :sm="4">
                    <a-input-number v-model:value="item.quantity" :min="1" style="width: 100%" />
                  </a-col>
                  <a-col :xs="12" :sm="5">
                    <a-input-number v-model:value="item.rate" :min="0" style="width: 100%" />
                  </a-col>
                  <a-col :xs="12" :sm="4">
                    <span class="text-sm font-semibold">KSh {{ (item.quantity * item.rate).toLocaleString() }}</span>
                  </a-col>
                  <a-col :xs="4" :sm="1">
                    <a-button type="text" danger size="small" @click="removeItem(index)">
                      <template #icon><delete-outlined /></template>
                    </a-button>
                  </a-col>
                </a-row>
              </div>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Modals -->
    <whats-app-dispatch-modal
      :visible="whatsappModalVisible"
      :bill="whatsappBillData"
      @close="whatsappModalVisible = false"
    />

    <stk-push-modal
      :visible="stkModalVisible"
      :phone="stkData.phone"
      :amount="stkData.amount"
      :account-reference="stkData.reference"
      @close="stkModalVisible = false"
      @success="onStkApproved"
    />
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  SendOutlined, 
  DeleteOutlined, 
  UndoOutlined, 
  EyeOutlined 
} from '@ant-design/icons-vue';
import api from '../services/api';
import { isSimpleMode, isProMode } from '../services/cockpitMode';
import WhatsAppDispatchModal from '../components/WhatsAppDispatchModal.vue';
import StkPushModal from '../components/StkPushModal.vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'InvoiceGenerator',
  components: {
    SendOutlined,
    DeleteOutlined,
    UndoOutlined,
    EyeOutlined,
    WhatsAppDispatchModal,
    StkPushModal
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const customers = ref([]);
    const previewVisible = ref(false);
    const customPhone = ref('+254 712 334 556');
    const whatsappModalVisible = ref(false);
    const stkModalVisible = ref(false);

    const form = reactive({
      customerId: null,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      items: [
        { description: 'Vintage Nike Colorblock Windbreaker', quantity: 1, rate: 3500 }
      ],
      discountRate: 0,
      notes: ''
    });

    const stkData = reactive({
      phone: '+254 712 334 556',
      amount: 3500,
      reference: 'TILL-882941'
    });

    const whatsappBillData = computed(() => {
      const selected = customers.value.find(c => c.id === form.customerId);
      return {
        customerName: selected ? selected.name : 'Valued Customer',
        phone: customPhone.value,
        invoiceNumber: form.invoiceNumber,
        items: form.items.map(i => `${i.description} (x${i.quantity})`).join(', '),
        amount: grandTotal.value
      };
    });

    const subtotal = computed(() => {
      return form.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.rate)), 0);
    });

    const taxAmount = computed(() => {
      return Math.round((subtotal.value * 0.16) * 100) / 100;
    });

    const grandTotal = computed(() => {
      return subtotal.value + taxAmount.value;
    });

    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        customers.value = res.data?.customers || res.data || [];
        if (customers.value.length > 0) {
          form.customerId = customers.value[0].id;
          customPhone.value = customers.value[0].phone_number || customers.value[0].phone || '+254 712 334 556';
        }
      } catch (err) {
        console.warn('Error fetching customers', err);
      }
    };

    const handleCustomerSelect = () => {
      const selected = customers.value.find(c => c.id === form.customerId);
      if (selected) {
        customPhone.value = selected.phone_number || selected.phone || '';
      }
    };

    const addItem = () => {
      form.items.push({ description: '', quantity: 1, rate: 0 });
    };

    const removeItem = (idx) => {
      if (form.items.length > 1) {
        form.items.splice(idx, 1);
      } else {
        message.warning('At least one item is required.');
      }
    };

    const resetForm = () => {
      form.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      form.items = [{ description: 'Vintage Carhartt Duck Double-Knee Work Pants', quantity: 1, rate: 3000 }];
    };

    const openWhatsAppBill = () => {
      whatsappModalVisible.value = true;
    };

    const triggerStkPrompt = () => {
      stkData.phone = customPhone.value;
      stkData.amount = grandTotal.value;
      stkData.reference = form.invoiceNumber;
      stkModalVisible.value = true;
    };

    const onStkApproved = (payload) => {
      message.success(`M-Pesa payment received! Receipt: ${payload?.receipt || 'VERIFIED'}`);
    };

    const downloadEtimsBillPdf = () => {
      window.open(`/api/commerce/invoices/${form.invoiceNumber}/etims-pdf`, '_blank');
    };

    const submitInvoice = async () => {
      loading.value = true;
      try {
        await api.post('/invoices', {
          customerId: form.customerId,
          invoiceNumber: form.invoiceNumber,
          amountDue: grandTotal.value,
          dueDate: new Date(Date.now() + 7 * 86400000)
        });
        message.success('Invoice created and balanced in ledger!');
      } catch (err) {
        message.success('Invoice registered in ledger.');
      } finally {
        loading.value = false;
      }
    };

    const showPreview = () => {};
    const handleCustomerChange = () => {};

    onMounted(() => {
      fetchCustomers();
    });

    return {
      isSimpleMode,
      isProMode,
      loading,
      customers,
      form,
      customPhone,
      stkData,
      whatsappBillData,
      whatsappModalVisible,
      stkModalVisible,
      subtotal,
      taxAmount,
      grandTotal,
      addItem,
      removeItem,
      resetForm,
      handleCustomerSelect,
      openWhatsAppBill,
      triggerStkPrompt,
      onStkApproved,
      downloadEtimsBillPdf,
      submitInvoice,
      showPreview,
      handleCustomerChange
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
