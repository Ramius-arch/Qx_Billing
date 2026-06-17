<template>
  <div class="settings-page">
    <a-typography-title :level="2">System Configuration</a-typography-title>
    <a-card title="Admin Parameters" style="max-width: 600px;">
      <a-form layout="vertical" @finish="saveConfig">
        <a-form-item label="VAT Rate (%)" name="vat_rate">
          <a-input-number v-model:value="config.vat_rate" :min="0" :max="100" style="width: 100%" />
        </a-form-item>
        <a-form-item label="Default Currency" name="currency">
          <a-input v-model:value="config.currency" />
        </a-form-item>
        <a-button type="primary" html-type="submit" :loading="saving">Save Settings</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import api from '../services/api';

export default defineComponent({
  name: 'SystemSettings',
  setup() {
    const config = ref({ vat_rate: 16, currency: 'KSh' });
    const saving = ref(false);

    const fetchConfigs = async () => {
        // Assume an endpoint to fetch config
        const response = await api.apiClient.get('/config');
        response.data.data.forEach(c => config.value[c.key] = c.value);
    };

    const saveConfig = async () => {
      saving.value = true;
      try {
        for (const [key, value] of Object.entries(config.value)) {
            await api.apiClient.post('/config', { key, value });
        }
        message.success('Settings saved successfully.');
      } catch (err) {
        message.error('Failed to save settings.');
      } finally {
        saving.value = false;
      }
    };
    
    // onMounted(fetchConfigs); // Uncomment if API is ready

    return { config, saveConfig, saving };
  }
});
</script>
