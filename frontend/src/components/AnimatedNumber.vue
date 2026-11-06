<template>
  <span>{{ displayValue }}{{ suffix }}</span>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue';

export default defineComponent({
  name: 'AnimatedNumber',
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    suffix: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 1000
    }
  },
  setup(props) {
    const displayValue = ref('0');

    const animateNumber = (target) => {
      const numTarget = typeof target === 'string' ? parseFloat(target.replace(/[^0-9.-]+/g, '')) || 0 : target || 0;
      if (isNaN(numTarget) || numTarget === 0) {
        displayValue.value = typeof target === 'number' ? target.toLocaleString() : (target || '0');
        return;
      }

      const start = 0;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / props.duration, 1);
        // easeOutQuad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + (numTarget - start) * easeProgress);

        displayValue.value = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          displayValue.value = numTarget.toLocaleString();
        }
      };

      requestAnimationFrame(updateCount);
    };

    watch(() => props.value, (newVal) => {
      animateNumber(newVal);
    });

    onMounted(() => {
      animateNumber(props.value);
    });

    return {
      displayValue
    };
  }
});
</script>
