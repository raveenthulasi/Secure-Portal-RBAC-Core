<template>
  <div class="profile-view">
    <!-- Header Banner -->
    <div class="card profile-header card">
      <div class="header-left">
        <div class="avatar-huge">
          {{ userInitials }}
        </div>
        <div class="header-user-info">
          <div class="role-row">
            <span :class="['badge', auth.isAdmin.value ? 'badge-admin' : 'badge-user']">
              {{ auth.user.value?.role_display || (auth.isAdmin.value ? 'Administrator' : 'Regular User') }}
            </span>
            <span class="badge badge-active">Account Verified</span>
          </div>
          <h2 class="profile-name">{{ auth.user.value?.name }}</h2>
          <p class="profile-email">{{ auth.user.value?.email }}</p>
        </div>
      </div>
      <div class="header-right">
        <div class="last-login-meta">
          <span class="meta-label">Last Active Session</span>
          <span class="meta-value">{{ formatDate(auth.user.value?.last_login) }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Profile & Change Password 2 Columns -->
    <div class="grid-cols-2 profile-grid">
      <!-- General Profile Info Form -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Profile Information</h3>
            <p class="card-subtitle">Update your personal contact details</p>
          </div>
        </div>
        <form @submit.prevent="handleUpdateProfile">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Work Email (Read Only)</label>
              <input
                :value="auth.user.value?.email"
                type="email"
                class="form-input"
                disabled
              />
              <span class="field-hint">Email address is bound to your authentication identity.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Department / Unit</label>
              <input
                v-model="profileForm.department"
                type="text"
                class="form-input"
                placeholder="e.g. Finance, IT, Operations"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Direct Phone Number</label>
              <input
                v-model="profileForm.phone"
                type="text"
                class="form-input"
                placeholder="e.g. +1-555-0199"
              />
            </div>
          </div>
          <div class="card-footer form-footer">
            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              <span v-if="savingProfile">Saving...</span>
              <span v-else>Update Profile Details</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Form -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Security &amp; Password</h3>
            <p class="card-subtitle">Change your account login credentials</p>
          </div>
        </div>
        <form @submit.prevent="handleChangePassword">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <div class="input-with-icon">
                <input
                  v-model="passwordForm.currentPassword"
                  :type="showPass.current ? 'text' : 'password'"
                  class="form-input has-right-icon"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  class="input-icon-right"
                  @click="showPass.current = !showPass.current"
                  tabindex="-1"
                >
                  <svg v-if="showPass.current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="input-with-icon">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showPass.new ? 'text' : 'password'"
                  class="form-input has-right-icon"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  class="input-icon-right"
                  @click="showPass.new = !showPass.new"
                  tabindex="-1"
                >
                  <svg v-if="showPass.new" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <div class="input-with-icon">
                <input
                  v-model="passwordForm.confirmPassword"
                  :type="showPass.confirm ? 'text' : 'password'"
                  class="form-input has-right-icon"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  class="input-icon-right"
                  @click="showPass.confirm = !showPass.confirm"
                  tabindex="-1"
                >
                  <svg v-if="showPass.confirm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="card-footer form-footer">
            <button type="submit" class="btn btn-primary" :disabled="savingPassword">
              <span v-if="savingPassword">Updating Password...</span>
              <span v-else>Change Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

const auth = useAuthStore();
const toast = useToast();

const savingProfile = ref(false);
const savingPassword = ref(false);

const profileForm = reactive({
  name: '',
  department: '',
  phone: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showPass = reactive({
  current: false,
  new: false,
  confirm: false
});

onMounted(() => {
  if (auth.user.value) {
    profileForm.name = auth.user.value.name || '';
    profileForm.department = auth.user.value.department || '';
    profileForm.phone = auth.user.value.phone || '';
  }
});

const userInitials = computed(() => {
  if (!auth.user.value?.name) return 'U';
  return auth.user.value.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const formatDate = (date) => {
  if (!date) return 'Current session active';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleUpdateProfile = async () => {
  savingProfile.value = true;
  try {
    const res = await userService.updateOwnProfile({
      name: profileForm.name,
      department: profileForm.department,
      phone: profileForm.phone
    });

    if (res.success && res.data) {
      auth.updateUser(res.data);
      toast.success('Your profile was updated successfully.');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update profile.');
  } finally {
    savingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.newPassword.length < 6) {
    toast.error('New password must be at least 6 characters long.');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('New password and confirmation do not match.');
    return;
  }

  savingPassword.value = true;
  try {
    await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    toast.success('Password changed successfully! Keep your new password secure.');
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to change password. Please verify current password.');
  } finally {
    savingPassword.value = false;
  }
};
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  padding: 2rem 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-huge {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af, #2563eb);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.header-user-info {
  display: flex;
  flex-direction: column;
}

.role-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--slate-900);
}

.profile-email {
  font-size: 0.875rem;
  color: var(--slate-500);
  margin-top: 0.15rem;
}

.last-login-meta {
  display: flex;
  flex-direction: column;
  text-align: right;
  background: var(--slate-50);
  border: 1px solid var(--slate-200);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
}

.meta-label {
  font-size: 0.725rem;
  color: var(--slate-400);
  text-transform: uppercase;
}

.meta-value {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--slate-700);
  margin-top: 0.15rem;
}

.profile-grid {
  gap: 1.5rem;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--slate-400);
  margin-top: 0.35rem;
  display: block;
}

@media (max-width: 860px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  .last-login-meta {
    text-align: left;
  }
}
</style>

