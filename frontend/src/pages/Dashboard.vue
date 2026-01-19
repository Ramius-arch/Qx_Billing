<template>
  <a-spin :spinning="loading" size="large" tip="Loading Dashboard Data...">
    <div class="dashboard-container">
      <a-typography-title :level="2">Telecom Billing Dashboard</a-typography-title>

      <!-- Overview Cards -->
      <a-row :gutter="[16, 16]" style="margin-bottom: 24px;">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Total Revenue" :value="dashboardData.totalRevenue" prefix="KSh" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Active Customers" :value="dashboardData.activeCustomers" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Total Data Usage (GB)" :value="dashboardData.totalDataUsage" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Total Call Duration (Hours)" :value="dashboardData.totalCallDuration" />
          </a-card>
        </a-col>
      </a-row>

      <!-- Quick Actions -->
      <a-card title="Quick Actions" style="margin-bottom: 24px;">
        <a-space>
          <a-button type="primary" @click="goToCreateInvoice">Create Invoice</a-button>
          <a-button @click="goToViewPayments">View Payments</a-button>
          <a-button @click="goToCustomers">Manage Customers</a-button>
        </a-space>
      </a-card>

      <a-row :gutter="[16, 16]">
        <!-- Recent Transactions -->
        <a-col :xs="24" :lg="12">
          <a-card title="Recent Transactions">
            <a-list item-layout="horizontal" :data-source="dashboardData.recentTransactions">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :description="item.description">
                    <template #title>
                      <a>{{ item.status }}</a>
                    </template>
                  </a-list-item-meta>
                  <div>{{ item.date }}</div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>

        <!-- Upcoming Due Dates (Example Data) -->
        <a-col :xs="24" :lg="12">
          <a-card title="Upcoming Due Dates">
            <a-list item-layout="horizontal" :data-source="upcomingDueDates">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :description="`Invoice #${item.invoiceNumber}`">
                    <template #title>
                      <a-tag :color="item.status === 'overdue' ? 'red' : 'blue'">{{ item.status }}</a-tag>
                      {{ item.customerName }}
                    </template>
                  </a-list-item-meta>
                  <div>Due: {{ item.dueDate }}</div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { message } from 'ant-design-vue'; // Import message

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const router = useRouter();
    const loading = ref(true); // Add loading state
    const dashboardData = ref({
      totalRevenue: 0,
      activeCustomers: 0,
      totalDataUsage: 0,
      totalCallDuration: 0,
      recentTransactions: [],
    });

    const upcomingDueDates = ref([ // Example static data for now
      { id: 1, invoiceNumber: 'INV-003', customerName: 'Alice Johnson', dueDate: '2026-01-15', status: 'pending' },
      { id: 2, invoiceNumber: 'INV-004', customerName: 'Bob Williams', dueDate: '2026-01-20', status: 'pending' },
      { id: 3, invoiceNumber: 'INV-001', customerName: 'John Doe', dueDate: '2026-01-05', status: 'overdue' },
    ]);

    const fetchDashboardData = async () => {
      loading.value = true; // Set loading to true
      try {
        // Assuming your API has an endpoint for dashboard data
        const response = await api.getDashboardData();
        dashboardData.value = response.data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        message.error('Failed to load dashboard data.'); // Show error message
        // Fallback to dummy data if API fails
        dashboardData.value = {
          totalRevenue: 125000,
          activeCustomers: 1200,
          totalDataUsage: 5000, // GB
          totalCallDuration: 2500, // Hours
          recentTransactions: [
            { id: 1, description: 'Payment from John Doe', date: '2026-01-08', status: 'Completed' },
            { id: 2, description: 'Invoice #INV-002 sent to Jane Smith', date: '2026-01-07', status: 'Pending' },
            { id: 3, description: 'New customer registration: Alice Johnson', date: '2026-01-06', status: 'Completed' },
          ],
        };
      } finally {
        loading.value = false; // Set loading to false
      }
    };

    const goToCreateInvoice = () => {
      router.push('/invoice-generator');
    };

    const goToViewPayments = () => {
      router.push('/payment-processing');
    };

    const goToCustomers = () => {
      router.push('/customers');
    };

    // Fetch data on component mount
    fetchDashboardData();

    return {
      dashboardData,
      upcomingDueDates,
      goToCreateInvoice,
      goToViewPayments,
      goToCustomers,
      loading, // Return loading state
    };
  },
});
</script>