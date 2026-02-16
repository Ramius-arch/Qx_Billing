<template>
  <div class="billing-engine-page">
    <a-row :gutter="[24, 24]">
      <!-- Control Panel -->
      <a-col :xs="24" :lg="8">
        <a-card title="Billing Control Center" class="control-card">
          <a-form layout="vertical">
            <a-form-item label="Target Customer">
              <a-select
                v-model:value="selectedCustomerId"
                show-search
                placeholder="Select a customer to sync"
                :filter-option="filterCustomer"
                @change="handleCustomerChange"
              >
                <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }} ({{ c.Plan ? c.Plan.name : 'No Plan' }})
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-alert
              v-if="!selectedCustomerId"
              message="Select a customer to initialize calculations"
              type="info"
              show-icon
              class="mb-24"
            />

            <div v-if="selectedCustomerId" class="actions-group">
              <a-button 
                type="primary" 
                block 
                size="large" 
                :loading="generating"
                @click="processBilling"
              >
                <template #icon><sync-outlined /></template>
                Finalize & Generate Invoice
              </a-button>
              
              <a-button block class="mt-12" @click="fetchForecast">
                <template #icon><line-chart-outlined /></template>
                Refresh Forecast
              </a-button>
            </div>
          </a-form>
        </a-card>

        <a-card title="Batch Operations" class="mt-24">
          <p class="text-secondary text-sm mb-16">Execute billing cycles for all active accounts in the current window.</p>
          <a-button block danger ghost @click="notImplemented">
            Run Global Batch Cycle
          </a-button>
        </a-card>
      </a-col>

      <!-- Intelligence / Forecast -->
      <a-col :xs="24" :lg="16">
        <a-spin :spinning="loadingForecast" tip="Projecting usage trends...">
          <a-card :bordered="false" class="forecast-card">
            <template #title>
              <div class="card-title-flex">
                <span>Real-time Billing Insights</span>
                <a-tag v-if="forecast" :color="forecast.projection.confidence === 'high' ? 'success' : 'processing'">
                  {{ forecast.projection.confidence.toUpperCase() }} CONFIDENCE
                </a-tag>
              </div>
            </template>

            <div v-if="forecast" class="forecast-content">
              <a-row :gutter="16">
                <!-- Current Usage Progress -->
                <a-col :span="12">
                   <div class="insight-item">
                     <span class="insight-label">Current Unbilled Usage</span>
                     <div class="usage-bars mt-12">
                       <div class="bar-group">
                         <span class="label">Calls ({{ forecast.currentUsage.call }} min)</span>
                         <a-progress :percent="calculatePercent(forecast.currentUsage.call, 500)" size="small" stroke-color="#1677ff" />
                       </div>
                       <div class="bar-group mt-8">
                         <span class="label">Data ({{ forecast.currentUsage.data }} GB)</span>
                         <a-progress :percent="calculatePercent(forecast.currentUsage.data, 50)" size="small" stroke-color="#6366f1" />
                       </div>
                       <div class="bar-group mt-8">
                         <span class="label">SMS ({{ forecast.currentUsage.sms }})</span>
                         <a-progress :percent="calculatePercent(forecast.currentUsage.sms, 200)" size="small" stroke-color="#10b981" />
                       </div>
                     </div>
                   </div>
                </a-col>

                <!-- Cost Projection -->
                <a-col :span="12">
                  <div class="projection-summary">
                    <span class="insight-label">EOM Projection</span>
                    <div class="projected-value mt-12">
                      <span class="currency">KSh</span>
                      <span class="amount">{{ forecast.projection.total.toLocaleString() }}</span>
                    </div>
                    <div class="cost-breakdown mt-16">
                      <div class="breakdown-row">
                        <span>Base Plan</span>
                        <span>KSh {{ forecast.currentCosts.basePrice }}</span>
                      </div>
                      <div class="breakdown-row">
                        <span>Usage Charges</span>
                        <span>KSh {{ forecast.currentCosts.usageCharges.toFixed(2) }}</span>
                      </div>
                      <div class="breakdown-row total-row">
                        <span>Projected Total (Incl. VAT)</span>
                        <span>KSh {{ forecast.projection.total.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>

            <a-empty v-else description="Select a customer to view billing intelligence" class="my-48" />
          </a-card>
        </a-spin>

        <!-- billing result -->
        <a-modal
          v-model:open="resultVisible"
          title="Billing Cycle Complete"
          @ok="resultVisible = false"
          width="600px"
        >
          <a-result
            status="success"
            title="Invoice Generated Successfully"
            :sub-title="`Invoice ${lastInvoice?.invoiceNumber} has been issued for KSh ${lastInvoice?.amountDue.toLocaleString()}`"
          >
            <template #extra>
              <a-button type="primary" @click="goToInvoice(lastInvoice.id)">View Detailed Invoice</a-button>
            </template>
            <div class="desc">
              <p>The billing engine has successfully:</p>
              <p><check-circle-outlined style="color: #52c41a" /> Aggregated all unbilled usage logs</p>
              <p><check-circle-outlined style="color: #52c41a" /> Calculated tiered pricing overages</p>
              <p><check-circle-outlined style="color: #52c41a" /> Applied 16% VAT compliance tax</p>
            </div>
          </a-result>
        </a-modal>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  SyncOutlined, 
  LineChartOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons-vue';
import api from '../services/api';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'BillingEngine',
  components: {
    SyncOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
  },
  setup() {
    const router = useRouter();
    const customers = ref([]);
    const selectedCustomerId = ref(null);
    const forecast = ref(null);
    const loadingForecast = ref(false);
    const generating = ref(false);
    const resultVisible = ref(false);
    const lastInvoice = ref(null);

    const fetchCustomers = async () => {
      const response = await api.getCustomers(1, 1000);
      customers.value = response.data.customers;
    };

    const handleCustomerChange = () => {
      fetchForecast();
    };

    const fetchForecast = async () => {
      if (!selectedCustomerId.value) return;
      loadingForecast.value = true;
      try {
        const response = await api.getBillingForecast(selectedCustomerId.value);
        forecast.value = response.data.data;
      } catch (error) {
        message.warning('Could not calculate forecast for this profile.');
        forecast.value = null;
      } finally {
        loadingForecast.value = false;
      }
    };

    const processBilling = async () => {
      generating.value = true;
      try {
        const response = await api.generateBill(selectedCustomerId.value);
        lastInvoice.value = response.data.data.invoice;
        resultVisible.value = true;
        fetchForecast(); // Refresh usage view
      } catch (error) {
        message.error('Billing generation failed.');
      } finally {
        generating.value = false;
      }
    };

    const calculatePercent = (val, max) => Math.min(100, Math.round((val / max) * 100));
    const filterCustomer = (input, option) => option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;
    const goToInvoice = (id) => router.push(`/invoices/${id}`);
    const notImplemented = () => message.info('Batch processing is scheduled for next release.');

    fetchCustomers();

    return {
      customers,
      selectedCustomerId,
      forecast,
      loadingForecast,
      generating,
      resultVisible,
      lastInvoice,
      handleCustomerChange,
      fetchForecast,
      processBilling,
      calculatePercent,
      filterCustomer,
      goToInvoice,
      notImplemented,
    };
  },
});
</script>

<style scoped>
.billing-engine-page {
  max-width: 1400px;
  margin: 0 auto;
}

.control-card {
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
}

.forecast-card {
  box-shadow: var(--shadow-md);
  border-radius: 12px;
  min-height: 480px;
}

.card-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usage-bars .label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}

.projected-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.projected-value .currency {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.projected-value .amount {
  font-size: 36px;
  font-weight: 800;
  color: var(--primary-color);
}

.cost-breakdown {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.total-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
  font-weight: 700;
  color: var(--text-primary);
}

.mb-24 { margin-bottom: 24px; }
.mt-12 { margin-top: 12px; }
.mt-24 { margin-top: 24px; }
.mt-16 { margin-top: 16px; }
.my-48 { margin-top: 48px; margin-bottom: 48px; }
</style>

