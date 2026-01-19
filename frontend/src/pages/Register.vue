<template>
  <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5;">
    <a-card :title="false" style="max-width: 400px; width: 90%; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; margin-bottom: 24px; color: #333;">Register</h2>
      <a-form
        :model="formState"
        name="register"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="Name"
          name="name"
          :rules="[{ required: true, message: 'Please input your name!' }]"
        >
          <a-input v-model:value="formState.name" placeholder="Name">
            <template #prefix><UserOutlined class="site-form-item-icon" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]"
        >
          <a-input v-model:value="formState.email" placeholder="Email">
            <template #prefix><MailOutlined class="site-form-item-icon" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
          has-feedback
        >
          <a-input-password v-model:value="formState.password" placeholder="Password">
            <template #prefix><LockOutlined class="site-form-item-icon" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="Confirm Password"
          name="confirm"
          :rules="[{ required: true, message: 'Please confirm your password!' }, { validator: validatePass, trigger: 'change' }]"
          has-feedback
        >
          <a-input-password v-model:value="formState.confirm" placeholder="Confirm Password">
            <template #prefix><LockOutlined class="site-form-item-icon" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button :disabled="disabled" type="primary" html-type="submit" class="register-form-button" style="width: 100%;">
            Register
          </a-button>
          Already have an account? <router-link to="/login">Log in!</router-link>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { defineComponent, reactive, computed } from 'vue';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
    MailOutlined,
  },
  setup() {
    const formState = reactive({
      name: '',
      email: '',
      password: '',
      confirm: '',
    });

    const validatePass = (rule, value) => {
      if (value === '') {
        return Promise.reject('Please confirm your password!');
      } else if (value !== formState.password) {
        return Promise.reject("Two inputs don't match!");
      } else {
        return Promise.resolve();
      }
    };

    const onFinish = values => {
      console.log('Success:', values);
      // Implement registration logic here
    };

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };

    const disabled = computed(() => {
      return !(formState.name && formState.email && formState.password && formState.confirm);
    });

    return {
      formState,
      onFinish,
      onFinishFailed,
      validatePass,
      disabled,
    };
  },
});
</script>

<style scoped>
.register-form-button {
  width: 100%;
}
</style>