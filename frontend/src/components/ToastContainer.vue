<template>
  <div class="toast-container" aria-live="polite">
    <transition-group name="toast-slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-item', `toast-${toast.type}`]"
        role="alert"
      >
        <div class="toast-icon">
          <!-- Success Icon -->
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <!-- Error Icon -->
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <!-- Warning Icon -->
          <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <!-- Info Icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="remove(toast.id)" aria-label="Close notification">
          &times;
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../store/toast';

const { toasts, remove } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 420px;
  width: calc(100% - 2.5rem);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem;
  border-radius: var(--radius-md);
  background: #ffffff;
  color: var(--slate-800);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--primary-600);
  pointer-events: auto;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.toast-message {
  flex: 1;
}

.toast-close {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--slate-400);
  cursor: pointer;
  padding: 0 0.25rem;
  transition: color var(--transition-fast);
}

.toast-close:hover {
  color: var(--slate-700);
}

.toast-success {
  border-left-color: var(--success-500);
  background-color: #f0fdf4;
}
.toast-success .toast-icon {
  color: var(--success-500);
}

.toast-error {
  border-left-color: var(--danger-500);
  background-color: #fef2f2;
}
.toast-error .toast-icon {
  color: var(--danger-500);
}

.toast-warning {
  border-left-color: var(--warning-500);
  background-color: #fffbeb;
}
.toast-warning .toast-icon {
  color: var(--warning-500);
}

.toast-info {
  border-left-color: var(--info-500);
  background-color: #f0f9ff;
}
.toast-info .toast-icon {
  color: var(--info-500);
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}
</style>

