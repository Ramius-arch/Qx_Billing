<template>
  <div class="reports-analytics-container">
    <a-typography-title :level="2">Reports and Analytics</a-typography-title>

    <a-row :gutter="[16, 16]" style="margin-bottom: 24px;">
      <a-col :xs="24" :lg="12">
        <a-card title="Revenue Trends">
          <Bar :data="revenueChartData" :options="chartOptions" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="Customer Payment Status">
          <Pie :data="paymentStatusChartData" :options="chartOptions" />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="Outstanding Invoices Summary" style="margin-bottom: 24px;">
      <a-table :columns="outstandingInvoicesColumns" :data-source="outstandingInvoices" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'overdue' ? 'red' : 'orange'">
              {{ record.status.toUpperCase() }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card title="All Customers Report">
      <a-table :columns="allCustomersColumns" :data-source="allCustomers" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a>View Details</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { Bar, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import api from '../services/api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default defineComponent({
  name: 'ReportsAnalytics',
  components: {
    Bar,
    Pie,
  },
  setup() {
    const revenueChartData = reactive({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue (KSh)',
          backgroundColor: '#1890ff',
          data: [40000, 20000, 120000, 39000, 100000, 80000],
        },
      ],
    });

    const paymentStatusChartData = reactive({
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          backgroundColor: ['#52c41a', '#1890ff', '#f5222d'],
          data: [70, 20, 10], // Percentage
        },
      ],
    });

    const chartOptions = reactive({
      responsive: true,
      maintainAspectRatio: false,
    });

    const outstandingInvoicesColumns = [
      { title: 'Invoice ID', dataIndex: 'invoiceId', key: 'invoiceId' },
      { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
      { title: 'Amount Due', dataIndex: 'amountDue', key: 'amountDue' },
      { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
      { title: 'Status', dataIndex: 'status', key: 'status' },
    ];

    const outstandingInvoices = ref([
      { invoiceId: 'INV-001', customerName: 'John Doe', amountDue: 150, dueDate: '2026-01-15', status: 'pending' },
      { invoiceId: 'INV-002', customerName: 'Jane Smith', amountDue: 200, dueDate: '2026-01-10', status: 'overdue' },
      { invoiceId: 'INV-003', customerName: 'Alice Johnson', amountDue: 75, dueDate: '2026-01-20', status: 'pending' },
    ]);

    const allCustomersColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Total Usage (Monthly)', dataIndex: 'totalUsage', key: 'totalUsage' },
      { title: 'Outstanding Invoices', dataIndex: 'outstandingInvoices', key: 'outstandingInvoices' },
      { title: 'Actions', key: 'actions' },
    ];

    const allCustomers = ref([]);

    onMounted(async () => {
      await fetchCustomersReport();
    });

    async function fetchCustomersReport() {
      try {
        const response = await api.reports.getAllCustomersReport();
        // Assuming the backend returns an array of customers
        allCustomers.value = response.data.data; // Adjusted to match backend response structure
      } catch (error) {
        console.error('Error fetching all customers report:', error);
      }
    }

    return {
      revenueChartData,
      paymentStatusChartData,
      chartOptions,
      outstandingInvoicesColumns,
      outstandingInvoices,
      allCustomersColumns,
      allCustomers,
      fetchCustomersReport, // Expose if needed for manual refresh, etc.
    };
  },
});
</script>

<style scoped>
.reports-analytics-container {
  padding: 24px;
}
</style>