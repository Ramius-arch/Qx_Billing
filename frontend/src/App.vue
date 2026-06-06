<template>
  <div class="app-root">
    <!-- Global route loading indicator -->
    <div
      v-if="isRouteLoading"
      class="fixed top-0 left-0 right-0 h-1 bg-primary-500 z-[100]"
    >
      <div class="h-full bg-primary-300 animate-pulse" />
    </div>

    <a-config-provider :theme="themeConfig">
      <template v-if="$route.meta.layout === false">
        <router-view />
      </template>
      <template v-else>
        <a-layout style="min-height: 100vh;">
          <!-- Desktop Sider -->
          <a-layout-sider
            v-if="!isMobile"
            v-model:collapsed="collapsed"
            collapsible
            breakpoint="lg"
            class="main-sider"
            width="260"
          >
            <router-link to="/dashboard" class="logo-container">
              <img src="/assets/logo.png" alt="Quixora Logo" class="sidebar-logo" />
              <span v-if="!collapsed" class="logo-text">Billing</span>
            </router-link>
            
            <a-menu
              v-model:selectedKeys="selectedKeys"
              mode="inline"
              class="nav-menu"
            >
              <template v-for="item in menuItems" :key="item.key">
                <a-menu-divider v-if="item.type === 'divider'" />
                <a-menu-item v-else :key="item.key">
                  <template #icon>
                    <component :is="item.icon" />
                  </template>
                  <template v-if="item.href">
                    <a :href="item.href" target="_blank">{{ item.label }}</a>
                  </template>
                  <router-link v-else :to="item.path">{{ item.label }}</router-link>
                </a-menu-item>
              </template>
            </a-menu>
          </a-layout-sider>

          <!-- Mobile Drawer -->
          <a-drawer
            v-if="isMobile"
            v-model:open="drawerVisible"
            placement="left"
            :closable="false"
            width="280"
            :body-style="{ padding: 0 }"
          >
            <div class="drawer-header">
              <router-link to="/dashboard" class="logo-container" @click="drawerVisible = false">
                <img src="/assets/logo.png" alt="Quixora Logo" class="sidebar-logo" />
                <span class="logo-text">Billing</span>
              </router-link>
            </div>
            
            <a-menu
              v-model:selectedKeys="selectedKeys"
              mode="inline"
              class="nav-menu"
              @click="drawerVisible = false"
            >
              <template v-for="item in menuItems" :key="item.key">
                <a-menu-divider v-if="item.type === 'divider'" />
                <a-menu-item v-else :key="item.key">
                  <template #icon>
                    <component :is="item.icon" />
                  </template>
                  <template v-if="item.href">
                    <a :href="item.href" target="_blank">{{ item.label }}</a>
                  </template>
                  <router-link v-else :to="item.path">{{ item.label }}</router-link>
                </a-menu-item>
              </template>
            </a-menu>
          </a-drawer>

          <a-layout>
            <a-layout-header :class="['main-header', { 'mobile-header': isMobile }]">
              <div class="header-left">
                <a-button 
                  v-if="isMobile" 
                  type="text" 
                  @click="drawerVisible = true" 
                  class="menu-toggle"
                >
                  <menu-outlined />
                </a-button>
                <h2 class="page-title">{{ isMobile ? 'Qx Billing' : currentPageTitle }}</h2>
              </div>
              <div class="header-right">
                <a-space :size="isMobile ? 'small' : 'large'">
                  <a-tooltip :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
                    <div class="theme-toggle" @click="toggleTheme">
                      <component :is="isDark ? 'bulb-filled' : 'bulb-outlined'" class="header-icon" />
                    </div>
                  </a-tooltip>
                  
                  <a-badge dot v-if="!isMobile">
                    <bell-outlined class="header-icon" />
                  </a-badge>

                  <a-dropdown placement="bottomRight">
                    <div class="user-profile">
                      <a-avatar size="small" src="https://xsgames.co/randomusers/avatar.php?g=pixel" />
                      <span v-if="!isMobile" class="user-name">Admin</span>
                    </div>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="profile">Profile</a-menu-item>
                        <a-menu-item key="logout">Logout</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </a-space>
              </div>
            </a-layout-header>

            <a-layout-content :style="{ marginTop: isMobile ? '64px' : '0' }">
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" class="page-container" />
                </transition>
              </router-view>
            </a-layout-content>

            <a-layout-footer class="main-footer">
              Qx_Billing &copy;2026 | Ramius_arch
            </a-layout-footer>
          </a-layout>
        </a-layout>
      </template>
    </a-config-provider>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { isRouteLoading } from './router';
