<template>
  <div class="help-center-container">
    <a-typography-title :level="2">Help Center</a-typography-title>

    <a-card title="Frequently Asked Questions (FAQs)" style="margin-bottom: 24px;">
      <a-collapse v-model:activeKey="activeFAQKeys" accordion>
        <a-collapse-panel key="1" header="How do I create an invoice?">
          <p>
            Navigate to the "Invoice Generator" section from the sidebar. Fill in the customer details, add line items,
            and the system will automatically calculate the totals. You can then save, preview, or send the invoice.
          </p>
        </a-collapse-panel>
        <a-collapse-panel key="2" header="What payment methods are supported?">
          <p>
            Our system supports various payment methods including Credit Card, PayPal, and M-Pesa.
            You can select your preferred method on the "Payment Processing" page.
          </p>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="How can I view my billing history?">
          <p>
            Your billing history and detailed reports are available in the "Reports and Analytics" section.
            You can find information on revenue, outstanding invoices, and customer payments there.
          </p>
        </a-collapse-panel>
      </a-collapse>
    </a-card>

    <a-card title="Guides and Tutorials" style="margin-bottom: 24px;">
      <a-list :data-source="guides">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.title" :description="item.description" />
            <template #actions>
              <a-button type="link" :href="item.link" target="_blank">View Guide</a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <a-card title="Contact Support">
      <a-descriptions :column="1">
        <a-descriptions-item label="Email">support@telecombilling.com</a-descriptions-item>
        <a-descriptions-item label="Phone">+1 (800) 123-4567</a-descriptions-item>
        <a-descriptions-item label="Address">123 Billing Street, City, Country</a-descriptions-item>
        <a-descriptions-item label="Live Chat">
          <a-button type="primary" disabled>Start Live Chat (Coming Soon)</a-button>
          <p class="ant-descriptions-item-content" style="margin-top: 8px;">
            For real-time assistance, our live chat support will be available soon.
          </p>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'HelpCenter',
  setup() {
    const activeFAQKeys = ref(['1']); // Default active FAQ key

    const guides = ref([
      { title: 'Getting Started with Telecom Billing', description: 'A comprehensive guide for new users.', link: '#' },
      { title: 'Managing Your Customer Accounts', description: 'Learn how to add, edit, and manage customer profiles.', link: '#' },
      { title: 'Understanding Your Billing Reports', description: 'Detailed explanation of various reports and analytics.', link: '#' },
    ]);

    return {
      activeFAQKeys,
      guides,
    };
  },
});
</script>

<style scoped>
.help-center-container {
  padding: 24px;
}
</style>