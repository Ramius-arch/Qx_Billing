<template>
  <div class="payment-processing-container">
    <a-typography-title :level="2" class="mb-6">Payment Processing</a-typography-title>

    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :lg="12">
        <a-card title="Select Invoice to Pay" class="standard-card">
          <a-form layout="vertical">
            <a-form-item label="Invoice">
              <a-select v-model:value="selectedInvoiceId" placeholder="Select an invoice" show-search :filter-option="filterInvoice">
                <a-select-option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
                  {{ invoice.invoiceNumber }} - {{ invoice.Customer?.name }} (KSh {{ invoice.amountDue }})
                </a-select-option>
              </a-select>
            </a-form-item>
            <div v-if="selectedInvoice" class="invoice-details mt-4 p-4 bg-slate-50 rounded-lg">
              <div class="detail-row">
                <span>Amount Due:</span>
                <span class="font-bold">KSh {{ selectedInvoice.amountDue.toLocaleString() }}</span>
              </div>
              <div class="detail-row mt-2">
                <span>Due Date:</span>
                <span>{{ formatDate(selectedInvoice.dueDate) }}</span>
              </div>
              <div class="detail-row mt-2">
                <span>Status:</span>
                <a-tag :color="getStatusColor(selectedInvoice.status)">{{ selectedInvoice.status.toUpperCase() }}</a-tag>
              </div>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="Payment Method" class="standard-card">
          <a-radio-group v-model:value="paymentMethod" button-style="solid" class="w-full flex">
            <a-radio-button value="credit_card" class="flex-1 text-center">Credit Card</a-radio-button>
            <a-radio-button value="paypal" class="flex-1 text-center">PayPal</a-radio-button>
            <a-radio-button value="mpesa" class="flex-1 text-center">M-Pesa</a-radio-button>
          </a-radio-group>

          <div class="payment-fields mt-6">
            <template v-if="paymentMethod === 'credit_card'">
              <a-form layout="vertical">
                <a-form-item label="Card Number">
                  <a-input v-model:value="creditCardDetails.cardNumber" placeholder="xxxx xxxx xxxx xxxx" />
                </a-form-item>
                <a-row :gutter="16">
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="Expiry Date">
                      <a-input v-model:value="creditCardDetails.expiryDate" placeholder="MM/YY" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="CVV">
                      <a-input v-model:value="creditCardDetails.cvv" placeholder="xxx" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="Card Holder Name">
                  <a-input v-model:value="creditCardDetails.cardHolderName" placeholder="Name on Card" />
                </a-form-item>
              </a-form>
            </template>

            <template v-if="paymentMethod === 'mpesa'">
              <div class="p-4 bg-green-50 rounded-lg text-green-800 text-sm">
                <p>A prompt will be sent to your registered M-Pesa number upon clicking "Pay Now".</p>
              </div>
            </template>

            <template v-if="paymentMethod === 'paypal'">
              <div class="p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
                <p>You will be redirected to PayPal to complete your transaction.</p>
              </div>
            </template>

            <a-button type="primary" :loading="processing" @click="processPayment" class="mt-6" :disabled="!selectedInvoiceId || processing" block size="large">
              {{ processing ? 'Processing Transaction...' : 'Confirm & Pay Now' }}
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:open="showStatusModal" :title="null" :footer="null" :closable="!processing">
      <a-result
        :status="paymentStatus.type"
        :title="paymentStatus.message"
        :sub-title="paymentStatus.subTitle"
      >
        <template #extra>
          <a-button v-if="paymentStatus.type === 'success'" type="primary" @click="closeStatus">Return to History</a-button>
          <a-button v-else type="primary" @click="showStatusModal = false">Try Again</a-button>
        </template>
      </a-result>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import api from '../services/api';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'PaymentProcessing',
  setup() {
    const isMobile = ref(window.innerWidth < 768);
    const updateMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };

    onMounted(() => {
      window.addEventListener('resize', updateMobile);
      fetchInvoices();
    });

    const selectedInvoiceId = ref(undefined);
    const paymentMethod = ref('credit_card');
    const processing = ref(false);
    const showStatusModal = ref(false);
    const paymentStatus = ref({ type: 'info', message: '', subTitle: '' });
    const invoices = ref([]);

    const creditCardDetails = reactive({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
    });

    const fetchInvoices = async () => {
      try {
        const response = await api.getInvoices(1, 1000);
        invoices.value = response.data.invoices || [];
      } catch (error) {
        message.error('Failed to load pending invoices.');
      }
    };

    const selectedInvoice = computed(() => {
      return invoices.value.find(inv => inv.id === selectedInvoiceId.value);
    });

    const processPayment = async () => {
      if (!selectedInvoiceId.value) return message.error('Please select an invoice.');

      processing.value = true;
      showStatusModal.value = true;
      paymentStatus.value = { type: 'info', message: 'Authorizing...', subTitle: 'Connecting to payment gateway' };

      try {
        const paymentData = {
          invoiceId: selectedInvoiceId.value,
          amount: selectedInvoice.value.amountDue,
          method: paymentMethod.value,
          details: paymentMethod.value === 'credit_card' ? creditCardDetails : {}
        };
        
        await api.createPayment(paymentData);
        
        paymentStatus.value = {
          type: 'success',
          message: 'Payment Confirmed',
          subTitle: `Transaction for #${selectedInvoice.value.invoiceNumber} was successful. Receipt has been emailed.`,
        };
        fetchInvoices(); // Refresh list
      } catch (error) {
        paymentStatus.value = {
          type: 'error',
          message: 'Transaction Declined',
          subTitle: error.response?.data?.error || 'Payment gateway returned an error. Please verify your details.',
        };
      } finally {
        processing.value = false;
      }
    };

    const filterInvoice = (input, option) => 
      option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;

    const getStatusColor = (status) => {
      const colors = { pending: 'orange', paid: 'success', overdue: 'error' };
      return colors[status] || 'default';
    };

    const formatDate = (date) => dayjs(date).format('DD MMM YYYY');

    const closeStatus = () => {
      showStatusModal.value = false;
      selectedInvoiceId.value = undefined;
    };

    return {
      selectedInvoiceId,
      paymentMethod,
      processing,
      showStatusModal,
      paymentStatus,
      invoices,
      creditCardDetails,
      selectedInvoice,
      processPayment,
      isMobile,
      filterInvoice,
      getStatusColor,
      formatDate,
      closeStatus
    };
  },
});
</script>

<style scoped>
.payment-processing-container {
  max-width: 1200px;
  margin: 0 auto;
}

.standard-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

@media (max-width: 480px) {
  .payment-processing-container {
    padding: 0;
  }
}
</style>
