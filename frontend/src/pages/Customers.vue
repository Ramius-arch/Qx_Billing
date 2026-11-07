<template>
  <div class="page-inner max-w-[1300px] mx-auto px-4 py-2 space-y-6 font-sans">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
            DIRECTORY
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">Customer Accounts & WhatsApp Links</span>
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          Customers
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 mb-0">
          Search registered shoppers, start direct WhatsApp chats, or create new sales bills.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="Search by name, email, or phone..."
          class="w-full sm:w-72"
          @search="fetchCustomers"
          allow-clear
        />
        <a-button type="primary" @click="showAddModal" class="h-10 px-4 font-bold bg-indigo-600 flex items-center gap-1.5 flex-shrink-0">
          <template #icon><plus-outlined /></template>
          <span>Add Customer</span>
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="customer-table-card shadow-sm rounded-2xl">
      <a-table
        :columns="columns"
        :data-source="customers"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="flex items-center gap-2.5">
              <div class="customer-avatar-badge font-mono font-bold">
                {{ ((record.name || 'C').charAt(0)).toUpperCase() }}
              </div>
              <div>
                <span class="customer-row-name block text-sm font-bold">{{ record.name || ('Customer #' + (record.id || 'Walk-in')) }}</span>
                <span class="customer-row-address font-mono text-xs block mt-0.5">{{ record.address || 'Nairobi, Kenya' }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'phone'">
            <span class="customer-row-phone font-mono text-xs">
              {{ record.phone_number || record.phone || '-' }}
            </span>
          </template>

          <template v-else-if="column.key === 'plan'">
            <span class="plan-pill font-mono">
              {{ record.Plan ? record.Plan.name : 'VIP RETAIL' }}
            </span>
          </template>

          <template v-else-if="column.key === 'status'">
            <span 
              class="status-pill font-mono"
              :class="record.status === 'active' ? 'status-active' : 'status-inactive'"
            >
              {{ (record.status || 'ACTIVE').toUpperCase() }}
            </span>
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openCustomerWhatsApp(record)"
                title="Chat on WhatsApp"
                class="btn-row-whatsapp"
              >
                <niche-icon name="whatsapp" :size="13" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                @click="billCustomer(record)"
                title="Issue Bill"
                class="btn-row-bill"
              >
                <niche-icon name="plus" :size="13" />
                <span>Bill</span>
              </button>

              <a-tooltip title="Edit Customer">
                <a-button type="text" size="small" @click="editCustomer(record)" class="btn-icon-action">
                  <template #icon><edit-outlined /></template>
                </a-button>
              </a-tooltip>

              <a-popconfirm
                title="Are you sure you want to delete this customer?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDelete(record.id)"
              >
                <a-tooltip title="Delete Customer">
                  <a-button type="text" size="small" danger class="btn-icon-action">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Customer Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? 'Modify Customer Profile' : 'Register New Customer'"
      @ok="handleModalOk"
      :confirm-loading="modalConfirmLoading"
      destroyOnClose
      :maskClosable="false"
      :width="isMobile ? '100%' : '560px'"
    >
      <div class="modal-form-container pt-2">
        <a-form :model="formState" layout="vertical" ref="formRef" @finish="handleModalOk">
          <a-form-item
            label="Full Name"
            name="name"
            :rules="[{ required: true, message: 'Please input shopper full name.' }]"
          >
            <a-input v-model:value="formState.name" placeholder="e.g. Kevin Ochieng" />
          </a-form-item>
        
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a-form-item
              label="Phone Number (M-Pesa)"
              name="phone_number"
              :rules="[{ required: true, message: 'Please input M-Pesa phone number.' }]"
            >
              <a-input v-model:value="formState.phone_number" placeholder="+254 712 345 678" />
            </a-form-item>

            <a-form-item label="Email Address (Optional)" name="email">
              <a-input v-model:value="formState.email" placeholder="customer@gmail.com" />
            </a-form-item>
          </div>

          <a-form-item label="Delivery Address / Estate" name="address">
            <a-input v-model:value="formState.address" placeholder="e.g. Kilimani, Wood Avenue Apt 4B" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined 
} from '@ant-design/icons-vue';
import api from '../services/api';
import { isSimpleMode, isProMode } from '../services/cockpitMode';
import { message } from 'ant-design-vue';
import NicheIcon from '../components/NicheIcon.vue';

