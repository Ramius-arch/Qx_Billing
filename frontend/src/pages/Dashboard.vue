<template>
  <div class="dashboard-page">
    <a-spin :spinning="loading" size="large" tip="Aggregating Real-time Data...">
      <div class="stats-grid">
        <a-card v-for="stat in stats" :key="stat.title" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
              <component :is="stat.icon" />
            </div>
            <div class="stat-info">
              <span class="stat-label">{{ stat.title }}</span>
              <div class="stat-value-group">
                <span class="stat-value">{{ stat.prefix }}{{ stat.value.toLocaleString() }}</span>
                <span class="stat-suffix">{{ stat.suffix }}</span>
              </div>
              <div class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                <template v-if="stat.trend > 0"><arrow-up-outlined /></template>
                <template v-else><arrow-down-outlined /></template>
                {{ Math.abs(stat.trend) }}% from last month
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <a-row :gutter="[24, 24]" class="mt-24">
        <a-col :xs="24" :lg="16">
          <a-card title="Revenue Forecast & Trends" class="chart-card">
            <template #extra>
              <a-radio-group v-model:value="revenuePeriod" size="small">
                <a-radio-button value="7d">7D</a-radio-button>
                <a-radio-button value="30d">30D</a-radio-button>
                <a-radio-button value="12m">12M</a-radio-button>
              </a-radio-group>
            </template>
            <div class="chart-placeholder">
              <!-- In a real app, integrate @ant-design/plots or Chart.js here -->
              <div class="mock-chart bar-chart">
                <div v-for="h in [40, 65, 45, 80, 55, 90, 70]" :key="h" 
                     class="bar" :style="{ height: h + '%' }"></div>
              </div>
              <div class="chart-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="8">
          <a-card title="Usage Distribution" class="chart-card">
            <div class="chart-placeholder">
               <div class="mock-pie">
                 <div class="pie-segment segment-1"></div>
                 <div class="pie-segment segment-2"></div>
                 <div class="pie-segment segment-3"></div>
               </div>
               <div class="pie-legend">
                 <div class="legend-item"><span class="dot data"></span> Data (65%)</div>
                 <div class="legend-item"><span class="dot voice"></span> Voice (25%)</div>
                 <div class="legend-item"><span class="dot sms"></span> SMS (10%)</div>
               </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="[24, 24]" class="mt-24">
        <a-col :xs="24" :lg="14">
          <a-card title="Recent Transactions" class="list-card">
             <template #extra>
              <router-link to="/payment-processing" class="view-all">View All</router-link>
            </template>
            <a-list item-layout="horizontal" :data-source="dashboardData.recentTransactions">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <span class="txn-title">{{ item.description }}</span>
                    </template>
                    <template #description>
                      <span class="txn-date">{{ item.date }}</span>
                    </template>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getStatusColor(item.status) }">
                        <component :is="item.status === 'Completed' ? 'check-outlined' : 'clock-circle-outlined'" />
                      </a-avatar>
                    </template>
                  </a-list-item-meta>
                  <div class="txn-status">
                    <a-tag :color="getStatusTagColor(item.status)">{{ item.status }}</a-tag>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="10">
          <a-card title="Quick Actions" class="actions-card">
            <div class="actions-grid">
              <a-button type="primary" block size="large" @click="goToCreateInvoice">
                <template #icon><plus-outlined /></template>
                Issue Invoice
              </a-button>
              <a-button block size="large" @click="goToCustomers">
                <template #icon><user-add-outlined /></template>
                New Customer
              </a-button>
              <a-button block size="large" @click="goToViewPayments">
                <template #icon><history-outlined /></template>
                Audit Logs
              </a-button>
              <a-button block size="large">
                <template #icon><export-outlined /></template>
                Export Report
              </a-button>
            </div>
            <div class="system-health mt-24">
              <span class="health-label">System Health</span>
              <a-progress :percent="98.5" size="small" status="active" />
              <div class="health-details">
                <span>API Status: <strong>Stable</strong></span>
                <span>Latency: <strong>24ms</strong></span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { message } from 'ant-design-vue';
