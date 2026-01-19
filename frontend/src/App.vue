<template>
  <template v-if="$route.meta.layout === false">
    <router-view />
  </template>
  <template v-else>
    <a-layout style="min-height: 100vh;">
      <a-layout-header class="header">
        <div class="logo" />
        <h1 style="color: white; margin: 0;">Telecom Billing System</h1>
      </a-layout-header>
      <a-layout>
        <a-layout-sider breakpoint="lg" collapsed-width="0" @collapse="onCollapse" @breakpoint="onBreakpoint">
          <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
            <a-menu-item key="dashboard">
              <router-link to="/dashboard">Dashboard</router-link>
            </a-menu-item>
            <a-menu-item key="customers">
              <router-link to="/customers">Customers</router-link>
            </a-menu-item>
            <a-menu-item key="usage-tracker">
              <router-link to="/usage-tracker">Usage Tracker</router-link>
            </a-menu-item>
            <a-menu-item key="billing-engine">
              <router-link to="/billing-engine">Billing Engine</router-link>
            </a-menu-item>
            <a-menu-item key="reports">
              <router-link to="/reports">Reports</router-link>
            </a-menu-item>
             <a-menu-item key="invoice-generator">
              <router-link to="/invoice-generator">Invoice Generator</router-link>
            </a-menu-item>
             <a-menu-item key="payment-processing">
              <router-link to="/payment-processing">Payment Processing</router-link>
            </a-menu-item>
            <a-menu-item key="help-center">
              <router-link to="/help-center">Help Center</router-link>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout>
          <a-layout-content style="margin: 24px 16px 0;">
            <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
              <router-view></router-view>
            </div>
          </a-layout-content>
          <a-layout-footer style="text-align: center;">
            &copy;2026 Created by Ramius_arch
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </a-layout>
  </template>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'App',
  setup() {
    const route = useRoute();
    const selectedKeys = ref([route.path.split('/')[1] || 'dashboard']);

    return {
      selectedKeys,
      onCollapse: (collapsed, type) => {
        console.log(collapsed, type);
      },
      onBreakpoint: (broken) => {
        console.log(broken);
      },
    };
  },
  watch: {
    '$route.path'(newPath) {
      // Only update selected keys if layout is present
      if (this.$route.meta.layout !== false) {
        this.selectedKeys = [newPath.split('/')[1] || 'dashboard'];
      }
    }
  }
});
</script>

<style>
#app .header {
  background: #001529; /* Dark background for header */
  padding: 0 24px;
  display: flex;
  align-items: center;
}

#app .header .logo {
  float: left;
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 24px 16px 0;
}
</style>