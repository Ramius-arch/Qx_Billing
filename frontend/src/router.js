import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // Redirect to dashboard by default
  { path: '/', redirect: '/dashboard' },

  // Login Route
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/Login.vue'),
    meta: {
      title: 'Login',
      layout: false, // No layout for login page
    },
  },
  // Register Route
  {
    path: '/register',
    name: 'Register',
    component: () => import('./pages/Register.vue'),
    meta: {
      title: 'Register',
      layout: false, // No layout for register page
    },
  },

  // Dashboard route
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./pages/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      layout: true,
    },
  },

  // Customers route
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('./pages/Customers.vue'),
    meta: {
      title: 'Customers',
      layout: true,
    },
  },

  // Usage Tracker route
  {
    path: '/usage-tracker',
    name: 'UsageTracker',
    component: () => import('./pages/UsageTracker.vue'),
    meta: {
      title: 'Usage Tracker',
      layout: true,
    },
  },

  // Billing Engine route
  {
    path: '/billing-engine',
    name: 'BillingEngine',
    component: () => import('./pages/BillingEngine.vue'),
    meta: {
      title: 'Billing Engine',
      layout: true,
    },
  },

  // Reports route
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('./pages/ReportsAnalytics.vue'),
    meta: {
      title: 'Reports and Analytics',
      layout: true,
    },
  },

  // Invoice Generator route
  {
    path: '/invoice-generator',
    name: 'InvoiceGenerator',
    component: () => import('./pages/InvoiceGenerator.vue'),
    meta: {
      title: 'Invoice Generator',
      layout: true,
    },
  },

  // Payment Processing route
  {
    path: '/payment-processing',
    name: 'PaymentProcessing',
    component: () => import('./pages/PaymentProcessing.vue'),
    meta: {
      title: 'Payment Processing',
      layout: true,
    },
  },
  // Help Center route
  {
    path: '/help-center',
    name: 'HelpCenter',
    component: () => import('./pages/HelpCenter.vue'),
    meta: {
      title: 'Help Center',
      layout: true,
    },
  },
  // Invoice Detail route
  {
    path: '/invoices/:id',
    name: 'InvoiceDetail',
    component: () => import('./pages/InvoiceDetail.vue'),
    meta: {
      title: 'Invoice Details',
      layout: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Telecom Billing System';
  next();
});

export default router;
