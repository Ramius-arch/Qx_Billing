<template>
  <div class="help-center-container">
    <a-typography-title :level="2" class="mb-6">Knowledge Base & Support</a-typography-title>

    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :lg="16">
        <a-card title="Frequently Asked Questions" class="standard-card">
          <a-collapse v-model:activeKey="activeFAQKeys" accordion ghost>
            <a-collapse-panel key="1" header="How do I create an invoice?">
              <p>Navigate to <strong>Invoice Generator</strong>, select a customer, and the system will auto-populate usage costs. Click 'Issue Invoice' to finalize.</p>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="Processing M-Pesa Payments">
              <p>Select an invoice in the <strong>Payments</strong> section, choose M-Pesa, and follow the STK Push prompt on your phone.</p>
            </a-collapse-panel>
            <a-collapse-panel key="3" header="Usage Reporting Cycles">
              <p>Usage logs are synced in real-time but can be manually triggered for batch processing in the <strong>Billing Engine</strong>.</p>
            </a-collapse-panel>
          </a-collapse>
        </a-card>

        <a-card title="Operational Guides" class="standard-card mt-6">
          <a-list :data-source="guides" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta 
                  :title="item.title" 
                  :description="item.description"
                >
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: '#e6f4ff', color: '#1677ff' }">
                      <book-outlined />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button type="link" @click="showGuide(item)">Read Guide</a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="Contact Support" class="standard-card">
          <div class="contact-item">
            <span class="label">Priority Email</span>
            <p>support@quixora.com</p>
          </div>
          <a-divider />
          <div class="contact-item">
            <span class="label">System Status</span>
            <a-tag color="success">ALL SYSTEMS OPERATIONAL</a-tag>
          </div>
          <a-button type="primary" block size="large" class="mt-6" @click="notImplemented">
            <template #icon><message-outlined /></template>
            Start Live Chat
          </a-button>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:open="guideVisible" :title="currentGuide?.title" :footer="null" width="700px">
      <div class="guide-content p-6">
        <a-result status="info" title="Guide Coming Soon">
          <template #subTitle>
            We are currently updating our documentation for the 2026 release. 
            Detailed walkthroughs for <strong>{{ currentGuide?.title }}</strong> will be available shortly.
          </template>
        </a-result>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { BookOutlined, MessageOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'HelpCenter',
  components: { BookOutlined, MessageOutlined },
  setup() {
    const activeFAQKeys = ref(['1']);
    const guideVisible = ref(false);
    const currentGuide = ref(null);

    const guides = ref([
      { title: 'Getting Started', description: 'Basic navigation and system overview.' },
      { title: 'Customer Management', description: 'Adding, editing, and segmenting your client base.' },
      { title: 'Billing Intelligence', description: 'Understanding forecasts and tiered pricing models.' },
    ]);

    const showGuide = (g) => {
      currentGuide.value = g;
      guideVisible.value = true;
    };

    const notImplemented = () => message.info('Live Support is available Mon-Fri, 9AM-5PM EAT.');

    return {
      activeFAQKeys,
      guides,
      guideVisible,
      currentGuide,
      showGuide,
      notImplemented
    };
  },
});
</script>

<style scoped>
.help-center-container {
  max-width: 1200px;
  margin: 0 auto;
}

.standard-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.contact-item .label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 4px;
}

.contact-item p {
  margin: 0;
  font-weight: 500;
}
</style>
