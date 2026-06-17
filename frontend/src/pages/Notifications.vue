<template>
  <div class="notifications-page">
    <a-typography-title :level="2">Notifications</a-typography-title>
    <a-card title="System & Activity Alerts" class="shadow-sm rounded-xl">
      <a-list item-layout="horizontal" :data-source="notifications">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.message">
              <template #title>
                <div class="flex justify-between items-center">
                  <span>{{ item.title }}</span>
                  <a-tag :color="getTypeColor(item.type)">{{ item.type.toUpperCase() }}</a-tag>
                </div>
              </template>
              <template #avatar>
                <a-avatar :style="{ backgroundColor: getTypeColor(item.type) }">
                  <component :is="getIcon(item.type)" />
                </a-avatar>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { 
  UserAddOutlined, 
  TransactionOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'Notifications',
  components: { UserAddOutlined, TransactionOutlined, InfoCircleOutlined },
  setup() {
    const notifications = ref([
      { id: 1, title: 'New Registration', message: 'Customer John Doe has registered.', type: 'registration' },
      { id: 2, title: 'New Transaction', message: 'Invoice #INV-9022 paid via M-Pesa.', type: 'transaction' },
      { id: 3, title: 'System Update', message: 'Scheduled maintenance completed.', type: 'system_update' }
    ]);

    const getTypeColor = (type) => {
      const colors = { registration: 'blue', transaction: 'green', system_update: 'orange' };
      return colors[type] || 'default';
    };

    const getIcon = (type) => {
      const icons = { registration: UserAddOutlined, transaction: TransactionOutlined, system_update: InfoCircleOutlined };
      return icons[type];
    };

    return { notifications, getTypeColor, getIcon };
  }
});
</script>

<style scoped>
.notifications-page { padding: 24px; max-width: 800px; margin: 0 auto; }
</style>
