<template>
  <div class="profile-page">
    <a-typography-title :level="2">Profile Settings</a-typography-title>
    <a-card title="Account Details" style="max-width: 600px;">
      <a-form layout="vertical">
        <a-form-item label="Username">
          <a-input value="Admin User" disabled />
        </a-form-item>
        <a-form-item label="Email">
          <a-input value="admin@quixora.com" disabled />
        </a-form-item>
        <a-form-item label="Password">
          <a-input-password placeholder="Change password" />
        </a-form-item>
        <a-button type="primary">Update Profile</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({ name: 'ProfileSettings' });
</script>

<style scoped>
.profile-page { padding: 24px; }
</style>
