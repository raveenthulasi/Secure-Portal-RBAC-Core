<template>
  <div class="card stat-card">
    <div class="stat-content">
      <div class="stat-info">
        <span class="stat-label">{{ title }}</span>
        <div class="stat-value">{{ value }}</div>
        <div v-if="subtitle" class="stat-subtext" :class="subtitleClass">
          {{ subtitle }}
        </div>
      </div>
      <div class="stat-icon-wrapper" :class="iconBgClass">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  subtitleClass: {
    type: String,
    default: ''
  },
  iconBgClass: {
    type: String,
    default: 'icon-primary'
  }
});
</script>

<style scoped>
.stat-card {
  padding: 1.35rem 1.5rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--slate-900);
  line-height: 1.2;
  margin-top: 0.25rem;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--slate-500);
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stat-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-primary {
  background-color: var(--primary-50);
  color: var(--primary-600);
}

.icon-success {
  background-color: var(--success-50);
  color: var(--success-500);
}

.icon-warning {
  background-color: var(--warning-50);
  color: var(--warning-500);
}

.icon-info {
  background-color: var(--info-50);
  color: var(--info-500);
}

.icon-purple {
  background-color: #f5f3ff;
  color: #7c3aed;
}
</style>

