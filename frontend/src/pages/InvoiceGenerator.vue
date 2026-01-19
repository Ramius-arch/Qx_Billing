<template>
  <div class="invoice-generator-container">
    <a-typography-title :level="2">Invoice Generator</a-typography-title>

    <a-form :model="invoiceForm" layout="vertical" @finish="saveInvoice">
      <a-card title="Invoice Details" style="margin-bottom: 24px;">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Customer" name="customerId" :rules="[{ required: true, message: 'Please select a customer!' }]">
              <a-select
                v-model:value="invoiceForm.customerId"
                placeholder="Select a customer"
                show-search
                :filter-option="filterOption"
              >
                <a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Invoice Number" name="invoiceNumber" :rules="[{ required: true, message: 'Please enter invoice number!' }]">
              <a-input v-model:value="invoiceForm.invoiceNumber" placeholder="e.g., INV-2023-001" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Issue Date" name="issueDate" :rules="[{ required: true, message: 'Please select issue date!' }]">
              <a-date-picker v-model:value="invoiceForm.issueDate" style="width: 100%;" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Due Date" name="dueDate" :rules="[{ required: true, message: 'Please select due date!' }]">
              <a-date-picker v-model:value="invoiceForm.dueDate" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="Status" name="status">
          <a-select v-model:value="invoiceForm.status" placeholder="Select status">
            <a-select-option value="pending">Pending</a-select-option>
            <a-select-option value="paid">Paid</a-select-option>
            <a-select-option value="overdue">Overdue</a-select-option>
            <a-select-option value="cancelled">Cancelled</a-select-option>
          </a-select>
        </a-form-item>
      </a-card>

      <a-card title="Line Items" style="margin-bottom: 24px;">
        <a-table :columns="itemColumns" :data-source="invoiceForm.lineItems" :pagination="false" :scroll="{ x: 1000 }">
          <template #bodyCell="{ column, index, record }">
            <template v-if="column.dataIndex === 'description'">
              <a-input v-model:value="record.description" />
            </template>
            <template v-else-if="column.dataIndex === 'quantity'">
              <a-input-number v-model:value="record.quantity" :min="1" />
            </template>
            <template v-else-if="column.dataIndex === 'unitPrice'">
              <a-input-number v-model:value="record.unitPrice" :min="0" :step="0.01" />
            </template>
            <template v-else-if="column.dataIndex === 'total'">
              {{ (record.quantity * record.unitPrice).toFixed(2) }}
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <a-popconfirm
                v-if="invoiceForm.lineItems.length > 1"
                title="Sure to delete?"
                @confirm="removeItem(index)"
              >
                <a>Delete</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
        <a-button type="dashed" style="margin-top: 16px; width: 100%;" @click="addItem">
          <template #icon><PlusOutlined /></template>
          Add Item
        </a-button>
      </a-card>

      <a-card title="Summary" style="margin-bottom: 24px;">
        <a-row justify="end">
          <a-col :span="8" style="text-align: right;">Subtotal:</a-col>
          <a-col :span="8" style="text-align: right;">KSh {{ subtotal.toFixed(2) }}</a-col>
        </a-row>
        <a-row justify="end">
          <a-col :span="8" style="text-align: right;">
            <a-form-item label="Discount (%)" name="discountRate">
              <a-input-number v-model:value="invoiceForm.discountRate" :min="0" :max="100" />
            </a-form-item>
          </a-col>
          <a-col :span="8" style="text-align: right;">KSh {{ discountAmount.toFixed(2) }}</a-col>
        </a-row>
        <a-row justify="end">
          <a-col :span="8" style="text-align: right;">
            <a-form-item label="Tax Rate (%)" name="taxRate">
              <a-input-number v-model:value="invoiceForm.taxRate" :min="0" :max="100" />
            </a-form-item>
          </a-col>
          <a-col :span="8" style="text-align: right;">KSh {{ taxAmount.toFixed(2) }}</a-col>
        </a-row>
        <a-row justify="end" style="font-weight: bold;">
          <a-col :span="8" style="text-align: right;">Grand Total:</a-col>
          <a-col :span="8" style="text-align: right;">KSh {{ grandTotal.toFixed(2) }}</a-col>
        </a-row>
      </a-card>

      <a-form-item>
        <a-button type="primary" html-type="submit">Save Invoice</a-button>
        <a-button style="margin-left: 8px;">Preview</a-button>
        <a-button style="margin-left: 8px;">Send Invoice</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { defineComponent, reactive, computed, ref } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs'; // Import dayjs
import { message } from 'ant-design-vue'; // Import message

export default defineComponent({
  components: {
    PlusOutlined,
  },
  setup() {
    const invoiceForm = reactive({
      customerId: undefined,
      invoiceNumber: '',
      issueDate: dayjs(), // Default to today
      dueDate: dayjs().add(7, 'day'), // Default to 7 days from now
      status: 'pending',
      lineItems: [
        { description: '', quantity: 1, unitPrice: 0 },
      ],
      discountRate: 0,
      taxRate: 0,
    });

    const customers = ref([ // Dummy customer data
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);

    const itemColumns = [
      { title: 'Description', dataIndex: 'description', key: 'description' },
      { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: '15%' },
      { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', width: '15%' },
      { title: 'Total', dataIndex: 'total', key: 'total', width: '15%' },
      { title: 'Action', dataIndex: 'action', key: 'action', width: '10%' },
    ];

    const subtotal = computed(() => {
      return invoiceForm.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    });

    const discountAmount = computed(() => {
      return subtotal.value * (invoiceForm.discountRate / 100);
    });

    const taxAmount = computed(() => {
      return (subtotal.value - discountAmount.value) * (invoiceForm.taxRate / 100);
    });

    const grandTotal = computed(() => {
      return subtotal.value - discountAmount.value + taxAmount.value;
    });

    const addItem = () => {
      invoiceForm.lineItems.push({ description: '', quantity: 1, unitPrice: 0 });
    };

    const removeItem = (index) => {
      invoiceForm.lineItems.splice(index, 1);
    };

    const saveInvoice = (values) => {
      console.log('Invoice saved:', { ...values, grandTotal: grandTotal.value });
      // Simulate API call
      setTimeout(() => {
        const success = Math.random() > 0.5; // Simulate 50% success rate
        if (success) {
          message.success('Invoice saved successfully!');
        } else {
          message.error('Failed to save invoice. Please try again.');
        }
      }, 1000);
    };

    const filterOption = (input, option) => {
      return option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    return {
      invoiceForm,
      customers,
      itemColumns,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      addItem,
      removeItem,
      saveInvoice,
      filterOption,
    };
  },
});
</script>

<style scoped>
/* Add any specific styles for InvoiceGenerator here */
</style>