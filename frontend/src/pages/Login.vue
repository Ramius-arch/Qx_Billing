<template>
  <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5;">
    <a-card :title="false" style="max-width: 400px; width: 90%; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; margin-bottom: 24px; color: #333;">Login</h2>
      <a-form
        :model="formState"
        name="normal_login"
        class="login-form"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]"
        >
          <a-input v-model:value="formState.email" placeholder="Email">
            <template #prefix><UserOutlined class="site-form-item-icon" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your Password!' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="Password">
            <template #prefix><LockOutlined class="site-form-item-icon" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-form-item name="remember" no-style>
            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
          </a-form-item>
          <a-button type="link" style="float: right;">Forgot password</a-button>
        </a-form-item>

        <a-form-item>
          <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button" style="width: 100%;">
            Log in
          </a-button>
          Or <router-link to="/register">register now!</router-link>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, reactive, computed } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const formState = reactive({
      email: '',
      password: '',
      remember: true,
    });
    const onFinish = values => {
      console.log('Success:', values);
      // Implement login logic here
    };
    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };
    const disabled = computed(() => {
      return !(formState.email && formState.password);
    });
    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
    };
  },
});
</script>

<style scoped>
.login-form {
  max-width: 300px;
}
.login-form-button {
  width: 100%;
}
</style>