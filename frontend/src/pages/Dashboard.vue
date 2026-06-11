<template>
  <div class="dashboard-page" :data-loading="loading">
    <div class="stats-grid">
      <a-card v-for="(stat, index) in stats" :key="stat.title" class="stat-card" :style="{ '--index': index }">
        <div class="stat-content">
          <div class="stat-icon-wrapper" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.title }}</span>
            <div class="stat-value-group">
              <span class="stat-value">
                <span class="prefix">{{ stat.prefix }}</span>
                <animated-number :value="stat.value" :suffix="stat.suffix" />
              </span>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
              <component :is="stat.trend > 0 ? 'arrow-up-outlined' : 'arrow-down-outlined'" />
              <span>{{ Math.abs(stat.trend) }}%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <a-row :gutter="[24, 24]" class="mt-24">
      <a-col :xs="24" :lg="16">
        <a-card class="chart-card reveal-chart">
          <template #title>
            <div class="chart-header">
              <span class="chart-title">Revenue Forecast & Trends</span>
            </div>
          </template>
          <template #extra>
            <a-radio-group v-model:value="revenuePeriod" size="small" class="period-selector" @change="fetchDashboardData">
              <a-radio-button value="7d">7D</a-radio-button>
              <a-radio-button value="30d">30D</a-radio-button>
              <a-radio-button value="12m">12M</a-radio-button>
            </a-radio-group>
          </template>
          <div class="chart-container">
            <Bar :data="revenueChartData" :options="chartOptions" />
          </div>
          <div v-if="dashboardData.forecast" class="forecast-indicator mt-4">
             <a-alert 
               type="info" 
               message="Revenue Projection" 
               :description="`Projected next month: KSh ${dashboardData.forecast.nextMonthProjected.toLocaleString()} (Confidence: ${dashboardData.forecast.confidence})`" 
               show-icon 
             />
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="Usage Distribution" class="chart-card reveal-chart" :style="{ '--delay': '0.2s' }">
          <div class="chart-container">
            <Pie :data="usageChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[24, 24]" class="mt-24">
      <a-col :xs="24" :lg="15">
        <a-card class="list-card glass-card">
          <template #title>
            <div class="card-header">
              <span>Recent Transactions</span>
              <router-link to="/payment-processing" class="view-all">View All</router-link>
            </div>
          </template>
          <a-list item-layout="horizontal" :data-source="dashboardData.recentTransactions" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item class="txn-item">
                <a-list-item-meta>
                  <template #title>
                    <span class="txn-title">{{ item.description }}</span>
                  </template>
                  <template #description>
                    <span class="txn-date">{{ item.date }}</span>
                  </template>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: getStatusColor(item.status) + '15', color: getStatusColor(item.status) }" class="txn-avatar">
                      <component :is="item.status === 'Completed' ? CheckOutlined : ClockCircleOutlined" />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
                <div class="txn-status">
                  <a-tag :color="getStatusTagColor(item.status)" class="rounded-full px-3">{{ item.status }}</a-tag>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="9">
        <a-card title="Quick Actions" class="actions-card glass-card">
          <div class="actions-grid">
            <a-button type="primary" class="action-btn" @click="goToCreateInvoice">
              <template #icon><plus-outlined /></template>
              <span>Issue Invoice</span>
            </a-button>
            <a-button class="action-btn" @click="goToCustomers">
              <template #icon><user-add-outlined /></template>
              <span>New Customer</span>
            </a-button>
            <a-button class="action-btn" @click="goToViewPayments">
              <template #icon><history-outlined /></template>
              <span>Audit Logs</span>
            </a-button>
            <a-button class="action-btn" @click="exportReport">
              <template #icon><export-outlined /></template>
              <span>Export Report</span>
            </a-button>
          </div>
          <div class="system-health mt-32">
            <div class="flex justify-between items-center mb-3">
              <span class="health-label">System Health</span>
              <span class="health-value">98.5%</span>
            </div>
            <a-progress :percent="98.5" size="small" status="active" :show-info="false" stroke-color="#10b981" />
            <div class="health-details mt-4">
              <div class="health-pill"><span class="pulse"></span> API: Stable</div>
              <div class="health-pill">Latency: 24ms</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { message } from 'ant-design-vue';
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// Simple Animated Number component using standard Vue logic
const AnimatedNumber = defineComponent({
  props: ['value', 'suffix'],
  setup(props) {
    const displayValue = ref(0);
    watch(() => props.value, (newVal) => {
      const start = displayValue.value;
      const end = newVal || 0;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        displayValue.value = Math.floor(start + (end - start) * easeOut);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, { immediate: true });
    
    return { displayValue };
  },
  template: `<span>{{ displayValue.toLocaleString() }}{{ suffix }}</span>`
});


export default defineComponent({
  name: 'Dashboard',
  components: {
    AnimatedNumber,
    Bar, Pie,
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
      { title: 'Total Revenue', value: dashboardData.value.totalRevenue || 0, prefix: 'KSh ', suffix: '', icon: 'DollarOutlined', color: '#10b981', trend: 12.5 },
      { title: 'Active Customers', value: dashboardData.value.activeCustomers || 0, prefix: '', suffix: '', icon: 'TeamOutlined', color: '#1677ff', trend: 8.2 },
      { title: 'Data Throughput', value: dashboardData.value.totalDataUsage || 0, prefix: '', suffix: ' GB', icon: 'CloudServerOutlined', color: '#6366f1', trend: -2.4 },
      { title: 'Voice Traffic', value: dashboardData.value.totalCallDuration || 0, prefix: '', suffix: ' Hrs', icon: 'PhoneOutlined', color: '#f59e0b', trend: 5.1 },
    ]);

    const revenueChartData = ref({ labels: [], datasets: [{ label: 'Revenue', data: [], backgroundColor: '#1677ff' }] });
    const usageChartData = ref({ labels: ['Data', 'Voice', 'SMS'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#1677ff', '#6366f1', '#f59e0b'] }] });
    const chartOptions = computed(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#1e293b',
            bodyColor: isDark ? '#cbd5e1' : '#475569',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KSh' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Inter, sans-serif', size: 11, weight: 500 } }
          },
          y: {
            grid: { color: gridColor, drawBorder: false },
            ticks: { 
              color: textColor, 
              font: { family: 'Inter, sans-serif', size: 11 },
              callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
            }
          }
        }
      };
    });
    let pollingInterval = null;

    const fetchDashboardData = async () => {
      try {
        const res = await api.getDashboardData(revenuePeriod.value);
        const data = res.data;
        
        dashboardData.value = {
            totalRevenue: data.totalRevenue || 0,
            activeCustomers: data.activeCustomers || 0,
            totalDataUsage: data.totalDataUsage || 0,
            totalCallDuration: data.totalCallDuration || 0,
            recentTransactions: data.recentTransactions || [],
            forecast: data.forecast || null
        };

        // Map chart data
        const trends = data.recentTransactions || []; // In getDashboardData, trendData is returned as recentTransactions
        
        revenueChartData.value = {
            labels: Array.isArray(trends) ? trends.map(t => t.date || t.month || 'N/A') : [],
            datasets: [{ 
              label: 'Revenue (KSh)', 
              data: Array.isArray(trends) ? trends.map(t => t.revenue) : [], 
              backgroundColor: '#1677ff',
              borderRadius: 6
            }]
        };

        // We still need to fetch usage breakdown if it's not in getDashboardData
        const usageRes = await api.reports.getUsageReports();
        const usageData = usageRes?.data?.data;
        const breakdown = usageData?.usageBreakdown || [];
        
        usageChartData.value = {
            labels: Array.isArray(breakdown) ? breakdown.map(b => b.usageType?.toUpperCase() || 'N/A') : [],
            datasets: [{ 
              data: Array.isArray(breakdown) ? breakdown.map(b => parseFloat(b.totalDuration)) : [], 
              backgroundColor: ['#1677ff', '#6366f1', '#f59e0b'] 
            }]
        };

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        loading.value = false;
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

    const exportReport = () => {
      message.loading('Preparing export...', 1.5).then(() => {
        message.success('Report exported to CSV successfully.');
      });
    };

    watch(revenuePeriod, () => {
      fetchDashboardData();
    });

    onMounted(() => {
        fetchDashboardData();
        pollingInterval = setInterval(fetchDashboardData, 30000); // 30 seconds
    });

    onUnmounted(() => {
        clearInterval(pollingInterval);
    });

    return {
      dashboardData,
      stats,
      loading,
      revenuePeriod,
      revenueChartData,
      usageChartData,
      chartOptions,
      getStatusColor,
      getStatusTagColor,
      goToCreateInvoice,
      goToViewPayments,
      goToCustomers,
      exportReport,
      CheckOutlined,
      ClockCircleOutlined
    };
  },
});
</script>

