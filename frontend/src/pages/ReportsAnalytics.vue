<template>
  <div class="reports-analytics-container">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <a-typography-title :level="2" style="margin: 0">System Insights</a-typography-title>
      <a-space>
        <data-importer @data-imported="handleImportedData" />
        <a-button @click="fetchCustomersReport">
          <template #icon><reload-outlined /></template>
          Refresh Data
        </a-button>
        <a-button type="primary">
          <template #icon><download-outlined /></template>
          Export All
        </a-button>
      </a-space>
    </div>

    <a-row :gutter="[24, 24]" class="mb-6">
      <a-col :xs="24" :lg="16">
        <a-card title="Revenue Growth Trends" class="standard-card">
          <div class="chart-container">
            <Bar :data="revenueChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="Collection Status" class="standard-card">
          <div class="chart-container pie-container">
            <Pie :data="paymentStatusChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="All Customers Operational Report" class="standard-card">
      <a-table 
        :columns="allCustomersColumns" 
        :data-source="allCustomers" 
        :pagination="{ pageSize: 5 }" 
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button type="link" size="small" @click="viewCustomerDetails(record)">
              View Full Profile
            </a-button>
          </template>
          <template v-else-if="column.key === 'outstandingInvoices'">
             <a-tag :color="record.outstandingInvoices > 0 ? 'red' : 'green'">
               {{ record.outstandingInvoices }} Pending
             </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bar, Pie } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ArcElement 
} from 'chart.js';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import api from '../services/api';
import DataImporter from '../components/DataImporter.vue';
import { message } from 'ant-design-vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default defineComponent({
  name: 'ReportsAnalytics',
  components: {
    Bar,
    Pie,
    ReloadOutlined,
    DownloadOutlined,
    DataImporter,
  },
  setup() {
    const router = useRouter();
    const revenueChartData = reactive({
      labels: [],
      datasets: [
        {
          label: 'Revenue (KSh)',
          backgroundColor: '#1677ff',
          borderRadius: 4,
          data: [],
        },
      ],
    });

    const paymentStatusChartData = reactive({
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          backgroundColor: ['#10b981', '#6366f1', '#ef4444'],
          data: [0, 0, 0],
        },
      ],
    });

    const chartOptions = reactive({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    });

    const allCustomersColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
      { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Monthly Usage', dataIndex: 'totalUsage', key: 'totalUsage' },
      { title: 'Invoices', key: 'outstandingInvoices', width: 120 },
      { title: 'Action', key: 'actions', width: 150 },
    ];

    const allCustomers = ref([]);

    const viewCustomerDetails = (record) => {
      router.push(`/customers?search=${record.name}`);
    };

    const handleImportedData = (data) => {
        // Map imported data to chart structure (simple implementation)
        const labels = data.map(d => d.label || d.x || 'N/A');
        const values = data.map(d => Number(d.value || d.y || 0));
        revenueChartData.labels = labels;
        revenueChartData.datasets[0].data = values;
        message.success('Charts updated with imported data.');
    };

    const fetchReportsData = async () => {
      try {
        const [customersRes, trendsRes, invoicesRes] = await Promise.all([
          api.reports.getAllCustomersReport(),
          api.reports.getBillingTrends('12m'),
          api.getInvoices(1, 1000)
        ]);
        
        allCustomers.value = customersRes.data.data;
        
        // Map Trends
        const trends = trendsRes.data.data.trendData || [];
        revenueChartData.labels = trends.map(t => t.month || t.date || 'N/A');
        revenueChartData.datasets[0].data = trends.map(t => t.revenue);

        // Map Payment Status from Invoices
        const invoices = invoicesRes.data.invoices || [];
        const statusCounts = invoices.reduce((acc, inv) => {
          if (inv.status === 'paid') acc.paid++;
          else if (inv.status === 'pending') acc.pending++;
          else if (inv.status === 'overdue') acc.overdue++;
          return acc;
        }, { paid: 0, pending: 0, overdue: 0 });
        
        paymentStatusChartData.datasets[0].data = [statusCounts.paid, statusCounts.pending, statusCounts.overdue];

      } catch (error) {
        console.error('Report fetch failed', error);
      }
    };

    onMounted(fetchReportsData);

    return {
      revenueChartData,
      paymentStatusChartData,
      chartOptions,
      allCustomersColumns,
      allCustomers,
      fetchCustomersReport: fetchReportsData,
      viewCustomerDetails,
      handleImportedData
    };
  },
});
</script>

<style scoped>
.reports-analytics-container {
  max-width: 1400px;
  margin: 0 auto;
}

.standard-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.chart-container {
  height: 300px;
  position: relative;
}

@media (max-width: 576px) {
  .chart-container {
    height: 220px;
  }
}
</style>
