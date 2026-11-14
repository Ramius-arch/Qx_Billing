import { mount } from '@vue/test-utils';
import Customers from '../../src/pages/Customers.vue';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import api from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  default: {
    getCustomers: vi.fn(),
    getCustomerSummary: vi.fn(),
    getPlans: vi.fn(() => Promise.resolve({ data: [] })),
    addCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
    path: '/customers',
  }),
}));

const BASE_STUBS = {
  'a-input-search': true,
  'a-button': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  'a-card': { template: '<div><slot /></div>' },
  'a-tag': true,
  'a-modal': true,
  'a-form': true,
  'a-form-item': true,
  'a-input': true,
  'a-textarea': true,
  'a-select': true,
  'a-select-option': true,
  'a-row': true,
  'a-col': true,
  'a-space': true,
  'a-tooltip': { template: '<span><slot /></span>' },
  'a-popconfirm': { template: '<span><slot /></span>' },
  'a-spin': { template: '<div><slot /></div>' },
  'a-drawer': {
    props: ['open'],
    template: '<div v-if="open" data-testid="c360-drawer"><slot name="title" /><slot /></div>',
  },
  'plus-outlined': true,
  'edit-outlined': true,
  'inbox-outlined': true,
  'niche-icon': { template: '<span>icon</span>' },
};

const flushPromises = () => new Promise((r) => setTimeout(r, 0));

describe('Customers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCustomers.mockResolvedValue({
      data: {
        customers: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone_number: '254712334556',
            status: 'active',
            insights: {
              lifetimeSpend: 31850,
              orderCount: 2,
              averageOrderValue: 15925,
              daysSinceLastPurchase: 6,
              balanceDue: 8500,
              owesMoney: true,
              segment: 'vip',
              segmentLabel: 'VIP',
            },
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone_number: '254722984102',
            status: 'active',
            insights: {
              lifetimeSpend: 4500,
              orderCount: 1,
              averageOrderValue: 4500,
              daysSinceLastPurchase: 4,
              balanceDue: 0,
              owesMoney: false,
              segment: 'new',
              segmentLabel: 'New',
            },
          },
        ],
        totalItems: 2,
        segmentCounts: {
          all: 2,
          owes_money: 1,
          vip: 1,
          regular: 0,
          new: 1,
          lapsing: 0,
          no_purchases: 0,
        },
      },
    });

    api.getCustomerSummary.mockResolvedValue({
      data: {
        success: true,
        data: {
          customer: { id: 1, name: 'John Doe', phone_number: '254712334556', address: 'Kilimani, Nairobi', status: 'active' },
          insights: {
            lifetimeSpend: 31850,
            orderCount: 2,
            averageOrderValue: 15925,
            daysSinceLastPurchase: 6,
            lastPurchaseAt: '2026-11-08T10:00:00.000Z',
            balanceDue: 8500,
            owesMoney: true,
            segment: 'vip',
            segmentLabel: 'VIP',
            nextStep: 'John owes KES 8,500. Send a friendly WhatsApp reminder.',
          },
          orders: [
            {
              id: 101,
              orderNumber: 'QX-1001',
              status: 'paid',
              total: 23300,
              paymentMethod: 'mpesa',
              paymentReceipt: 'SHK8R2P101',
              createdAt: '2026-11-08T10:00:00.000Z',
              lines: [{ title: 'Inverter Battery 100Ah', quantity: 1, unitPrice: 18500, lineTotal: 18500 }],
            },
          ],
          payments: [
            { id: 1, amount: 23300, payment_method: 'mpesa', receipt_number: 'SHK8R2P101', payment_date: '2026-11-08T10:00:00.000Z' },
          ],
          openInvoices: [
            { id: 2, invoiceNumber: 'INV-CR-1001', amountDue: 8500, status: 'overdue', dueDate: '2026-11-10T00:00:00.000Z' },
          ],
        },
      },
    });
  });

  test('renders customers table correctly', async () => {
    const wrapper = mount(Customers, {
      global: {
        stubs: {
          ...BASE_STUBS,
          'a-table': {
            props: ['dataSource'],
            template: '<div><div v-for="item in dataSource" :key="item.id">{{ item.name }}</div></div>',
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.html()).toContain('John Doe');
    expect(wrapper.html()).toContain('Jane Smith');
  });

  test('renders segment chips and filters by segment on click', async () => {
    const wrapper = mount(Customers, {
      global: {
        stubs: {
          ...BASE_STUBS,
          'a-table': {
            props: ['dataSource'],
            template: '<div><div v-for="item in dataSource" :key="item.id">{{ item.name }}</div></div>',
          },
        },
      },
    });

    await flushPromises();

    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.map((t) => t.text())).toEqual([
      'All2',
      'Owes Money1',
      'VIP1',
      'Regular0',
      'New1',
      'Lapsing0',
      'No Purchases0',
    ]);

    const vipTab = tabs.find((t) => t.text().includes('VIP'));
    await vipTab.trigger('click');
    await flushPromises();

    const lastCall = api.getCustomers.mock.calls.at(-1);
    expect(lastCall[5]).toBe('vip');
  });

  test('opens Customer 360 drawer with orders, open invoices, M-Pesa receipt, and next step', async () => {
    const wrapper = mount(Customers, {
      global: {
        stubs: {
          ...BASE_STUBS,
          'a-table': {
            props: ['dataSource', 'columns'],
            template: `
              <div>
                <div v-for="item in dataSource" :key="item.id">
                  <slot name="bodyCell" :column="{ key: 'name' }" :record="item" />
                </div>
              </div>
            `,
          },
        },
      },
    });

    await flushPromises();

    await wrapper.find('.customer-row-name-btn').trigger('click');
    await flushPromises();

    expect(api.getCustomerSummary).toHaveBeenCalledWith(1);
    const drawer = wrapper.find('[data-testid="c360-drawer"]');
    expect(drawer.exists()).toBe(true);
    const text = drawer.text();
    expect(text).toContain('John owes KES 8,500');
    expect(text).toContain('31,850');
    expect(text).toContain('Inverter Battery 100Ah');
    expect(text).toContain('SHK8R2P101');
    expect(text).toContain('INV-CR-1001');
  });
});
