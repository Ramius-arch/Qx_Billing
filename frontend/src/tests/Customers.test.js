import { mount } from '@vue/test-utils';
import Customers from '../../src/pages/Customers.vue';
import { expect, test, vi } from 'vitest';
import api from '../../src/services/api';

vi.mock('../../src/services/api');

const mockCustomers = [
  { id: 1, name: 'John Doe', phone: '111-222-3333', address: '123 Main St' },
  { id: 2, name: 'Jane Smith', phone: '444-555-6666', address: '456 Oak Ave' },
];

api.getCustomers.mockResolvedValue({ data: mockCustomers });

test('renders customers table correctly', async () => {
  const wrapper = mount(Customers);

  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();

  expect(wrapper.find('h1').text()).toContain('Customer Management');
  expect(wrapper.html()).toContain('John Doe');
  expect(wrapper.html()).toContain('Jane Smith');
});

test('adds a new customer', async () => {
  api.addCustomer.mockResolvedValue({ data: { id: 3, name: 'New Customer', phone: '123-123-1234', address: 'New Address' } });
  
  const wrapper = mount(Customers);
  
  await wrapper.find('input[type="text"]').setValue('New Customer');
  await wrapper.find('input[type="tel"]').setValue('123-123-1234');
  await wrapper.find('textarea').setValue('New Address');
  await wrapper.find('form').trigger('submit.prevent');

  expect(api.addCustomer).toHaveBeenCalledWith({
    name: 'New Customer',
    phone: '123-123-1234',
    address: 'New Address',
  });
});
