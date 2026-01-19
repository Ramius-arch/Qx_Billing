<template>
  <div class="usage-tracker-container">
    <a-typography-title :level="2">Usage Tracking</a-typography-title>

    <!-- Usage Form -->
    <a-card title="New Usage Log" style="margin-bottom: 24px;">
      <a-form :model="newUsage" layout="vertical" @finish="addUsage">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Customer:" name="customerId" :rules="[{ required: true, message: 'Please select a customer!' }]">
              <a-select v-model:value="newUsage.customerId" placeholder="Select a customer">
                <a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Plan:" name="planId" :rules="[{ required: true, message: 'Please select a plan!' }]">
              <a-select v-model:value="newUsage.planId" placeholder="Select a plan">
                <a-select-option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Usage Type:" name="usageType" :rules="[{ required: true, message: 'Please select usage type!' }]">
              <a-select v-model:value="newUsage.usageType" placeholder="Select usage type">
                <a-select-option value="call">Call</a-select-option>
                <a-select-option value="data">Data</a-select-option>
                <a-select-option value="sms">SMS</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Duration/Count (minutes/MB/SMS):" name="duration" :rules="[{ required: true, message: 'Please input duration/count!' }]">
              <a-input-number v-model:value="newUsage.duration" :min="0" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="addingUsage">Add Usage</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- Filter and Usage Table -->
    <a-card title="Usage History" style="margin-bottom: 24px;">
      <div style="margin-bottom: 16px;">
        <a-select
          v-model:value="selectedCustomerFilterId"
          placeholder="Filter by customer"
          allowClear
          style="width: 200px"
        >
          <a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </a-select-option>
        </a-select>
      </div>

      <a-table :columns="usageTableColumns" :data-source="usageLogs" :pagination="false" :scroll="{ x: 800 }">
      </a-table>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center mt-4">
        <a-button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </a-button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <a-button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import api from '../services/api';

export default defineComponent({
  name: 'UsageTracker',
  setup() {
    const usageLogs = ref([]);
    const customers = ref([]);
    const plans = ref([]); // To get plan names
    const addingUsage = ref(false); // Loading state for add usage button

    // Pagination state
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    const totalPages = ref(0);

    // Filtering state
    const selectedCustomerFilterId = ref(null);

    const newUsage = reactive({
      customerId: undefined,
      planId: undefined, // Add planId for new usage
      usageType: 'data', // Default usage type
      duration: 0,
    });

    const usageTableColumns = [
      { title: 'Customer', dataIndex: 'Customer', key: 'customerName', customRender: ({ record }) => record.Customer ? record.Customer.name : 'N/A' },
      { title: 'Plan', dataIndex: 'Plan', key: 'planName', customRender: ({ record }) => record.Plan ? record.Plan.name : 'N/A' },
      { title: 'Usage Type', dataIndex: 'usageType', key: 'usageType' },
      { title: 'Duration', dataIndex: 'duration', key: 'duration' },
      { title: 'Date', dataIndex: 'timestamp', key: 'timestamp', customRender: ({ record }) => new Date(record.timestamp).toLocaleDateString() },
    ];

    const fetchUsage = async () => {
      try {
        let response;
        if (selectedCustomerFilterId.value) {
          // Assuming an API endpoint for fetching usage by customer with pagination
          response = await api.getUsageByCustomerId(selectedCustomerFilterId.value, currentPage.value, pageSize.value);
        } else {
          // Fetch all usage with pagination
          response = await api.getUsage(currentPage.value, pageSize.value);
        }
        usageLogs.value = response.data.usageLogs; // Adjusted to backend response structure
        totalItems.value = response.data.totalItems;
        totalPages.value = response.data.totalPages;
      } catch (error) {
        console.error('Error fetching usage logs:', error);
        message.error('Failed to fetch usage logs.');
      }
    };

    const fetchCustomers = async () => {
      try {
        // Fetch all customers (not paginated here as it's for a dropdown)
        // If there are many customers, this would also need pagination/search
        const response = await api.getCustomers(1, 9999); // Fetch a large number, or implement search in dropdown
        customers.value = response.data.customers;
      } catch (error) {
        console.error('Error fetching customers:', error);
        message.error('Failed to fetch customers data.');
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await api.getPlans();
        plans.value = response.data;
      } catch (error) {
        console.error('Error fetching plans:', error);
        message.error('Failed to fetch plans data.');
      }
    };

    const addUsage = async () => {
      addingUsage.value = true;
      try {
        await api.addUsage(newUsage);
        message.success('Usage log added successfully!');
        // Reset form
        newUsage.customerId = undefined;
        newUsage.planId = undefined;
        newUsage.usageType = 'data';
        newUsage.duration = 0;
        fetchUsage(); // Refresh list based on current filter/pagination
      } catch (error) {
        console.error('Error adding usage log:', error);
        message.error('Failed to add usage log.');
      } finally {
        addingUsage.value = false;
      }
    };

    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchUsage();
      }
    };

    // Watch for changes in selectedCustomerFilterId to re-fetch usage
    watch(selectedCustomerFilterId, () => {
      currentPage.value = 1; // Reset to first page on filter change
      fetchUsage();
    });

    // Fetch data on component mount
    onMounted(() => {
      fetchCustomers();
      fetchPlans();
      fetchUsage();
    });

    return {
      usageLogs,
      customers,
      plans,
      newUsage,
      addUsage,
      addingUsage,
      usageTableColumns,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      changePage,
      selectedCustomerFilterId,
    };
  },
});
</script>

<style scoped>
.usage-tracker-container {
  padding: 24px;
}
</style>