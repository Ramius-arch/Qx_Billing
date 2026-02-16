<template>
  <div class="customers-page">
    <div class="header-actions mb-24">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search by name, email, or phone..."
        style="width: 320px"
        @search="fetchCustomers"
        allow-clear
      />
      <a-button type="primary" size="large" @click="showAddModal">
        <template #icon><plus-outlined /></template>
        Add Customer
      </a-button>
    </div>

    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="customers"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'plan'">
            <a-tag color="blue">{{ record.Plan ? record.Plan.name : 'N/A' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusTagColor(record.status)">
              {{ record.status.toUpperCase() }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="middle">
              <a-tooltip title="Edit Customer">
                <a-button type="text" @click="editCustomer(record)">
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
                  <a-button type="text" danger>
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </a-space>
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
    >
      <a-form :model="formState" layout="vertical" ref="formRef">
        <a-form-item
          label="Full Name"
          name="name"
          :rules="[{ required: true, message: 'Please input full name!' }]"
        >
          <a-input v-model:value="formState.name" placeholder="John Doe" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="Phone Number"
              name="phone_number"
              :rules="[{ required: true, message: 'Please input phone number!' }]"
            >
              <a-input v-model:value="formState.phone_number" placeholder="2547XXXXXXXX" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="Email Address"
              name="email"
              :rules="[{ type: 'email', message: 'Please enter a valid email!' }]"
            >
              <a-input v-model:value="formState.email" placeholder="john@example.com" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          label="Physical Address"
          name="address"
          :rules="[{ required: true, message: 'Please input address!' }]"
        >
          <a-textarea v-model:value="formState.address" :rows="3" placeholder="Street, Building, City" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="Subscription Plan"
              name="planId"
              :rules="[{ required: true, message: 'Please select a plan!' }]"
            >
              <a-select v-model:value="formState.planId" placeholder="Select a plan">
                <a-select-option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }} (KSh {{ plan.price }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Account Status" name="status">
              <a-select v-model:value="formState.status">
                <a-select-option value="active">Active</a-select-option>
                <a-select-option value="inactive">Inactive</a-select-option>
                <a-select-option value="suspended">Suspended</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined 
} from '@ant-design/icons-vue';
import api from '../services/api';
import { message } from 'ant-design-vue';

const columns = [
  { title: 'Customer Name', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Email Address', dataIndex: 'email', key: 'email', sorter: true },
  { title: 'Phone', dataIndex: 'phone_number', key: 'phone', sorter: true },
  { title: 'Current Plan', key: 'plan', width: 120 },
  { title: 'Status', key: 'status', width: 120 },
  { title: 'Actions', key: 'action', width: 100 },
];

export default defineComponent({
  name: 'Customers',
  components: {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
  },
  setup() {
    const customers = ref([]);
    const plans = ref([]);
    const loading = ref(false);
    const modalVisible = ref(false);
    const modalConfirmLoading = ref(false);
    const isEditing = ref(false);
    const formRef = ref(null);
    const searchQuery = ref('');
    const formState = reactive({
      id: null,
      name: '',
      phone_number: '',
      email: '',
      address: '',
      planId: null,
      status: 'active',
    });

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
        customers.value = response.data.customers;
        pagination.total = response.data.totalItems;
      } catch (error) {
        message.error('Database connection failed.');
      } finally {
        loading.value = false;
      }
    };

    const fetchPlans = async () => {
      const response = await api.getPlans();
      plans.value = response.data;
    };

    const handleTableChange = (pag, filters, sorter) => {
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
          if (isEditing.value) {
            await api.updateCustomer(formState.id, formState);
            message.success('Account updated successfully.');
          } else {
            await api.addCustomer(formState);
            message.success('New customer registered.');
          }
          modalVisible.value = false;
          fetchCustomers();
        } catch (error) {
          message.error(error.response?.data?.error || 'Operation failed');
        } finally {
          modalConfirmLoading.value = false;
        }
      });
    };

    const handleDelete = async (id) => {
      try {
        await api.deleteCustomer(id);
        message.success('Customer record purged.');
        fetchCustomers();
      } catch (error) {
        message.error('Deletion failed.');
      }
    };

    const getStatusTagColor = (status) => {
      const colors = {
        active: 'success',
        inactive: 'default',
        suspended: 'error',
      };
      return colors[status] || 'default';
    };

    fetchCustomers();
    fetchPlans();

    return {
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
      fetchCustomers,
      handleTableChange,
      showAddModal,
      editCustomer,
      handleModalOk,
      handleDelete,
      getStatusTagColor,
    };
  },
});
</script>

<style scoped>
.customers-page {
  max-width: 1200px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-24 { margin-bottom: 24px; }

.table-card {
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fcfcfc !important;
  font-weight: 600;
}
</style>