import { theme } from 'ant-design-vue';
import {
  HomeOutlined,
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  LineChartOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  BulbOutlined,
  BulbFilled,
  MenuOutlined,
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'App',
  components: {
    HomeOutlined,
    DashboardOutlined,
    TeamOutlined,
    BarChartOutlined,
    SettingOutlined,
    LineChartOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    BulbOutlined,
    BulbFilled,
    MenuOutlined,
  },
  setup() {
    const route = useRoute();
    const windowWidth = ref(window.innerWidth);
    const collapsed = ref(false);
    const drawerVisible = ref(false);
    const selectedKeys = ref([route.path.split('/')[1] || 'dashboard']);
    
    const isDark = ref(localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches);

    const themeConfig = computed(() => ({
      algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
      },
    }));

    const menuItems = [
      { key: 'main-site', label: 'Main Site', icon: 'home-outlined', href: 'https://quixora.netlify.app' },
      { key: 'divider-1', type: 'divider' },
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard-outlined', path: '/dashboard' },
      { key: 'customers', label: 'Customers', icon: 'team-outlined', path: '/customers' },
      { key: 'usage-tracker', label: 'Usage Tracker', icon: 'bar-chart-outlined', path: '/usage-tracker' },
      { key: 'billing-engine', label: 'Billing Engine', icon: 'setting-outlined', path: '/billing-engine' },
      { key: 'reports', label: 'Reports', icon: 'line-chart-outlined', path: '/reports' },
      { key: 'invoice-generator', label: 'Invoices', icon: 'file-text-outlined', path: '/invoice-generator' },
      { key: 'payment-processing', label: 'Payments', icon: 'credit-card-outlined', path: '/payment-processing' },
      { key: 'divider-2', type: 'divider' },
      { key: 'help-center', label: 'Help Center', icon: 'question-circle-outlined', path: '/help-center' },
    ];

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
      updateThemeAttribute();
    };

    const updateThemeAttribute = () => {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
    };

    const updateWidth = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener('resize', updateWidth);
      updateThemeAttribute();
    });

    const isMobile = computed(() => windowWidth.value < 992); // Standard desktop breakpoint

    const currentPageTitle = computed(() => {
      const key = route.path.split('/')[1] || 'dashboard';
      const items = menuItems.find(i => i.key === key);
      return items ? items.label : 'Overview';
    });

    watch(() => route.path, (newPath) => {
      selectedKeys.value = [newPath.split('/')[1] || 'dashboard'];
    });

    return {
      collapsed,
      drawerVisible,
      selectedKeys,
      menuItems,
      currentPageTitle,
      isMobile,
      isDark,
      themeConfig,
      toggleTheme,
      isRouteLoading,
    };
  },
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
  padding: 0 16px;
  margin-bottom: 8px;
}

.sidebar-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
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
  background: var(--surface-color);
  padding: 0 24px;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 0 16px !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.menu-toggle {
  font-size: 20px;
  padding: 4px;
  height: auto;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--bg-color);
}

.nav-menu :deep(.ant-menu-item-selected) {
  background-color: var(--primary-color) !important;
  color: white !important;
  font-weight: 600;
}

[data-theme='dark'] .nav-menu :deep(.ant-menu-item-selected) {
  background-color: var(--primary-color) !important;
  color: white !important;
}

[data-theme='dark'] .nav-menu :deep(.ant-menu-title-content a) {
  color: rgba(255, 255, 255, 0.85);
}

[data-theme='dark'] .nav-menu :deep(.ant-menu-item-selected .ant-menu-title-content a) {
  color: white;
}

@media (max-width: 480px) {
  .page-title {
    font-size: 15px;
    max-width: 140px;
  }

  .header-icon {
    font-size: 18px;
  }

  .user-profile {
    gap: 4px;
    padding: 2px 4px;
  }

  .main-footer {
    font-size: 11px;
    padding: 12px;
  }

  .header-right :deep(.ant-space) {
    gap: 4px !important;
  }
}
</style>