import {
  DollarOutlined,
  TeamOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UserAddOutlined,
  HistoryOutlined,
  ExportOutlined
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    DollarOutlined,
    TeamOutlined,
    CloudServerOutlined,
    PhoneOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    UserAddOutlined,
    HistoryOutlined,
    ExportOutlined
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const revenuePeriod = ref('30d');
    const dashboardData = ref({
      totalRevenue: 0,
      activeCustomers: 0,
      totalDataUsage: 0,
      totalCallDuration: 0,
      recentTransactions: [],
    });

    const stats = computed(() => [
      { 
        title: 'Total Revenue', 
        value: dashboardData.value.totalRevenue || 125000, 
        prefix: 'KSh ', 
        suffix: '', 
        icon: 'DollarOutlined', 
        color: '#10b981',
        trend: 12.5
      },
      { 
        title: 'Active Customers', 
        value: dashboardData.value.activeCustomers || 1200, 
        prefix: '', 
        suffix: '', 
        icon: 'TeamOutlined', 
        color: '#1677ff',
        trend: 8.2
      },
      { 
        title: 'Data Throughput', 
        value: dashboardData.value.totalDataUsage || 5000, 
        prefix: '', 
        suffix: ' GB', 
        icon: 'CloudServerOutlined', 
        color: '#6366f1',
        trend: -2.4
      },
      { 
        title: 'Voice Traffic', 
        value: dashboardData.value.totalCallDuration || 2500, 
        prefix: '', 
        suffix: ' Hrs', 
        icon: 'PhoneOutlined', 
        color: '#f59e0b',
        trend: 5.1
      },
    ]);

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        const response = await api.getDashboardData();
        dashboardData.value = response.data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback for demo
        dashboardData.value = {
          totalRevenue: 125000,
          activeCustomers: 1200,
          totalDataUsage: 5040,
          totalCallDuration: 2500,
          recentTransactions: [
            { id: 1, description: 'Batch Payment: Safaricom M-Pesa', date: 'Today, 10:45 AM', status: 'Completed' },
            { id: 2, description: 'Invoice #INV-9022 Generated', date: 'Today, 09:15 AM', status: 'Pending' },
            { id: 3, description: 'New Enterprise Node: Tech Corp', date: 'Yesterday', status: 'Completed' },
            { id: 4, description: 'Manual Credit Adjustment: ID #442', date: 'Yesterday', status: 'Completed' },
          ],
        };
      } finally {
        setTimeout(() => loading.value = false, 800);
      }
    };

    const getStatusColor = (status) => {
      return status === 'Completed' ? '#10b981' : '#f59e0b';
    };

    const getStatusTagColor = (status) => {
      return status === 'Completed' ? 'success' : 'warning';
    };

    const goToCreateInvoice = () => router.push('/invoice-generator');
    const goToViewPayments = () => router.push('/payment-processing');
    const goToCustomers = () => router.push('/customers');

    fetchDashboardData();

    return {
      dashboardData,
      stats,
      loading,
      revenuePeriod,
      getStatusColor,
      getStatusTagColor,
      goToCreateInvoice,
      goToViewPayments,
      goToCustomers,
    };
  },
});
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.stat-card {
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-suffix {
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up { color: #10b981; }
.trend-down { color: #ef4444; }

.mt-24 { margin-top: 24px; }

.chart-card {
  min-height: 400px;
}

.chart-placeholder {
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 0 20px;
}

.bar {
  flex: 1;
  background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: 4px 4px 0 0;
  transition: opacity 0.3s;
}

.bar:hover {
  opacity: 0.8;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 20px;
  color: var(--text-secondary);
  font-size: 12px;
}

.mock-pie {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  margin: 0 auto;
  background: conic-gradient(
    #1677ff 0% 65%,
    #6366f1 65% 90%,
    #f59e0b 90% 100%
  );
  position: relative;
}

.mock-pie::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
}

.pie-legend {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.data { background: #1677ff; }
.dot.voice { background: #6366f1; }
.dot.sms { background: #f59e0b; }

.txn-title { font-weight: 600; color: var(--text-primary); }
.txn-date { font-size: 12px; }
.view-all { font-size: 13px; font-weight: 500; }

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.health-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.health-details {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>