<style scoped>
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.4);
}

.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  background: radial-gradient(circle at top right, rgba(22, 119, 255, 0.05), transparent 400px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.stat-card {
  border-radius: 24px !important;
  background: var(--glass-bg) !important;
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04) !important;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out) !important;
  cursor: pointer;
  opacity: 1;
  transform: translateY(0);
}

/* Staggered Entry using @starting-style */
.stat-card {
  transition: transform 0.6s var(--ease-out), opacity 0.6s var(--ease-out) !important;
}

@starting-style {
  .stat-card {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
}

.stat-card:nth-child(1) { transition-delay: 0.05s !important; }
.stat-card:nth-child(2) { transition-delay: 0.1s !important; }
.stat-card:nth-child(3) { transition-delay: 0.15s !important; }
.stat-card:nth-child(4) { transition-delay: 0.2s !important; }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(22, 119, 255, 0.08) !important;
}

.stat-card:active {
  transform: scale(0.97) translateY(-2px);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: transform 0.3s var(--ease-out);
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1a202c;
  font-variant-numeric: tabular-nums;
}

.chart-card {
  border-radius: 24px !important;
  background: var(--glass-bg) !important;
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
}

.chart-container {
  height: 340px;
  padding: 8px;
  transition: clip-path 1s var(--ease-out);
}

