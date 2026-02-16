<template>
  <div class="invoice-detail-page">
    <a-page-header
      :title="`Invoice ${invoice?.invoiceNumber || ''}`"
      @back="() => $router.go(-1)"
    >
      <template #extra>
        <a-button @click="downloadPDF">
          <template #icon><download-outlined /></template>
          Download PDF
        </a-button>
        <a-button type="primary" :disabled="invoice?.status === 'paid'">
          Record Payment
        </a-button>
      </template>

      <a-descriptions size="small" :column="3">
        <a-descriptions-item label="Status">
          <a-tag :color="statusColor">{{ invoice?.status?.toUpperCase() }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Issue Date">{{ formatDate(invoice?.issueDate) }}</a-descriptions-item>
        <a-descriptions-item label="Due Date">{{ formatDate(invoice?.dueDate) }}</a-descriptions-item>
        <a-descriptions-item label="Customer">{{ invoice?.customer?.name }}</a-descriptions-item>
        <a-descriptions-item label="Plan">{{ invoice?.plan?.name }}</a-descriptions-item>
        <a-descriptions-item label="Reference ID">#{{ $route.params.id }}</a-descriptions-item>
      </a-descriptions>
    </a-page-header>

    <a-row :gutter="[24, 24]" class="mt-24">
      <!-- Breakdown and Summary -->
      <a-col :xs="24" :lg="16">
        <a-card title="Usage Drill-down" class="glass-card">
          <a-table 
            :columns="historyColumns" 
            :data-source="usageLogs" 
            :pagination="{ pageSize: 5 }"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'usageType'">
                <a-tag :color="getTypeColor(record.usageType)">{{ record.usageType.toUpperCase() }}</a-tag>
              </template>
              <template v-if="column.key === 'duration'">
                {{ record.duration }} {{ getUnit(record.usageType) }}
              </template>
            </template>
          </a-table>

          <a-divider>Pricing Tier Analysis</a-divider>
          <div class="tier-analysis p-16 bg-light rounded-8">
            <p class="text-xs font-bold text-secondary text-uppercase mb-12">How this was calculated</p>
             <div class="tier-item">
               <span class="label">Included Minutes ({{ invoice?.plan?.call_minutes }} min)</span>
               <a-progress :percent="100" size="small" status="success" />
             </div>
             <div class="tier-item mt-12">
               <span class="label">Overage Charges</span>
               <p class="text-sm font-semibold">Additional units billed at standard plan rates.</p>
             </div>
          </div>
        </a-card>
      </a-col>

      <!-- Financial Totals -->
      <a-col :xs="24" :lg="8">
        <a-card title="Total Summary" class="summary-card">
          <div class="total-breakdown">
            <div class="line">
              <span>Subtotal</span>
              <span>KSh {{ invoice?.breakdown?.subtotal.toLocaleString() }}</span>
            </div>
            <div class="line">
              <span>VAT (16%)</span>
              <span>KSh {{ invoice?.breakdown?.tax.toLocaleString() }}</span>
            </div>
            <a-divider />
            <div class="line grand-total">
              <span>Total Due</span>
              <span class="val">KSh {{ invoice?.breakdown?.total.toLocaleString() }}</span>
            </div>
          </div>
        </a-card>

        <a-card title="Quick Actions" class="mt-24">
          <a-button block class="mb-12">Send via WhatsApp</a-button>
          <a-button block>Resend Email</a-button>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { DownloadOutlined } from '@ant-design/icons-vue';
import api from '../services/api';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'InvoiceDetail',
  components: { DownloadOutlined },
  setup() {
    const route = useRoute();
    const invoice = ref(null);
    const usageLogs = ref([]);

    const fetchDetails = async () => {
      const id = route.params.id;
      try {
        const response = await api.getInvoiceById(id);
        invoice.value = response.data.data;
        usageLogs.value = invoice.value.usageLogs || [];
      } catch (err) {
        console.error(err);
      }
    };

    const historyColumns = [
      { title: 'Usage Type', key: 'usageType', dataIndex: 'usageType' },
      { title: 'Volume', key: 'duration', dataIndex: 'duration' },
      { title: 'Timestamp', key: 'timestamp', dataIndex: 'timestamp', customRender: ({ text }) => dayjs(text).format('DD/MM HH:mm') }
    ];

    const getTypeColor = (type) => {
      const colors = { call: 'blue', data: 'purple', sms: 'green' };
      return colors[type] || 'default';
    };

    const getUnit = (type) => {
      const units = { call: 'min', data: 'GB', sms: 'units' };
      return units[type] || '';
    };

    const formatDate = (d) => d ? dayjs(d).format('DD MMM YYYY') : '---';

    const statusColor = computed(() => {
      const colors = { pending: 'orange', paid: 'success', overdue: 'error' };
      return colors[invoice.value?.status] || 'default';
    });

    const downloadPDF = async () => {
      api.downloadInvoicePdf(route.params.id);
    };

    fetchDetails();

    return {
      invoice,
      usageLogs,
      historyColumns,
      getTypeColor,
      getUnit,
      formatDate,
      statusColor,
      downloadPDF
    };
  },
});
</script>

<style scoped>
.invoice-detail-page {
  max-width: 1300px;
  margin: 0 auto;
}

.glass-card {
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
}

.summary-card {
  box-shadow: var(--shadow-md);
  border-radius: 12px;
  border-top: 4px solid var(--primary-color);
}

.total-breakdown .line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.grand-total {
  font-weight: 800;
  color: #1e293b;
}

.grand-total .val {
  font-size: 24px;
  color: var(--primary-color);
}

.tier-item .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.mt-24 { margin-top: 24px; }
.mt-12 { margin-top: 12px; }
.mb-12 { margin-bottom: 12px; }
.p-16 { padding: 16px; }
.bg-light { background: #f8fafc; }
.rounded-8 { border-radius: 8px; }
</style>