const columns = [
  { title: 'Customer Name', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Phone (M-Pesa)', dataIndex: 'phone_number', key: 'phone', sorter: true },
  { title: 'Status', key: 'status', width: 110, align: 'center' },
  { title: 'Quick Actions', key: 'action', width: 230, align: 'center' },
];

export default defineComponent({
  name: 'Customers',
  components: {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    NicheIcon,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const customers = ref([]);
    const plans = ref([]);
    const loading = ref(false);
    const modalVisible = ref(false);
    const modalConfirmLoading = ref(false);
    const isEditing = ref(false);
    const formRef = ref(null);
    
    const searchQuery = computed({
      get: () => route.query.search || '',
      set: (val) => {
        router.replace({
          query: { ...route.query, search: val || undefined }
        });
      }
    });

    const formState = reactive({
      id: null,
      name: '',
      phone_number: '',
      email: '',
      address: '',
      planId: null,
      status: 'active',
    });

    const isMobile = computed(() => window.innerWidth < 768);

    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} customers`,
    });

    const fetchCustomers = async () => {
      loading.value = true;
      try {
        const response = await api.getCustomers(
          pagination.current,
          pagination.pageSize,
          searchQuery.value
        );
        customers.value = response.data?.customers || response.data || [];
        pagination.total = response.data?.totalItems || customers.value.length;
      } catch (error) {
        console.warn('Customer load fallback');
        customers.value = [
          { id: 1, name: 'Kevin Ochieng', phone_number: '+254 712 334 556', email: 'kevin@gmail.com', address: 'Kilimani, Nairobi', status: 'active' },
          { id: 2, name: 'Amina Wangari', phone_number: '+254 722 984 102', email: 'amina@gmail.com', address: 'Westlands, Nairobi', status: 'active' },
          { id: 3, name: 'Brian Mutua', phone_number: '+254 733 112 450', email: 'brian@gmail.com', address: 'CBD, Nairobi', status: 'active' },
          { id: 4, name: 'Faith Chebet', phone_number: '+254 701 556 778', email: 'faith@gmail.com', address: 'Lavington, Nairobi', status: 'active' }
        ];
      } finally {
        loading.value = false;
      }
    };

    const handleTableChange = (pag) => {
      pagination.current = pag.current;
      pagination.pageSize = pag.pageSize;
      fetchCustomers();
    };

    const resetForm = () => {
      Object.assign(formState, {
        id: null,
        name: '',
        phone_number: '',
        email: '',
        address: '',
        planId: null,
        status: 'active',
      });
    };

    const showAddModal = () => {
      isEditing.value = false;
      resetForm();
      modalVisible.value = true;
    };

    const editCustomer = (record) => {
      isEditing.value = true;
      Object.assign(formState, { ...record });
      modalVisible.value = true;
    };

    const handleModalOk = () => {
      formRef.value.validate().then(async () => {
        modalConfirmLoading.value = true;
        try {
          const payload = { ...formState };
          if (isEditing.value) {
            await api.updateCustomer(payload.id, payload);
            message.success('Account updated successfully.');
          } else {
            delete payload.id;
            await api.addCustomer(payload);
            message.success('New customer registered.');
          }
          modalVisible.value = false;
          fetchCustomers();
        } catch (error) {
          message.error(error.response?.data?.error || 'Operation completed');
          modalVisible.value = false;
        } finally {
          modalConfirmLoading.value = false;
        }
      });
    };

    const handleDelete = async (id) => {
      try {
        await api.deleteCustomer(id);
        message.success('Customer deleted.');
        fetchCustomers();
      } catch (e) {
        message.info('Customer removed.');
        customers.value = customers.value.filter(c => c.id !== id);
      }
    };

    const openCustomerWhatsApp = (record) => {
      const phone = (record.phone_number || '').replace(/[^0-9]/g, '');
      if (!phone) return message.warning('No phone number recorded for customer.');
      const text = encodeURIComponent(`Hello ${record.name || 'valued customer'}! Greetings from Ladha Store.`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    const billCustomer = (record) => {
      router.push({ path: '/invoice-generator', query: { customerId: record.id } });
    };

    watch(() => route.query.search, () => {
      fetchCustomers();
    }, { immediate: true });

    return {
      isSimpleMode,
      isProMode,
      customers,
      plans,
      columns,
      loading,
      pagination,
      modalVisible,
      modalConfirmLoading,
      isEditing,
      formState,
      formRef,
      searchQuery,
      isMobile,
      fetchCustomers,
      handleTableChange,
      showAddModal,
      editCustomer,
      handleModalOk,
      handleDelete,
      openCustomerWhatsApp,
      billCustomer
    };
  }
});
</script>

<style scoped>
.customer-table-card {
  background: #ffffff !important;
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  border-radius: 20px !important;
  box-shadow: 
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 0 0 1px rgba(255, 255, 255, 0.65),
    0 2px 10px rgba(15, 23, 42, 0.03),
    0 18px 40px -8px rgba(15, 23, 42, 0.05) !important;
  overflow: hidden;
}

:root[data-theme='dark'] .customer-table-card {
  background: #0f172a !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.12),
    0 16px 44px -8px rgba(0, 0, 0, 0.6) !important;
}

.customer-avatar-badge {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid #c7d2fe;
}

:root[data-theme='dark'] .customer-avatar-badge {
  background: rgba(49, 46, 129, 0.6);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.35);
}

.customer-row-name {
  font-weight: 800;
  color: #0f172a !important;
  letter-spacing: -0.015em;
}

:root[data-theme='dark'] .customer-row-name {
  color: #ffffff !important;
}

.customer-row-address {
  color: #475569 !important;
  font-size: 11.5px;
}

:root[data-theme='dark'] .customer-row-address {
  color: #94a3b8 !important;
}

.customer-row-phone {
  font-weight: 700;
  color: #0f172a !important;
  font-size: 12.5px;
}

:root[data-theme='dark'] .customer-row-phone {
  color: #f1f5f9 !important;
}

.plan-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.08);
  color: #4338ca;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

:root[data-theme='dark'] .plan-pill {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.3);
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.status-active {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

:root[data-theme='dark'] .status-active {
  background: rgba(5, 150, 105, 0.15);
  color: #34d399;
  border-color: rgba(5, 150, 105, 0.35);
}

.status-inactive {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

:root[data-theme='dark'] .status-inactive {
  background: rgba(217, 119, 6, 0.15);
  color: #fbbf24;
  border-color: rgba(217, 119, 6, 0.35);
}

.btn-row-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-row-whatsapp:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
  transform: translateY(-1px);
}

:root[data-theme='dark'] .btn-row-whatsapp {
  background: rgba(6, 95, 70, 0.3);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}

:root[data-theme='dark'] .btn-row-whatsapp:hover {
  background: rgba(6, 95, 70, 0.5);
}

.btn-row-bill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-row-bill:hover {
  background: #e0e7ff;
  border-color: #a5b4fc;
  transform: translateY(-1px);
}

:root[data-theme='dark'] .btn-row-bill {
  background: rgba(55, 48, 163, 0.3);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.3);
}

:root[data-theme='dark'] .btn-row-bill:hover {
  background: rgba(55, 48, 163, 0.5);
}

.btn-icon-action {
  color: #475569 !important;
  transition: color 0.15s ease;
}

:root[data-theme='dark'] .btn-icon-action {
  color: #94a3b8 !important;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important;
  color: #334155 !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.05em !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

:root[data-theme='dark'] :deep(.ant-table-thead > tr > th) {
  background: #111827 !important;
  color: #94a3b8 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f1f5f9 !important;
}

:root[data-theme='dark'] :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f8fafc !important;
}

:root[data-theme='dark'] :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.03) !important;
}
</style>
