<template>
  <div class="customers-container">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Customer Management</h1>
    </header>

    <!-- Customer Form -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name:</label>
          <input
            type="text"
            v-model="newCustomer.name"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Phone Number:</label>
          <input
            type="tel"
            v-model="newCustomer.phone_number"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Address:</label>
          <textarea
            v-model="newCustomer.address"
            required
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            v-model="newCustomer.email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Plan:</label>
          <select
            v-model="newCustomer.planId"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option v-for="plan in plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
          </select>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ isEditing ? 'Update Customer' : 'Add Customer' }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            @click="cancelEdit"
            class="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Customers Table -->
    <div class="bg-white p-6 rounded-lg shadow">
      <!-- Search Input -->
      <div class="mb-4">
        <input
          type="text"
          v-model="searchQuery"
          @input="fetchCustomers"
          placeholder="Search customers..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortCustomers('name')">
              Name
              <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortCustomers('email')">
              Email
              <span v-if="sortBy === 'email'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortCustomers('phone_number')">
              Phone Number
              <span v-if="sortBy === 'phone_number'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortCustomers('address')">
              Address
              <span v-if="sortBy === 'address'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortCustomers('planId')">
              Plan
              <span v-if="sortBy === 'planId'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.phone_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.address }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.Plan ? customer.Plan.name : 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                class="text-indigo-600 hover:text-indigo-900 mr-2"
                @click="editCustomer(customer)"
              >
                Edit
              </button>
              <button
                class="text-red-600 hover:text-red-900"
                @click="deleteCustomer(customer.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center mt-4">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'Customers',
  data() {
    return {
      customers: [],
      newCustomer: {
        name: '',
        phone_number: '',
        address: '',
        planId: 1, // Default plan for new customers
        email: '',
      },
      editingCustomer: null,
      isEditing: false,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      searchQuery: '', // New: for filtering
      sortBy: 'id', // New: for sorting
      sortOrder: 'asc', // New: for sorting
      plans: [], // To display available plans for new customer
    };
  },
  created() {
    this.fetchCustomers();
    this.fetchPlans(); // Fetch plans for the customer form
  },
  methods: {
    async fetchCustomers() {
      try {
        const response = await api.getCustomers(
          this.currentPage,
          this.pageSize,
          this.searchQuery, // Pass search query
          this.sortBy,       // Pass sort by field
          this.sortOrder     // Pass sort order
        );
        this.customers = response.data.customers;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
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
    sortCustomers(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = column;
        this.sortOrder = 'asc';
      }
      this.fetchCustomers();
    },
    async handleSubmit() {
      if (this.isEditing) {
        await this.updateCustomer();
      } else {
        await this.addCustomer();
      }
    },
    async addCustomer() {
      try {
        // Add planId and email to newCustomer before sending
        const customerToAdd = { ...this.newCustomer, planId: this.newCustomer.planId, email: this.newCustomer.email };
        await api.addCustomer(customerToAdd);
        this.resetForm();
        await this.fetchCustomers();
      } catch (error) {
        console.error('Error adding customer:', error);
      }
    },
    editCustomer(customer) {
      this.isEditing = true;
      this.editingCustomer = { ...customer };
      this.newCustomer = { ...customer };
    },
    async updateCustomer() {
      try {
        // Add planId and email to newCustomer before sending
        const customerToUpdate = { ...this.newCustomer, planId: this.newCustomer.planId, email: this.newCustomer.email };
        await api.updateCustomer(this.editingCustomer.id, customerToUpdate);
        this.resetForm();
        await this.fetchCustomers();
      } catch (error) {
        console.error('Error updating customer:', error);
      }
    },
    async deleteCustomer(id) {
      if (window.confirm('Are you sure you want to delete this customer?')) {
        try {
          await api.deleteCustomer(id);
          await this.fetchCustomers();
        } catch (error) {
          console.error('Error deleting customer:', error);
        }
      }
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchCustomers();
      }
    },
    resetForm() {
      this.newCustomer = {
        name: '',
        phone_number: '',
        address: '',
        planId: 1,
        email: '',
      };
      this.isEditing = false;
      this.editingCustomer = null;
    },
  },
  computed: {
    pages() {
      const pagesArray = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pagesArray.push(i);
      }
      return pagesArray;
    }
  }
};
</script>