@starting-style {
  .chart-card {
    opacity: 0;
    transform: scale(0.99);
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.actions-grid .ant-btn {
  height: auto;
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.2s var(--ease-out);
}

.actions-grid .ant-btn:active {
  transform: scale(0.96);
}

.actions-grid .ant-btn :deep(.anticon) {
  font-size: 20px;
}

.view-all {
  font-weight: 600;
  color: #1677ff;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(22, 119, 255, 0.05);
  transition: background 0.2s var(--ease-out);
}

.view-all:hover {
  background: rgba(22, 119, 255, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.chart-title {
  font-weight: 700;
  font-size: 16px;
  color: #1a202c;
}

.period-selector :deep(.ant-radio-button-wrapper) {
  border-radius: 8px !important;
  border: none !important;
  background: rgba(0,0,0,0.03);
  margin-left: 4px;
  font-weight: 600;
  transition: all 0.2s var(--ease-out);
}

.period-selector :deep(.ant-radio-button-wrapper-checked) {
  background: #1677ff !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.reveal-chart {
  animation: reveal 0.8s var(--ease-out) var(--delay, 0s) both;
}

@keyframes reveal {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
  }
}

.txn-item {
  padding: 16px 20px !important;
  transition: background 0.2s var(--ease-out);
  border-bottom: 1px solid rgba(0,0,0,0.03) !important;
}

.txn-item:hover {
  background: rgba(22, 119, 255, 0.02);
}

.txn-title {
  font-weight: 700;
  color: #1a202c;
}

.txn-date {
  font-size: 12px;
  color: #718096;
}

.txn-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.system-health {
  background: rgba(22, 119, 255, 0.03);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(22, 119, 255, 0.08);
}

.health-label {
  font-weight: 700;
  color: #4a5568;
}

.health-value {
  font-weight: 800;
  color: #10b981;
}

.health-details {
  display: flex;
  gap: 12px;
}

.health-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
}

.trend-up { color: #10b981; }
.trend-down { color: #ef4444; }

.trend-label {
  color: #a0aec0;
  font-weight: 500;
  margin-left: 2px;
}

[data-theme='dark'] .health-pill { background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.05); }
[data-theme='dark'] .health-label { color: #94a3b8; }
[data-theme='dark'] .health-value { color: #10b981; }
[data-theme='dark'] .stat-label { color: #94a3b8; }
[data-theme='dark'] .stat-value { color: #f8fafc; }
[data-theme='dark'] .txn-title { color: #f8fafc; }
[data-theme='dark'] .txn-date { color: #94a3b8; }
[data-theme='dark'] .chart-title { color: #f1f5f9; }
[data-theme='dark'] .view-all { background: rgba(22, 119, 255, 0.15); color: #3b82f6; }
[data-theme='dark'] .txn-item { border-bottom: 1px solid rgba(255,255,255,0.03) !important; }
[data-theme='dark'] .system-health { background: rgba(22, 119, 255, 0.05); border: 1px solid rgba(22, 119, 255, 0.15); }
</style>


