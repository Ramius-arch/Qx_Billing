<template>
  <div class="page-inner max-w-[1300px] mx-auto px-4 py-2 space-y-5 font-sans">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
            DIRECTORY
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Customer 360, Segments &amp; M-Pesa Balances
          </span>
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          Customers
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 mb-0">
          Click any shopper to inspect purchase history, overdue dues, and suggested follow-ups.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="Search name, 07xx phone, estate..."
          class="w-full sm:w-72"
          @search="onSearchTrigger"
          allow-clear
        />
        <button
          type="button"
          class="archive-toggle-btn font-mono"
          :class="{ active: includeArchived }"
          @click="toggleArchived"
          title="Include archived customers"
        >
          <inbox-outlined />
          <span>Archived</span>
        </button>
        <a-button type="primary" @click="showAddModal" class="h-10 px-4 font-bold bg-indigo-600 flex items-center gap-1.5 flex-shrink-0">
          <template #icon><plus-outlined /></template>
          <span>Add Customer</span>
        </a-button>
      </div>
    </div>

    <!-- Plain-Language Segment Filter Bar -->
    <div class="segment-filter-bar" role="tablist" aria-label="Customer segments">
      <button
        v-for="chip in segmentChips"
        :key="chip.key"
        type="button"
        role="tab"
        :aria-selected="activeSegment === chip.key"
        class="segment-chip"
        :class="[
          { active: activeSegment === chip.key },
          chip.tone === 'debt' && chip.count > 0 ? 'chip-debt' : ''
        ]"
        @click="selectSegment(chip.key)"
      >
        <span>{{ chip.label }}</span>
        <span class="segment-count font-mono">{{ chip.count }}</span>
      </button>
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
              <button
                type="button"
                class="customer-avatar-badge font-mono font-bold"
                @click="openCustomer360(record)"
                :title="'Open 360 profile for ' + record.name"
              >
                {{ ((record.name || 'C').charAt(0)).toUpperCase() }}
              </button>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    class="customer-row-name-btn text-sm font-bold"
                    @click="openCustomer360(record)"
                  >
                    {{ record.name || ('Customer #' + (record.id || 'Walk-in')) }}
                  </button>
                  <span
                    v-if="record.insights?.segmentLabel"
                    class="seg-badge font-mono"
                    :class="'seg-' + record.insights.segment"
                  >
                    {{ record.insights.segmentLabel }}
                  </span>
                  <span v-if="record.status === 'archived'" class="archived-badge font-mono">
                    ARCHIVED
                  </span>
                </div>
                <span class="customer-row-address font-mono text-xs block mt-0.5">
                  {{ record.address || 'Location not recorded' }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'phone'">
            <span class="customer-row-phone font-mono text-xs">
              {{ formatPhoneDisplay(record.phone_number || record.phone) }}
            </span>
          </template>

          <template v-else-if="column.key === 'lifetimeSpend'">
            <div class="text-right">
              <span class="customer-row-money font-mono text-xs font-extrabold block">
                {{ record.insights ? ('KES ' + formatKes(record.insights.lifetimeSpend)) : '—' }}
              </span>
              <span v-if="record.insights" class="customer-row-sub font-mono text-[11px] block">
                {{ record.insights.orderCount }} {{ record.insights.orderCount === 1 ? 'order' : 'orders' }}
              </span>
            </div>
          </template>

          <template v-else-if="column.key === 'lastPurchaseAt'">
            <span class="customer-row-sub font-mono text-xs">
              {{ record.insights ? formatLastPurchase(record.insights.daysSinceLastPurchase) : '—' }}
            </span>
          </template>

          <template v-else-if="column.key === 'balanceDue'">
            <div class="text-right">
              <span
                v-if="(record.insights?.balanceDue || 0) > 0"
                class="debt-pill font-mono"
              >
                KES {{ formatKes(record.insights.balanceDue) }}
              </span>
              <span v-else class="settled-text font-mono text-xs">Settled</span>
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="flex items-center justify-center gap-1.5">
              <button
                type="button"
                @click="openCustomer360(record)"
                title="Open Customer 360 profile"
                class="btn-row-view"
              >
                <niche-icon name="customer" :size="13" />
                <span>360</span>
              </button>

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
                v-if="record.status !== 'archived'"
                title="Archive this customer? Their purchase & M-Pesa history stays preserved."
                ok-text="Archive"
                cancel-text="No"
                @confirm="handleDelete(record.id)"
              >
                <a-tooltip title="Archive Customer">
                  <a-button type="text" size="small" danger class="btn-icon-action">
                    <template #icon><inbox-outlined /></template>
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
              :rules="[{ required: true, message: 'Please input M-Pesa phone number (e.g. 0712 345 678).' }]"
            >
              <a-input v-model:value="formState.phone_number" placeholder="0712 345 678 or +254 712 345 678" />
            </a-form-item>

            <a-form-item label="Email Address (Optional)" name="email">
              <a-input v-model:value="formState.email" placeholder="customer@biashara.co.ke" />
            </a-form-item>
          </div>

          <a-form-item label="Delivery Address / Estate (Optional)" name="address">
            <a-input v-model:value="formState.address" placeholder="e.g. Kilimani, Wood Avenue Apt 4B" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- Customer 360 Drawer -->
    <customer360-drawer
      :open="drawerOpen"
      :loading="drawerLoading"
      :summary="customerSummary"
      :is-mobile="isMobile"
      @close="drawerOpen = false"
      @edit="editFromDrawer"
      @bill="billCustomer"
      @archive="archiveFromDrawer"
    />
  </div>
</template>

<script>
import { defineComponent, ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  PlusOutlined,
  EditOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue';
import api from '../services/api';
import { isSimpleMode, isProMode } from '../services/cockpitMode';
import { message } from 'ant-design-vue';
import NicheIcon from '../components/NicheIcon.vue';
import Customer360Drawer from '../components/Customer360Drawer.vue';

const columns = [
  { title: 'Customer', dataIndex: 'name', key: 'name', sorter: true },
  { title: 'Phone (M-Pesa)', dataIndex: 'phone_number', key: 'phone', sorter: true },
  { title: 'Lifetime Spend', key: 'lifetimeSpend', sorter: true, align: 'right', width: 150 },
  { title: 'Last Purchase', key: 'lastPurchaseAt', sorter: true, width: 130 },
  { title: 'Balance Owed', key: 'balanceDue', sorter: true, align: 'right', width: 140 },
  { title: 'Quick Actions', key: 'action', width: 290, align: 'center' },
];

export default defineComponent({
  name: 'Customers',
  components: {
    PlusOutlined,
    EditOutlined,
    InboxOutlined,
    NicheIcon,
    Customer360Drawer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const customers = ref([]);
    const plans = ref([]);
    const segmentCounts = ref({
      all: 0,
      owes_money: 0,
      vip: 0,
      regular: 0,
      new: 0,
      lapsing: 0,
      no_purchases: 0,
    });
    const activeSegment = ref('');
    const includeArchived = ref(false);
    const sortState = reactive({ field: 'id', order: 'asc' });

    const loading = ref(false);
    const modalVisible = ref(false);
    const modalConfirmLoading = ref(false);
    const isEditing = ref(false);
    const formRef = ref(null);

    const drawerOpen = ref(false);
    const drawerLoading = ref(false);
    const customerSummary = ref(null);

    const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const onResize = () => {
      windowWidth.value = window.innerWidth;
    };
    onMounted(() => {
      if (typeof window !== 'undefined') window.addEventListener('resize', onResize);
    });
    onBeforeUnmount(() => {
      if (typeof window !== 'undefined') window.removeEventListener('resize', onResize);
    });
    const isMobile = computed(() => windowWidth.value < 768);

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

    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} customers`,
    });

    const segmentChips = computed(() => [
      { key: '', label: 'All', count: segmentCounts.value.all ?? customers.value.length },
      { key: 'owes_money', label: 'Owes Money', count: segmentCounts.value.owes_money ?? 0, tone: 'debt' },
      { key: 'vip', label: 'VIP', count: segmentCounts.value.vip ?? 0 },
      { key: 'regular', label: 'Regular', count: segmentCounts.value.regular ?? 0 },
      { key: 'new', label: 'New', count: segmentCounts.value.new ?? 0 },
      { key: 'lapsing', label: 'Lapsing', count: segmentCounts.value.lapsing ?? 0 },
      { key: 'no_purchases', label: 'No Purchases', count: segmentCounts.value.no_purchases ?? 0 },
    ]);

    const formatKes = (val) => Math.round(Number(val) || 0).toLocaleString('en-KE');

    const formatPhoneDisplay = (raw) => {
      if (!raw) return '-';
      const digits = String(raw).replace(/\D/g, '');
      if (digits.startsWith('254') && digits.length === 12) {
        return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
      }
      return raw;
    };

    const formatLastPurchase = (days) => {
      if (days === null || days === undefined) return 'Never';
      if (days <= 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
    };

    const fetchCustomers = async () => {
      loading.value = true;
      try {
        const response = await api.getCustomers(
          pagination.current,
          pagination.pageSize,
          searchQuery.value,
          sortState.field,
          sortState.order,
          activeSegment.value,
          includeArchived.value
        );
        const rows = response.data?.customers || response.data || [];
        customers.value = Array.isArray(rows) ? rows : [];
        pagination.total = response.data?.totalItems ?? customers.value.length;
        if (response.data?.segmentCounts) {
          segmentCounts.value = { ...segmentCounts.value, ...response.data.segmentCounts };
        }
      } catch (error) {
        console.warn('Customer load fallback');
        customers.value = [];
      } finally {
        loading.value = false;
      }
    };

    const onSearchTrigger = () => {
      pagination.current = 1;
      fetchCustomers();
    };

    const selectSegment = (key) => {
      activeSegment.value = key;
      pagination.current = 1;
      fetchCustomers();
    };

    const toggleArchived = () => {
      includeArchived.value = !includeArchived.value;
      pagination.current = 1;
      fetchCustomers();
    };

    const handleTableChange = (pag, _filters, sorter) => {
      pagination.current = pag.current;
      pagination.pageSize = pag.pageSize;

      if (sorter && sorter.order) {
        const colMap = { phone: 'phone_number' };
        const rawKey = sorter.columnKey || sorter.field || 'id';
        sortState.field = colMap[rawKey] || rawKey;
        sortState.order = sorter.order === 'descend' ? 'desc' : 'asc';
      } else {
        sortState.field = 'id';
        sortState.order = 'asc';
      }

      fetchCustomers();
    };

    const openCustomer360 = async (record) => {
      if (!record?.id) return;
      drawerOpen.value = true;
      drawerLoading.value = true;
      try {
        const res = await api.getCustomerSummary(record.id);
        customerSummary.value = res.data?.data || res.data || null;
      } catch (err) {
        message.error(err.response?.data?.error || 'Could not load customer profile.');
        drawerOpen.value = false;
      } finally {
        drawerLoading.value = false;
      }
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
      Object.assign(formState, {
        id: record.id,
        name: record.name || '',
        phone_number: record.phone_number || '',
        email: record.email || '',
        address: record.address || '',
        planId: record.planId ?? null,
        status: record.status || 'active',
      });
      modalVisible.value = true;
    };

    const editFromDrawer = (customer) => {
      editCustomer(customer);
    };

    const handleModalOk = () => {
      formRef.value.validate().then(async () => {
        modalConfirmLoading.value = true;
        try {
          const payload = { ...formState };
          if (isEditing.value) {
            await api.updateCustomer(payload.id, payload);
            message.success('Customer profile updated.');
          } else {
            delete payload.id;
            await api.addCustomer(payload);
            message.success('New customer registered.');
          }
          modalVisible.value = false;
          await fetchCustomers();
          if (drawerOpen.value && isEditing.value && customerSummary.value?.customer?.id === formState.id) {
            await openCustomer360({ id: formState.id });
          }
        } catch (error) {
          message.error(error.response?.data?.error || error.message || 'Could not save customer.');
        } finally {
          modalConfirmLoading.value = false;
        }
      });
    };

    const handleDelete = async (id) => {
      try {
        await api.deleteCustomer(id);
        message.success('Customer archived (purchase history preserved).');
        await fetchCustomers();
      } catch (e) {
        message.error(e.response?.data?.error || 'Could not archive customer.');
      }
    };

    const archiveFromDrawer = async (id) => {
      await handleDelete(id);
      drawerOpen.value = false;
    };

    const openCustomerWhatsApp = (record) => {
      const phone = (record.phone_number || '').replace(/[^0-9]/g, '');
      if (!phone) return message.warning('No phone number recorded for customer.');
      const firstName = (record.name || 'valued customer').split(' ')[0];
      const owed = record.insights?.balanceDue || 0;
      const text = owed > 0
        ? `Hello ${firstName}, friendly reminder of your open balance of KES ${formatKes(owed)} at Ladha Store.`
        : `Hello ${firstName}! Greetings from Ladha Store.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const billCustomer = (record) => {
      router.push({ path: '/invoice-generator', query: { customerId: record.id } });
    };

    watch(() => route.query.search, () => {
      pagination.current = 1;
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
      segmentChips,
      activeSegment,
      includeArchived,
      drawerOpen,
      drawerLoading,
      customerSummary,
      formatKes,
      formatPhoneDisplay,
      formatLastPurchase,
      fetchCustomers,
      onSearchTrigger,
      selectSegment,
      toggleArchived,
      handleTableChange,
      openCustomer360,
      showAddModal,
      editCustomer,
      editFromDrawer,
      handleModalOk,
      handleDelete,
      archiveFromDrawer,
      openCustomerWhatsApp,
      billCustomer,
    };
  },
});
</script>

<style scoped>
.segment-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.segment-chip {
  --seg-bg: #ffffff;
  --seg-color: #334155;
  --seg-border: #e2e8f0;
  --seg-cnt-bg: #f1f5f9;
  --seg-cnt-color: #475569;

  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  background: var(--seg-bg);
  color: var(--seg-color);
  border: 1px solid var(--seg-border);
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-chip:hover {
  border-color: #6366f1;
}

.segment-chip.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.segment-chip.active .segment-count {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.segment-chip.chip-debt:not(.active) {
  border-color: #fcd34d;
  background: #fffbeb;
  color: #92400e;
}

.segment-count {
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 800;
  background: var(--seg-cnt-bg);
  color: var(--seg-cnt-color);
}

:root[data-theme='dark'] .segment-chip,
[data-theme='dark'] .segment-chip {
  --seg-bg: #0f172a;
  --seg-color: #cbd5e1;
  --seg-border: rgba(255, 255, 255, 0.1);
  --seg-cnt-bg: rgba(255, 255, 255, 0.08);
  --seg-cnt-color: #e2e8f0;
}

:root[data-theme='dark'] .segment-chip.chip-debt:not(.active),
[data-theme='dark'] .segment-chip.chip-debt:not(.active) {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fde68a;
}

:root[data-theme='dark'] .segment-chip.active,
[data-theme='dark'] .segment-chip.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #6366f1;
}

.archive-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
}
.archive-toggle-btn.active {
  background: #334155;
  color: #ffffff;
  border-color: #334155;
}
:root[data-theme='dark'] .archive-toggle-btn,
[data-theme='dark'] .archive-toggle-btn {
  background: #0f172a;
  color: #94a3b8;
  border-color: rgba(255, 255, 255, 0.12);
}
:root[data-theme='dark'] .archive-toggle-btn.active,
[data-theme='dark'] .archive-toggle-btn.active {
  background: rgba(99, 102, 241, 0.25);
  color: #e0e7ff;
  border-color: rgba(129, 140, 248, 0.45);
}

.customer-table-card {
  --tbl-bg: #ffffff;
  --tbl-border: rgba(226, 232, 240, 0.95);
  --tbl-shadow:
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 0 0 1px rgba(255, 255, 255, 0.65),
    0 2px 10px rgba(15, 23, 42, 0.03),
    0 18px 40px -8px rgba(15, 23, 42, 0.05);

  --th-bg: #f8fafc;
  --th-color: #334155;
  --th-border: #e2e8f0;

  --td-border: #f1f5f9;
  --row-hover-bg: rgba(99, 102, 241, 0.05);

  --row-name-color: #0f172a;
  --row-addr-color: #475569;
  --row-phone-color: #0f172a;

  --avatar-bg: #e0e7ff;
  --avatar-color: #3730a3;
  --avatar-border: #c7d2fe;

  --btn-view-bg: #f8fafc;
  --btn-view-color: #334155;
  --btn-view-border: #cbd5e1;
  --btn-view-hover-bg: #f1f5f9;

  --btn-wa-bg: #ecfdf5;
  --btn-wa-color: #065f46;
  --btn-wa-border: #a7f3d0;
  --btn-wa-hover-bg: #d1fae5;

  --btn-bill-bg: #eef2ff;
  --btn-bill-color: #3730a3;
  --btn-bill-border: #c7d2fe;
  --btn-bill-hover-bg: #e0e7ff;

  --btn-icon-color: #475569;
  --btn-icon-hover-color: #0f172a;

  --pagination-color: #334155;
  --pagination-item-bg: #ffffff;
  --pagination-item-border: #e2e8f0;

  background: var(--tbl-bg) !important;
  border: 1px solid var(--tbl-border) !important;
  border-radius: 20px !important;
  box-shadow: var(--tbl-shadow) !important;
  overflow: hidden;
}

:root[data-theme='dark'] .customer-table-card,
[data-theme='dark'] .customer-table-card {
  --tbl-bg: #0b1120;
  --tbl-border: rgba(255, 255, 255, 0.08);
  --tbl-shadow:
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.10),
    0 16px 44px -8px rgba(0, 0, 0, 0.65);

  --th-bg: #070c18;
  --th-color: #94a3b8;
  --th-border: rgba(255, 255, 255, 0.08);

  --td-border: rgba(255, 255, 255, 0.05);
  --row-hover-bg: rgba(99, 102, 241, 0.12);

  --row-name-color: #ffffff;
  --row-addr-color: #94a3b8;
  --row-phone-color: #f1f5f9;

  --avatar-bg: rgba(49, 46, 129, 0.6);
  --avatar-color: #c7d2fe;
  --avatar-border: rgba(99, 102, 241, 0.35);

  --btn-view-bg: rgba(255, 255, 255, 0.06);
  --btn-view-color: #e2e8f0;
  --btn-view-border: rgba(255, 255, 255, 0.14);
  --btn-view-hover-bg: rgba(255, 255, 255, 0.12);

  --btn-wa-bg: rgba(6, 95, 70, 0.35);
  --btn-wa-color: #6ee7b7;
  --btn-wa-border: rgba(16, 185, 129, 0.35);
  --btn-wa-hover-bg: rgba(6, 95, 70, 0.6);

  --btn-bill-bg: rgba(55, 48, 163, 0.35);
  --btn-bill-color: #c7d2fe;
  --btn-bill-border: rgba(99, 102, 241, 0.35);
  --btn-bill-hover-bg: rgba(55, 48, 163, 0.6);

  --btn-icon-color: #94a3b8;
  --btn-icon-hover-color: #ffffff;

  --pagination-color: #94a3b8;
  --pagination-item-bg: #0f172a;
  --pagination-item-border: rgba(255, 255, 255, 0.1);
}

.customer-avatar-badge {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--avatar-bg);
  color: var(--avatar-color);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--avatar-border);
  flex-shrink: 0;
  cursor: pointer;
}

