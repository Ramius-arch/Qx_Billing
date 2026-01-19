<!-- frontend/src/components/PaymentStatus.vue -->
<template>
  <div class="payment-status">
    <h2>Payment Statistics</h2>
    <div class="status-list">
      {{ paymentStatus.value.join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  payments: Array<string>,
});
</script>
