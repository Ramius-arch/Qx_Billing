<template>
  <div class="billing-container">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Billing Engine</h1>
    </header>

    <!-- Bill Calculation Form -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-bold mb-4">Calculate Bill</h2>
      <form @submit.prevent="calculateBill" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Customer:</label>
          <select
            v-model="selectedCustomer"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option :value="customer.id" v-for="customer in customers" :key="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Plan:</label>
          <select
            v-model="selectedPlan"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option :value="plan.id" v-for="plan in plans" :key="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>


        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Calculate Bill
        </button>
      </form>
    </div>

    <!-- Bill Summary -->
    <div v-if="billSummary" class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-bold mb-4">Bill Summary</h2>
      <div class="space-y-2">
        <p><strong>Customer ID:</strong> {{ billSummary.customerId }}</p>
        <p><strong>Plan ID:</strong> {{ billSummary.planId }}</p>
        <p><strong>Amount:</strong> {{ formatCurrency(billSummary.amount) }}</p>
        <p><strong>Date:</strong> {{ new Date(billSummary.date).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'BillingEngine',
  data() {
    return {
      customers: [],
      plans: [],
      selectedCustomer: '',
      selectedPlan: '',
      billSummary: null,
    };
  },
  created() {
    this.fetchCustomers();
    this.fetchPlans();
  },
  methods: {
    async fetchCustomers() {
      try {
        // Fetch all customers for the dropdown, assuming a large enough page size or backend handles non-paginated request for dropdowns
        const response = await api.getCustomers(1, 9999);
        this.customers = response.data.customers; // Access the customers array from the paginated response
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    },
    async fetchPlans() {
      try {
        const response = await api.getPlans();
        this.plans = response.data;
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    },
    async calculateBill() {
      if (!this.selectedCustomer) {
        alert('Please select a customer.');
        return;
      }
      try {
        const response = await api.generateBill(this.selectedCustomer);
        this.billSummary = response.data;
      } catch (error) {
        console.error('Error calculating bill:', error);
      }
    },
    formatCurrency(value) {
      return `KSh ${value.toLocaleString()}`;
    },
  },
};
</script>
