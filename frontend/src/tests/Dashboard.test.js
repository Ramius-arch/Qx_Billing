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

test('renders dashboard data correctly', async () => {
  const wrapper = mount(Dashboard);

  // Wait for the async operation to complete
  await wrapper.vm.$nextTick();

  expect(wrapper.find('h1').text()).toContain('Telecom Billing Dashboard');
  expect(wrapper.html()).toContain('KSh 123456');
  expect(wrapper.html()).toContain('123');
  expect(wrapper.html()).toContain('456');
  expect(wrapper.html()).toContain('789');
  expect(wrapper.html()).toContain('Transaction 1');
  expect(wrapper.html()).toContain('Transaction 2');
});
