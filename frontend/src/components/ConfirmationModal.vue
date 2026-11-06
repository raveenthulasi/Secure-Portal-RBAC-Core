<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="onCancel">
    <div class="modal-card">
      <div class="modal-icon-header" :class="`icon-${type}`">
        <svg v-if="type === 'danger'" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>

      <div class="modal-content">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" :disabled="loading" @click="onCancel">
          {{ cancelText }}
        </button>
        <button
          :class="['btn', type === 'danger' ? 'btn-danger' : 'btn-primary']"
          :disabled="loading"
          @click="onConfirm"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>{{ confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed with this action?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'danger' // 'danger' | 'primary' | 'warning'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => emit('confirm');
const onCancel = () => emit('cancel');
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-icon-header {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.icon-danger {
  background-color: #fef2f2;
  color: #ef4444;
}

.icon-primary {
  background-color: #eff6ff;
  color: #2563eb;
}

.icon-warning {
  background-color: #fffbeb;
  color: #f59e0b;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--slate-900);
  margin-bottom: 0.5rem;
}

.modal-message {
  font-size: 0.875rem;
  color: var(--slate-600);
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.modal-actions .btn {
  flex: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

