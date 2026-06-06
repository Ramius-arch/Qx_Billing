import { mount } from '@vue/test-utils';
import Dashboard from '../../src/pages/Dashboard.vue';
import { expect, test, vi } from 'vitest';
import api from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  default: {
    getDashboardData: vi.fn(() => Promise.resolve({
      data: {
        totalRevenue: 123456,
        activeCustomers: 123,
        totalDataUsage: 456,
        totalCallDuration: 789,
        recentTransactions: [
          { id: 1, description: 'Transaction 1', date: '2023-01-01', status: 'Completed' },
          { id: 2, description: 'Transaction 2', date: '2023-01-02', status: 'Pending' },
        ],
      },
    })),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    path: '/',
    query: {},
  }),
}));

test('renders dashboard data correctly', async () => {
  const wrapper = mount(Dashboard, {
    global: {
      stubs: {
        'a-spin': { template: '<div><slot /></div>' },
        'a-card': { template: '<div><slot /></div>' },
        'a-row': { template: '<div><slot /></div>' },
        'a-col': { template: '<div><slot /></div>' },
        'a-tag': { template: '<span><slot /></span>' },
        'a-list': {
          props: ['dataSource'],
          template: '<div><slot v-for="item in dataSource" :item="item" name="renderItem" /></div>'
        },
        'a-list-item': { template: '<div><slot /></div>' },
        'a-list-item-meta': { template: '<div><slot name="title" /><slot name="description" /><slot name="avatar" /></div>' },
        'a-avatar': true,
        'a-button': true,
        'a-progress': true,
        'a-radio-group': true,
        'a-radio-button': true,
        'router-link': true,
      }
    }
  });

  // Wait for the async operation to complete
  await wrapper.vm.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Dashboard has a timeout

  expect(wrapper.html()).toContain('123,456');
  expect(wrapper.html()).toContain('123');
  expect(wrapper.html()).toContain('456');
  expect(wrapper.html()).toContain('789');
  expect(wrapper.html()).toContain('Transaction 1');
  expect(wrapper.html()).toContain('Transaction 2');
});
