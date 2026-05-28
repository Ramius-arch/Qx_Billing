<template>
  <div>
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
        <a-layout style="min-height: 100vh; overscroll-behavior-x: none;">

        <!-- Desktop Sider -->
        <a-layout-sider
          v-if="!isMobile"
          v-model:collapsed="collapsed"
          collapsible
          breakpoint="lg"
          class="main-sider"
          width="260"
        >
          <div class="logo-container">
            <img src="/assets/logo.png" alt="Quixora Logo" class="sidebar-logo" />
            <span v-if="!collapsed" class="logo-text">Billing</span>
          </div>
          <MenuContent v-model:selectedKeys="selectedKeys" />
        </a-layout-sider>

        <!-- Mobile Drawer -->
        <a-drawer
          v-if="isMobile"
          v-model:open="drawerVisible"
          placement="left"
          :closable="false"
          @close="drawerVisible = false"
          width="260"
          :body-style="{ padding: 0 }"
        >
          <div class="logo-container">
            <img src="/assets/logo.png" alt="Quixora Logo" class="sidebar-logo" />
            <span class="logo-text">Billing</span>
          </div>
          <MenuContent v-model:selectedKeys="selectedKeys" @click="drawerVisible = false" />
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
                    <template v-if="isDark">
                      <bulb-filled class="header-icon" />
                    </template>
                    <template v-else>
                      <bulb-outlined class="header-icon" />
                    </template>
                  </div>
                </a-tooltip>
                <a-badge dot v-if="!isMobile">
                  <bell-outlined class="header-icon" />
                </a-badge>
                <a-dropdown placement="bottomRight">
                  <div class="user-profile">
                    <a-avatar size="small" src="https://xsgames.co/randomusers/avatar.php?g=pixel" />
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
          <a-layout-content :style="{ marginTop: isMobile ? '64px' : '0' }">
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
  </a-config-provider>
</template>

<script>
import { defineComponent, ref, computed, onMounted, h } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { isRouteLoading } from './router';
import { theme } from 'ant-design-vue';
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
  BulbOutlined,
  BulbFilled,
  MenuOutlined,
} from '@ant-design/icons-vue';

// Sub-component for Menu Content to avoid duplication
const MenuContent = defineComponent({
  props: ['selectedKeys'],
  emits: ['update:selectedKeys', 'click'],
  setup(props, { emit }) {
    const handleClick = (e) => {
      emit('click', e);
    };
    return () => h(
      'a-menu',
      {
        selectedKeys: props.selectedKeys,
        'onUpdate:selectedKeys': (val) => emit('update:selectedKeys', val),
        mode: 'inline',
        class: 'nav-menu',
        onClick: handleClick
      },
      [
        h('a-menu-item', { key: 'dashboard' }, {
          icon: () => h(DashboardOutlined),
          default: () => h(RouterLink, { to: '/dashboard' }, { default: () => 'Dashboard' })
        }),
        h('a-menu-item', { key: 'customers' }, {
          icon: () => h(TeamOutlined),
          default: () => h(RouterLink, { to: '/customers' }, { default: () => 'Customers' })
        }),
        h('a-menu-item', { key: 'usage-tracker' }, {
          icon: () => h(BarChartOutlined),
          default: () => h(RouterLink, { to: '/usage-tracker' }, { default: () => 'Usage Tracker' })
        }),
        h('a-menu-item', { key: 'billing-engine' }, {
          icon: () => h(SettingOutlined),
          default: () => h(RouterLink, { to: '/billing-engine' }, { default: () => 'Billing Engine' })
        }),
        h('a-menu-item', { key: 'reports' }, {
          icon: () => h(LineChartOutlined),
          default: () => h(RouterLink, { to: '/reports' }, { default: () => 'Reports & Analytics' })
        }),
        h('a-menu-item', { key: 'invoice-generator' }, {
          icon: () => h(FileTextOutlined),
          default: () => h(RouterLink, { to: '/invoice-generator' }, { default: () => 'Invoices' })
        }),
        h('a-menu-item', { key: 'payment-processing' }, {
          icon: () => h(CreditCardOutlined),
          default: () => h(RouterLink, { to: '/payment-processing' }, { default: () => 'Payments' })
        }),
        h('a-menu-divider'),
        h('a-menu-item', { key: 'help-center' }, {
          icon: () => h(QuestionCircleOutlined),
          default: () => h(RouterLink, { to: '/help-center' }, { default: () => 'Help Center' })
        }),
      ]
    );
  }
});

export default defineComponent({
  name: 'App',
  components: {
    BellOutlined,
    BulbOutlined,
    BulbFilled,
    MenuOutlined,
    MenuContent,
  },
  setup() {
    const route = useRoute();
    const collapsed = ref(false);
    const drawerVisible = ref(false);
    const selectedKeys = ref([route.path.split('/')[1] || 'dashboard']);
    
    // Smart initial theme detection
    const getInitialTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    
    const isDark = ref(getInitialTheme());

    const themeConfig = computed(() => ({
      algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
      },
    }));

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
      updateThemeAttribute();
    };

    const updateThemeAttribute = () => {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
    };

    const windowWidth = ref(window.innerWidth);
    const updateWidth = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener('resize', updateWidth);
      updateThemeAttribute();
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches;
          updateThemeAttribute();
        }
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }
    });

    const isMobile = computed(() => windowWidth.value < 992); // Using lg breakpoint

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
      drawerVisible,
      selectedKeys,
      currentPageTitle,
      isMobile,
      isDark,
      themeConfig,
      toggleTheme,
      isRouteLoading,
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
</style>