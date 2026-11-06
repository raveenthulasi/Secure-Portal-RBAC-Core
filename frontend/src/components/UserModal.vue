<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="onClose">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEdit ? 'Edit User Details' : 'Add New User' }}
        </h3>
        <button class="close-btn" @click="onClose">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="modal-body">
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label">Full Name <span class="text-danger">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="e.g. Sarah Connor"
            />
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>

          <!-- Email Address -->
          <div class="form-group">
            <label class="form-label">Email Address <span class="text-danger">*</span></label>
            <input
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="e.g. user@rbacportal.com"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <!-- Role & Status (Two columns) -->
          <div class="grid-cols-2-inline">
            <div class="form-group">
              <label class="form-label">Assigned Role <span class="text-danger">*</span></label>
              <select
                v-model="formData.role_id"
                class="form-select"
                :class="{ error: errors.role_id }"
              >
                <option value="" disabled>Select Role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.display_name }} ({{ role.name }})
                </option>
              </select>
              <div v-if="errors.role_id" class="form-error">{{ errors.role_id }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Account Status</label>
              <select v-model="formData.status" class="form-select">
                <option value="active">Active (Access Enabled)</option>
                <option value="inactive">Inactive (Access Suspended)</option>
              </select>
            </div>
          </div>

          <!-- Department & Phone (Two columns) -->
          <div class="grid-cols-2-inline">
            <div class="form-group">
              <label class="form-label">Department</label>
              <input
                v-model="formData.department"
                type="text"
                class="form-input"
                placeholder="e.g. Operations, IT, Finance"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input
                v-model="formData.phone"
                type="text"
                class="form-input"
                placeholder="e.g. +1-555-0123"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label class="form-label">
              {{ isEdit ? 'Reset Password (Leave blank to keep unchanged)' : 'Initial Password *' }}
            </label>
            <input
              v-model="formData.password"
              type="password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Min 6 characters"
            />
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="loading" @click="onClose">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Saving...</span>
            <span v-else>{{ isEdit ? 'Save Changes' : 'Create User' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: () => null
  },
  roles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'close']);

const formData = reactive({
  name: '',
  email: '',
  role_id: '',
  status: 'active',
  department: 'General',
  phone: '',
  password: ''
});

const errors = reactive({
  name: '',
  email: '',
  role_id: '',
  password: ''
});

const resetForm = () => {
  if (props.isEdit && props.userData) {
    formData.name = props.userData.name || '';
    formData.email = props.userData.email || '';
    formData.role_id = props.userData.role_id || '';
    formData.status = props.userData.status || 'active';
    formData.department = props.userData.department || '';
    formData.phone = props.userData.phone || '';
    formData.password = '';
  } else {
    formData.name = '';
    formData.email = '';
    formData.role_id = props.roles.length > 0 ? props.roles[0].id : '';
    formData.status = 'active';
    formData.department = 'General';
    formData.phone = '';
    formData.password = '';
  }

  errors.name = '';
  errors.email = '';
  errors.role_id = '';
  errors.password = '';
};

watch(() => props.isOpen, (open) => {
  if (open) {
    resetForm();
  }
});

const validate = () => {
  let isValid = true;
  errors.name = '';
  errors.email = '';
  errors.role_id = '';
  errors.password = '';

  if (!formData.name.trim()) {
    errors.name = 'Full name is required.';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = 'Email address is required.';
    isValid = false;
  } else if (!emailRegex.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address.';
    isValid = false;
  }

  if (!formData.role_id) {
    errors.role_id = 'Please assign a role.';
    isValid = false;
  }

  if (!props.isEdit) {
    if (!formData.password) {
      errors.password = 'Initial password is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }
  } else if (formData.password && formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (!validate()) return;
  emit('save', { ...formData });
};

const onClose = () => {
  emit('close');
};
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
  max-width: 560px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--slate-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--slate-900);
}

.close-btn {
  font-size: 1.5rem;
  color: var(--slate-400);
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--slate-700);
}

.modal-body {
  padding: 1.5rem 1.75rem;
  max-height: 70vh;
  overflow-y: auto;
}

.grid-cols-2-inline {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  padding: 1rem 1.75rem;
  border-top: 1px solid var(--slate-100);
  background-color: var(--slate-50);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.text-danger {
  color: var(--danger-500);
}

@media (max-width: 640px) {
  .grid-cols-2-inline {
    grid-template-columns: 1fr;
  }
}
</style>