.customer-row-name-btn {
  background: transparent;
  border: none;
  padding: 0;
  text-align: left;
  font-weight: 800;
  color: var(--row-name-color) !important;
  letter-spacing: -0.015em;
  cursor: pointer;
}
.customer-row-name-btn:hover {
  text-decoration: underline;
  color: #6366f1 !important;
}

.customer-row-address,
.customer-row-sub {
  color: var(--row-addr-color) !important;
}

.customer-row-phone,
.customer-row-money {
  font-weight: 700;
  color: var(--row-phone-color) !important;
}

.seg-badge,
.archived-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.seg-badge.seg-vip { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.seg-badge.seg-regular { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.seg-badge.seg-new { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
.seg-badge.seg-lapsing { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.seg-badge.seg-no_purchases,
.archived-badge { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

:root[data-theme='dark'] .seg-badge.seg-vip,
[data-theme='dark'] .seg-badge.seg-vip { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border-color: rgba(245, 158, 11, 0.4); }
:root[data-theme='dark'] .seg-badge.seg-regular,
[data-theme='dark'] .seg-badge.seg-regular { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.35); }
:root[data-theme='dark'] .seg-badge.seg-new,
[data-theme='dark'] .seg-badge.seg-new { background: rgba(99, 102, 241, 0.22); color: #c7d2fe; border-color: rgba(129, 140, 248, 0.4); }
:root[data-theme='dark'] .seg-badge.seg-lapsing,
[data-theme='dark'] .seg-badge.seg-lapsing { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }
:root[data-theme='dark'] .seg-badge.seg-no_purchases,
[data-theme='dark'] .seg-badge.seg-no_purchases,
:root[data-theme='dark'] .archived-badge,
[data-theme='dark'] .archived-badge { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.3); }

.debt-pill {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 800;
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
:root[data-theme='dark'] .debt-pill,
[data-theme='dark'] .debt-pill {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
}
.settled-text {
  color: #059669;
  font-weight: 700;
}
:root[data-theme='dark'] .settled-text,
[data-theme='dark'] .settled-text {
  color: #34d399;
}

.btn-row-view,
.btn-row-whatsapp,
.btn-row-bill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-row-view {
  background: var(--btn-view-bg);
  color: var(--btn-view-color);
  border: 1px solid var(--btn-view-border);
}
.btn-row-view:hover {
  background: var(--btn-view-hover-bg);
  transform: translateY(-1px);
}
.btn-row-whatsapp {
  background: var(--btn-wa-bg);
  color: var(--btn-wa-color);
  border: 1px solid var(--btn-wa-border);
}
.btn-row-whatsapp:hover {
  background: var(--btn-wa-hover-bg);
  transform: translateY(-1px);
}
.btn-row-bill {
  background: var(--btn-bill-bg);
  color: var(--btn-bill-color);
  border: 1px solid var(--btn-bill-border);
}
.btn-row-bill:hover {
  background: var(--btn-bill-hover-bg);
  transform: translateY(-1px);
}

.btn-icon-action {
  color: var(--btn-icon-color) !important;
  transition: color 0.15s ease;
}
.btn-icon-action:hover {
  color: var(--btn-icon-hover-color) !important;
}

:deep(.ant-table),
:deep(.ant-table-container),
:deep(.ant-table-content) {
  background: transparent !important;
}

:deep(.ant-table-thead > tr > th) {
  background: var(--th-bg) !important;
  color: var(--th-color) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid var(--th-border) !important;
  padding: 14px 16px !important;
}

:deep(.ant-table-thead th.ant-table-cell::before) {
  display: none !important;
}

:deep(.ant-table-tbody > tr > td) {
  background: transparent !important;
  border-bottom: 1px solid var(--td-border) !important;
  padding: 15px 16px !important;
  transition: background 0.15s ease !important;
}

:deep(.ant-table-tbody > tr:hover > td),
:deep(.ant-table-tbody > tr.ant-table-row-hover > td),
:deep(.ant-table-tbody > tr.ant-table-row-selected > td) {
  background: var(--row-hover-bg) !important;
}

:deep(.ant-pagination) {
  margin: 16px 18px !important;
  color: var(--pagination-color) !important;
}
:deep(.ant-pagination-item) {
  background: var(--pagination-item-bg) !important;
  border-color: var(--pagination-item-border) !important;
}
:deep(.ant-pagination-item a) {
  color: var(--pagination-color) !important;
}
:deep(.ant-pagination-item-active) {
  border-color: #6366f1 !important;
  background: #6366f1 !important;
}
:deep(.ant-pagination-item-active a) {
  color: #ffffff !important;
}
:deep(.ant-pagination-prev .ant-pagination-item-link),
:deep(.ant-pagination-next .ant-pagination-item-link) {
  background: var(--pagination-item-bg) !important;
  border-color: var(--pagination-item-border) !important;
  color: var(--pagination-color) !important;
}
:deep(.ant-pagination-total-text) {
  color: var(--pagination-color) !important;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
}
</style>
