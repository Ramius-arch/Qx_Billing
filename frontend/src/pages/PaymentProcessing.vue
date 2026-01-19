<template>
  <div class="payment-processing-container">
    <a-typography-title :level="2">Payment Processing</a-typography-title>

    <a-card title="Select Invoice to Pay" style="max-width: 600px; width: 90%; margin: 0 auto 24px auto;">
      <a-form layout="vertical">
        <a-form-item label="Invoice">
          <a-select v-model:value="selectedInvoiceId" placeholder="Select an invoice">
            <a-select-option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
              {{ invoice.invoiceNumber }} - {{ invoice.customerName }} (KSh {{ invoice.amountDue }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <div v-if="selectedInvoice">
          <p><strong>Amount Due:</strong> KSh {{ selectedInvoice.amountDue }}</p>
          <p><strong>Due Date:</strong> {{ selectedInvoice.dueDate }}</p>
          <p><strong>Status:</strong> <a-tag :color="selectedInvoice.status === 'overdue' ? 'red' : 'blue'">{{ selectedInvoice.status }}</a-tag></p>
        </div>
      </a-form>
    </a-card>

    <a-card title="Payment Method" style="max-width: 600px; width: 90%; margin: 0 auto 24px auto;">
      <a-radio-group v-model:value="paymentMethod" button-style="solid">
        <a-radio-button value="credit_card">Credit Card</a-radio-button>
        <a-radio-button value="paypal">PayPal</a-radio-button>
        <a-radio-button value="mpesa">M-Pesa</a-radio-button>
      </a-radio-group>

      <a-form v-if="paymentMethod === 'credit_card'" layout="vertical" style="margin-top: 24px;">
        <a-form-item label="Card Number">
          <a-input v-model:value="creditCardDetails.cardNumber" placeholder="xxxx xxxx xxxx xxxx" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Expiry Date">
              <a-input v-model:value="creditCardDetails.expiryDate" placeholder="MM/YY" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="CVV">
              <a-input v-model:value="creditCardDetails.cvv" placeholder="xxx" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="Card Holder Name">
          <a-input v-model:value="creditCardDetails.cardHolderName" placeholder="Name on Card" />
        </a-form-item>
      </a-form>

      <a-button type="primary" :loading="processing" @click="processPayment" style="margin-top: 24px;" :disabled="!selectedInvoiceId || processing">
        {{ processing ? 'Processing...' : 'Pay Now' }}
      </a-button>
    </a-card>

    <a-card v-if="paymentStatus" title="Payment Status" style="max-width: 600px; width: 90%; margin: 0 auto;">
      <a-result
        :status="paymentStatus.type"
        :title="paymentStatus.message"
        :sub-title="paymentStatus.subTitle"
      >
        <template #extra v-if="paymentStatus.type === 'error'">
          <a-button type="primary" @click="retryPayment">Retry</a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, computed, reactive } from 'vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'PaymentProcessing',
  setup() {
    const selectedInvoiceId = ref(undefined);
    const paymentMethod = ref('credit_card');
    const processing = ref(false);
    const paymentStatus = ref(null); // { type: 'success'|'error'|'info', message: '', subTitle: '' }

    const invoices = ref([ // Dummy invoice data
      { id: 1, invoiceNumber: 'INV-001', customerName: 'John Doe', amountDue: 100.00, dueDate: '2026-01-15', status: 'pending' },
      { id: 2, invoiceNumber: 'INV-002', customerName: 'Jane Smith', amountDue: 250.50, dueDate: '2026-01-20', status: 'pending' },
      { id: 3, invoiceNumber: 'INV-003', customerName: 'Alice Johnson', amountDue: 50.00, dueDate: '2026-01-10', status: 'overdue' },
    ]);

    const creditCardDetails = reactive({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
    });

    const selectedInvoice = computed(() => {
      return invoices.value.find(inv => inv.id === selectedInvoiceId.value);
    });

    const processPayment = () => {
      if (!selectedInvoiceId.value) {
        message.error('Please select an invoice to pay.');
        return;
      }

      processing.value = true;
      paymentStatus.value = null;

      // Simulate API call
      setTimeout(() => {
        processing.value = false;
        const success = Math.random() > 0.3; // Simulate 70% success rate

        if (success) {
          paymentStatus.value = {
            type: 'success',
            message: 'Payment Successful!',
            subTitle: `Your payment for Invoice #${selectedInvoice.value.invoiceNumber} has been processed.`,
          };
          message.success('Payment successful!');
          // In a real app, you would update invoice status, etc.
        } else {
          paymentStatus.value = {
            type: 'error',
            message: 'Payment Failed!',
            subTitle: 'There was an issue processing your payment. Please try again or use a different method.',
          };
          message.error('Payment failed. Please try again.');
        }
      }, 2000);
    };

    const retryPayment = () => {
      paymentStatus.value = null;
      processPayment();
    };

    return {
      selectedInvoiceId,
      paymentMethod,
      processing,
      paymentStatus,
      invoices,
      creditCardDetails,
      selectedInvoice,
      processPayment,
      retryPayment,
    };
  },
});
</script>

<style scoped>
/* Add any specific styles for PaymentProcessing here */
</style>