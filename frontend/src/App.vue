<template>
  <template v-if="$route.meta.layout === false">
    <router-view />
  </template>
  <template v-else>
    <a-layout style="min-height: 100vh;">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        breakpoint="lg"
        class="main-sider"
        width="260"
      >
        <div class="logo-container">
          <div class="logo-icon">Qx</div>
          <span v-if="!collapsed" class="logo-text">Billing</span>
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" class="nav-menu">
          <a-menu-item key="dashboard">
            <template #icon><dashboard-outlined /></template>
            <router-link to="/dashboard">Dashboard</router-link>
          </a-menu-item>
          <a-menu-item key="customers">
            <template #icon><team-outlined /></template>
            <router-link to="/customers">Customers</router-link>
          </a-menu-item>
          <a-menu-item key="usage-tracker">
            <template #icon><bar-chart-outlined /></template>
            <router-link to="/usage-tracker">Usage Tracker</router-link>
          </a-menu-item>
          <a-menu-item key="billing-engine">
            <template #icon><setting-outlined /></template>
            <router-link to="/billing-engine">Billing Engine</router-link>
          </a-menu-item>
          <a-menu-item key="reports">
            <template #icon><line-chart-outlined /></template>
            <router-link to="/reports">Reports & Analytics</router-link>
          </a-menu-item>
           <a-menu-item key="invoice-generator">
            <template #icon><file-text-outlined /></template>
            <router-link to="/invoice-generator">Invoices</router-link>
          </a-menu-item>
           <a-menu-item key="payment-processing">
            <template #icon><credit-card-outlined /></template>
            <router-link to="/payment-processing">Payments</router-link>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="help-center">
            <template #icon><question-circle-outlined /></template>
            <router-link to="/help-center">Help Center</router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="main-header">
          <div class="header-left">
            <h2 class="page-title">{{ currentPageTitle }}</h2>
          </div>
          <div class="header-right">
            <a-space size="large">
              <a-badge dot>
                <bell-outlined class="header-icon" />
              </a-badge>
              <a-dropdown placement="bottomRight">
                <div class="user-profile">
                  <a-avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" />
                  <span v-if="!isMobile" class="user-name">Admin User</span>
                </div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="profile">Profile Settings</a-menu-item>
                    <a-menu-item key="logout">Logout</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </a-layout-header>
        <a-layout-content>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" class="page-container" />
            </transition>
          </router-view>
        </a-layout-content>
        <a-layout-footer class="main-footer">
          Qx_Billing &copy;2026 Crafted with precision by Ramius_arch
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </template>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  LineChartOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'App',
  components: {
    DashboardOutlined,
    TeamOutlined,
    BarChartOutlined,
    SettingOutlined,
    LineChartOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    QuestionCircleOutlined,
    BellOutlined,
  },
  setup() {
    const route = useRoute();
    const collapsed = ref(false);
    const selectedKeys = ref([route.path.split('/')[1] || 'dashboard']);

    const currentPageTitle = computed(() => {
      const key = route.path.split('/')[1] || 'dashboard';
      const titles = {
        'dashboard': 'Analytics Overview',
        'customers': 'Customer Management',
        'usage-tracker': 'Real-time Usage',
        'billing-engine': 'Billing Configuration',
        'reports': 'System Reports',
        'invoice-generator': 'Invoice Management',
        'payment-processing': 'Transaction History',
        'help-center': 'Support & Help',
      };
      return titles[key] || 'Overview';
    });

    return {
      collapsed,
      selectedKeys,
      currentPageTitle,
      isMobile: window.innerWidth < 768,
    };
  },
  watch: {
    '$route.path'(newPath) {
      if (this.$route.meta.layout !== false) {
        this.selectedKeys = [newPath.split('/')[1] || 'dashboard'];
      }
    }
  }
});
</script>

<style scoped>
.main-sider {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.02);
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.logo-text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.main-header {
  justify-content: space-between;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-icon {
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.header-icon:hover {
  color: var(--primary-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: var(--transition-fast);
}

.user-profile:hover {
  background: var(--bg-color);
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
}

.main-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
  background: var(--surface-color);
  padding: 16px;
}

.nav-menu :deep(.ant-menu-item-selected) {
  background-color: #e6f4ff !important;
  font-weight: 600;
}
</style>