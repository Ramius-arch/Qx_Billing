<template>
  <svg
    :class="['niche-icon', customClass]"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 1. Treasury / Vault / Total Sales -->
    <g v-if="name === 'vault' || name === 'sales'">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.6" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.2" />
      <line x1="12" y1="4.5" x2="12" y2="7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="12" y1="17" x2="12" y2="19.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="4.5" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="17" y1="12" x2="19.5" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </g>

    <!-- 2. Cargo Parcel / Orders Fulfilled -->
    <g v-else-if="name === 'parcel' || name === 'orders'">
      <path d="M12 2.5L20.5 7.2V16.8L12 21.5L3.5 16.8V7.2L12 2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M12 2.5V21.5" stroke="currentColor" stroke-width="1.4" stroke-opacity="0.6" />
      <path d="M3.5 7.2L12 12L20.5 7.2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M7.8 4.8L16.2 9.5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.7" />
    </g>

    <!-- 3. Courier Transit / Kinetic Motorcycle Dispatch -->
    <g v-else-if="name === 'transit' || name === 'delivery'">
      <circle cx="6" cy="17" r="3" stroke="currentColor" stroke-width="1.6" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" stroke-width="1.6" />
      <path d="M6 17H10L13 11H18L15 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M11 7H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12.5" cy="5" r="1.5" fill="currentColor" fill-opacity="0.5" stroke="currentColor" stroke-width="1.2" />
      <path d="M4 11H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.5" />
      <path d="M2 14H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.5" />
    </g>

    <!-- 4. Lipa na M-Pesa Cryptographic Shield / Clearance -->
    <g v-else-if="name === 'mpesa' || name === 'clearance' || name === 'shield'">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" stroke-width="1.6" />
      <path d="M9 18H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M12 6L15.5 7.5V11C15.5 13.5 14 15.5 12 16.5C10 15.5 8.5 13.5 8.5 11V7.5L12 6Z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M10.8 11.2L11.8 12.2L13.8 9.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- 5. Optical Reticle Search -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="11" cy="11" r="2.5" stroke="currentColor" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="2 1.5" />
    </g>

    <!-- 6. Precision Geometric Plus -->
    <g v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </g>

    <!-- 7. Centrifugal Sync / Refresh -->
    <g v-else-if="name === 'refresh' || name === 'sync'">
      <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5V9H8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4 13A8.1 8.1 0 0 0 19.5 15M20 19V15H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- 8. Precision WhatsApp Vector -->
    <g v-else-if="name === 'whatsapp'">
      <path d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.4 17L2 22L7.2 20.6C8.6 21.5 10.3 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M8.5 9.5C8.8 8.9 9.1 8.9 9.4 8.9C9.6 8.9 9.8 8.9 10 9C10.2 9.1 10.4 9.6 10.6 10C10.8 10.5 11.2 11.4 11.3 11.5C11.4 11.7 11.4 11.9 11.3 12.1C11.2 12.3 11.1 12.4 10.9 12.6C10.7 12.8 10.5 13 10.3 13.2C10.1 13.4 9.9 13.6 10.1 13.9C10.3 14.3 11 15.2 12 15.9C13.2 16.8 14.1 17.1 14.5 17.2C14.8 17.3 15 17.2 15.2 17C15.4 16.7 16 15.8 16.2 15.5C16.4 15.2 16.6 15.3 16.9 15.4C17.2 15.5 18.5 16.2 18.7 16.3C18.9 16.4 19.1 16.5 19.1 16.7C19.1 17.1 18.8 18.5 17.6 18.9C16.8 19.2 15.7 19.2 14.2 18.5C12.4 17.7 10.8 16.3 9.7 14.6C8.8 13.2 8.3 11.8 8.3 10.7C8.3 9.9 8.5 9.6 8.5 9.5Z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.3" />
    </g>

    <!-- 9. Precision Micro-Printer -->
    <g v-else-if="name === 'printer'">
      <path d="M6 9V3H18V9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M6 17H4C2.9 17 2 16.1 2 15V11C2 9.9 2.9 9 4 9H20C21.1 9 22 9.9 22 11V15C22 16.1 21.1 17 20 17H18" stroke="currentColor" stroke-width="1.6" />
      <rect x="6" y="13" width="12" height="8" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" />
      <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      <line x1="9" y1="18.5" x2="13" y2="18.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    </g>

    <!-- 10. Neural Silicon Processor / Payment Matcher -->
    <g v-else-if="name === 'robot' || name === 'ai'">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.6" />
      <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.4" />
      <path d="M1 9H4M1 15H4M20 9H23M20 15H23M9 1V4M15 1V4M9 20V23M15 20V23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <!-- 11. Balance Beam / Daily Bookkeeper -->
    <g v-else-if="name === 'scale' || name === 'bookkeeper'">
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M5 7L12 5L19 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M2 13L5 7L8 13C8 14.7 6.7 16 5 16C3.3 16 2 14.7 2 13Z" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.15" />
      <path d="M16 13L19 7L22 13C22 14.7 20.7 16 19 16C17.3 16 16 14.7 16 13Z" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.15" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </g>

    <!-- 12. Reservation Sweeper / Broom & Timer -->
    <g v-else-if="name === 'sweep' || name === 'timer'">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
      <polyline points="12 7 12 12 15.5 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M18.5 5.5L20 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M12 1V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <!-- 13. KRA eTIMS Colonnade / Statutory Treasury -->
    <g v-else-if="name === 'tax' || name === 'etims' || name === 'bank'">
      <path d="M2 9L12 3L22 9V10H2V9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15" />
      <line x1="4" y1="10" x2="4" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="9.3" y1="10" x2="9.3" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="14.7" y1="10" x2="14.7" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="20" y1="10" x2="20" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <rect x="1" y="18" width="22" height="3" rx="1" stroke="currentColor" stroke-width="1.6" />
    </g>

    <!-- 14. Tactical Game HUD / Trainer -->
    <g v-else-if="name === 'hud' || name === 'trainer' || name === 'game'">
      <path d="M3 8V5C3 3.9 3.9 3 5 3H8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M16 3H19C20.1 3 21 3.9 21 5V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M21 16V19C21 20.1 20.1 21 19 21H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 21H5C3.9 21 3 20.1 3 19V16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.5" />
      <line x1="12" y1="6" x2="12" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="12" y1="15.5" x2="12" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="6" y1="12" x2="8.5" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="15.5" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 15. Energy Spark / Lightning -->
    <g v-else-if="name === 'zap' || name === 'flash'">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
    </g>

    <!-- 16. Precision Tax Invoice / Bill Document -->
    <g v-else-if="name === 'bill' || name === 'invoice' || name === 'doc'">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </g>

    <!-- 17. Precision Alert / Warning Reticle -->
    <g v-else-if="name === 'warning' || name === 'alert'">
      <path d="M12 2.5L22 20H2L12 2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1" />
      <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="17.2" r="1.1" fill="currentColor" />
    </g>

    <!-- 18. Precision Verified / Seal Check -->
    <g v-else-if="name === 'check' || name === 'verified'">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.1" />
      <polyline points="8 12 10.8 15 16 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- 19. Hardware Display / System Mode Monitor -->
    <g v-else-if="name === 'desktop' || name === 'system' || name === 'monitor'">
      <rect x="3" y="3" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6" />
      <path d="M8 21H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M12 16V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="9.5" r="1.5" fill="currentColor" fill-opacity="0.3" />
    </g>

    <!-- 20. Radiant Solar Sun (Light Theme) -->
    <g v-else-if="name === 'sun' || name === 'light'">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.2" />
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M6.3 6.3L7.7 7.7M16.3 16.3L17.7 17.7M6.3 17.7L7.7 16.3M16.3 7.7L17.7 6.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 21. Lunar Crescent (Dark Theme) -->
    <g v-else-if="name === 'moon' || name === 'dark'">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.2" />
    </g>

    <!-- 22. Mobile Terminal / STK Push Phone -->
    <g v-else-if="name === 'phone' || name === 'stk' || name === 'mobile'">
      <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" stroke-width="1.6" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="5.5" r="0.8" fill="currentColor" />
    </g>

    <!-- 23. Curated Shopping Bag / Storefront -->
    <g v-else-if="name === 'bag' || name === 'store' || name === 'shop'">
      <path d="M7 8V6C7 3.8 8.8 2 11 2H13C15.2 2 17 3.8 17 6V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <rect x="3.5" y="8" width="17" height="13.5" rx="2.5" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.08" />
      <circle cx="12" cy="14" r="2" stroke="currentColor" stroke-width="1.4" stroke-opacity="0.5" />
    </g>

    <!-- 24. Customer Identity / Ledger Account -->
    <g v-else-if="name === 'user' || name === 'customer' || name === 'account'">
      <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity="0.15" />
    </g>

    <!-- 25. Micro-Calibrated Tool / Quick Actions -->
    <g v-else-if="name === 'tool' || name === 'tools' || name === 'wrench'">
      <path d="M14.7 6.3A4 4 0 0 0 9 12l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6a4 4 0 0 0 5.7-5.7l-2.1 2.1-2.8-2.8 2.8-2.4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.15" />
    </g>

    <!-- 26. Celebration Confetti Ray / Zero Discrepancy -->
    <g v-else-if="name === 'party' || name === 'celebrate'">
      <path d="M3 21L13 17L7 7L3 21Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.2" />
      <path d="M14 4L15 7M19 8L16 10.5M21 15L17 14M11 2L11 4M21 4L19 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 27. Directional Vector Arrow -->
    <g v-else-if="name === 'arrow-right'">
      <line x1="4" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <polyline points="13 6 19 12 13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Fallback Precision Reticle -->
    <g v-else>
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </g>
  </svg>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NicheIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 20
    },
    customClass: {
      type: String,
      default: ''
    }
  }
});
</script>

<style scoped>
.niche-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s ease;
}
</style>
