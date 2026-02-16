import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  getCustomers(page = 1, pageSize = 10, search = '', sortBy = 'id', sortOrder = 'asc') {
    return apiClient.get('/customers', {
      params: { page, pageSize, search, sortBy, sortOrder }
    });
  },
  addCustomer(customer) {
    return apiClient.post('/customers', customer);
  },
  getCustomerById(id) {
    return apiClient.get(`/customers/${id}`);
  },
  updateCustomer(id, customer) {
    return apiClient.put(`/customers/${id}`, customer);
  },
  deleteCustomer(id) {
    return apiClient.delete(`/customers/${id}`);
  },
  getCustomerProfile() {
    return apiClient.get('/customers/me'); // Assuming an endpoint for current user profile
  },
  updateCustomerProfile(profileData) {
    return apiClient.put('/customers/me/update-profile', profileData);
  },

  getPlans() {
    return apiClient.get('/plans'); // Assuming a /plans endpoint
  },

  generateBill(customerId) {
    return apiClient.post(`/billing/generate/${customerId}`);
  },

  getUsage() {
    return apiClient.get('/usage');
  },
  addUsage(usage) {
    return apiClient.post('/usage', usage);
  },
  getUsageById(id) {
    return apiClient.get(`/usage/${id}`);
  },
  updateUsage(id, usage) {
    return apiClient.put(`/usage/${id}`, usage);
  },
  deleteUsage(id) {
    return apiClient.delete(`/usage/${id}`);
  },
  getUsageByCustomerId(customerId) {
    return apiClient.get(`/usage/customer/${customerId}`);
  },
  getCallUsage() {
    return apiClient.get('/usage/call');
  },
  getSmsUsage() {
    return apiClient.get('/usage/sms');
  },

  getInvoices() {
    return apiClient.get('/invoices');
  },
  getInvoiceById(id) {
    return apiClient.get(`/invoices/${id}`);
  },
  updateInvoiceStatus(id, status) {
    return apiClient.put(`/invoices/${id}/status`, status);
  },
  generateInvoice(invoiceData) {
    return apiClient.post('/invoices/generate-invoice', invoiceData);
  },
  getCustomerInvoices() {
    return apiClient.get('/invoices/me'); // Assuming an endpoint for current customer's invoices
  },
  downloadInvoicePdf(id) {
    return apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }); // Assuming PDF download
  },

  getPayments() {
    return apiClient.get('/payments');
  },
  getPaymentById(id) {
    return apiClient.get(`/payments/${id}`);
  },
  createPayment(paymentData) {
    return apiClient.post('/payments', paymentData);
  },
  updatePaymentStatus(id, status) {
    return apiClient.put(`/payments/${id}/status`, status);
  },
  deletePayment(id) {
    return apiClient.delete(`/payments/${id}`);
  },
  mpesaCallback(callbackData) {
    return apiClient.post('/payments/mpesa/callback', callbackData);
  },

  // Reports API calls
  reports: {
    getAllCustomersReport() {
      return apiClient.get('/reports/customers');
    },
    getBillingTrends() {
      return apiClient.get('/reports/billing-trends');
    },
    getOutstandingDues() {
      return apiClient.get('/reports/outstanding-dues');
    },
    generateFinancialSummary(data) {
      return apiClient.post('/reports/financial-summary', data);
    },
    getUsageReports() {
      return apiClient.get('/reports/usage-reports');
    },
    getDetailedFinancialReport() {
      return apiClient.get('/reports/detailed-financial');
    },
    getCustomerUsageTrend() {
      return apiClient.get('/reports/customer-usage-trend');
    },
    getTopCustomers() {
      return apiClient.get('/reports/top-customers');
    },
  },

  getBillingForecast(customerId) {
    return apiClient.get(`/billing/forecast/${customerId}`);
  },

  async getDashboardData() {
    const [
      billingTrendsRes,
      usageReportsRes,
      outstandingDuesRes,
      // Add other relevant dashboard data calls here
    ] = await Promise.all([
      apiClient.get('/reports/billing-trends'),
      apiClient.get('/reports/usage-reports'),
      apiClient.get('/reports/outstanding-dues'),
    ]);

    const billingTrends = billingTrendsRes.data.data; // Assuming data is nested under 'data'
    const usageReports = usageReportsRes.data.data;
    const outstandingDues = outstandingDuesRes.data.data;

    return {
      data: {
        totalRevenue: billingTrends.totalRevenue || 0,
        // activeCustomers: usageReports.activeCustomers || 0, // This needs to come from a specific report
        totalDataUsage: usageReports.totalUsageDuration || 0, // Assuming this is the field
        // totalCallDuration: usageReports.totalCallDuration || 0, // This needs to come from a specific report
        recentTransactions: billingTrends.trendData || [], // Using trendData as recent transactions for now
        outstandingDuesSummary: outstandingDues || [],
      }
    };
  },
};

export default api;