<template>
  <div class="usage-tracker-container">
    <a-typography-title :level="2" class="mb-6">Real-time Usage Tracking</a-typography-title>

    <a-row :gutter="[24, 24]">
      <!-- Usage Form -->
      <a-col :xs="24" :lg="8">
        <a-card title="Manual Usage Entry" class="standard-card">
          <a-form :model="newUsage" layout="vertical" @finish="addUsage">
            <a-form-item label="Target Customer" name="customerId" :rules="[{ required: true, message: 'Select a customer' }]">
              <a-select v-model:value="newUsage.customerId" placeholder="Select customer" show-search :filter-option="filterSelect">
                <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Activity Type" name="usageType">
              <a-radio-group v-model:value="newUsage.usageType" button-style="solid" class="w-full flex">
                <a-radio-button value="call" class="flex-1 text-center">CALL</a-radio-button>
                <a-radio-button value="data" class="flex-1 text-center">DATA</a-radio-button>
                <a-radio-button value="sms" class="flex-1 text-center">SMS</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <a-form-item :label="usageLabel" name="duration">
              <a-input-number v-model:value="newUsage.duration" :min="0" style="width: 100%;" size="large" />
            </a-form-item>

            <a-button type="primary" html-type="submit" :loading="addingUsage" block size="large">
              <template #icon><plus-outlined /></template>
              Log Activity
            </a-button>
          </a-form>
        </a-card>
      </a-col>

      <!-- Usage History -->
      <a-col :xs="24" :lg="16">
        <a-card class="standard-card">
          <template #title>
            <div class="flex justify-between items-center flex-wrap gap-4">
              <span>Activity History</span>
              <a-select
                v-model:value="selectedCustomerFilterId"
                placeholder="Filter by customer"
                allowClear
                class="w-full sm:w-64"
                show-search
                :filter-option="filterSelect"
              >
                <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }}
                </a-select-option>
              </a-select>
            </div>
          </template>

          <a-table 
            :columns="usageTableColumns" 
            :data-source="usageLogs" 
            :pagination="false" 
            :scroll="{ x: 'max-content' }"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'usageType'">
                <a-tag :color="getUsageColor(record.usageType)">{{ record.usageType.toUpperCase() }}</a-tag>
              </template>
              <template v-else-if="column.key === 'duration'">
                <span class="font-bold">{{ record.duration }}</span>
                <span class="text-xs text-slate-400 ml-1">{{ getUnit(record.usageType) }}</span>
              </template>
            </template>
          </a-table>

          <!-- Pagination Controls -->
          <div class="pagination-wrap mt-6">
            <a-button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              size="small"
            >
              <template #icon><left-outlined /></template>
              Prev
            </a-button>
            <span class="page-indicator">Page <strong>{{ currentPage }}</strong> of {{ totalPages || 1 }}</span>
            <a-button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages || totalPages === 0"
              size="small"
            >
              Next
              <template #icon><right-outlined /></template>
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import api from '../services/api';
import { PlusOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'UsageTracker',
  components: { PlusOutlined, LeftOutlined, RightOutlined },
  setup() {
    const usageLogs = ref([]);
    const customers = ref([]);
    const addingUsage = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalPages = ref(0);
    const selectedCustomerFilterId = ref(null);

    const newUsage = reactive({
      customerId: undefined,
      planId: undefined,
      usageType: 'data',
      duration: 0,
    });

    watch(() => newUsage.customerId, (newVal) => {
        const customer = customers.value.find(c => c.id === newVal);
        newUsage.planId = customer ? customer.Plan?.id : undefined;
    });

    const usageTableColumns = [
      { title: 'Customer', key: 'customerName', customRender: ({ record }) => record.Customer?.name || 'N/A' },
      { title: 'Type', key: 'usageType', width: 100 },
      { title: 'Amount', key: 'duration', width: 120 },
      { title: 'Logged At', key: 'timestamp', customRender: ({ record }) => new Date(record.timestamp).toLocaleString() },
    ];

    const usageLabel = computed(() => {
      const labels = { call: 'Duration (Minutes)', data: 'Usage (MB)', sms: 'Count (Units)' };
      return labels[newUsage.usageType];
    });

    const fetchUsage = async () => {
      try {
        let res;
        if (selectedCustomerFilterId.value) {
          res = await api.getUsageByCustomerId(selectedCustomerFilterId.value, currentPage.value, pageSize.value);
        } else {
          res = await api.getUsage(currentPage.value, pageSize.value);
        }
        usageLogs.value = res.data.usageLogs;
        totalPages.value = res.data.totalPages;
      } catch (error) {
        message.error('Failed to sync usage logs.');
      }
    };

    const fetchCustomers = async () => {
      const res = await api.getCustomers(1, 1000);
      customers.value = res.data.customers;
    };

    const addUsage = async () => {
      addingUsage.value = true;
      try {
        if (!newUsage.planId) {
            message.error('Selected customer does not have an active plan.');
            return;
        }
        await api.addUsage(newUsage);
        message.success('Activity logged successfully.');
        Object.assign(newUsage, { customerId: undefined, planId: undefined, duration: 0 });
        fetchUsage();
      } catch (error) {
        message.error('Failed to log activity.');
      } finally {
        addingUsage.value = false;
      }
    };

    const changePage = (p) => {
      currentPage.value = p;
      fetchUsage();
    };

    const getUsageColor = (type) => {
      const colors = { call: 'blue', data: 'purple', sms: 'green' };
      return colors[type] || 'default';
    };

    const getUnit = (type) => {
      const units = { call: 'min', data: 'MB', sms: 'msg' };
      return units[type] || '';
    };

    const filterSelect = (input, option) => 
      option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;

    watch(selectedCustomerFilterId, () => {
      currentPage.value = 1;
      fetchUsage();
    });

    onMounted(() => {
      fetchCustomers();
      fetchUsage();
    });

    return {
      usageLogs,
      customers,
      newUsage,
      addUsage,
      addingUsage,
      usageTableColumns,
      currentPage,
      totalPages,
      changePage,
      selectedCustomerFilterId,
      usageLabel,
      getUsageColor,
      getUnit,
      filterSelect
    };
  },
});
</script>

<style scoped>
.usage-tracker-container {
  max-width: 1400px;
  margin: 0 auto;
}

.standard-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.pagination-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-indicator {
  font-size: 13px;
  color: var(--text-secondary);
}

@media (max-width: 576px) {
  .pagination-wrap {
    flex-direction: column;
    text-align: center;
  }
}
</style>
