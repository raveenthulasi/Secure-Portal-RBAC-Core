<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Hero Banner -->
      <div class="login-hero">
        <div class="hero-brand">
          <div class="brand-shield-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="hero-brand-name">RBAC Portal</span>
        </div>

        <div class="hero-content">
          <h2 class="hero-title">Enterprise Role-Based Access Control</h2>
          <p class="hero-description">
            Strict perimeter security, granular permission matrices, and token-based cryptographic authentication.
          </p>

          <div class="security-features">
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>JWT Cryptographic Verification</span>
            </div>
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              <span>Multi-Tier Role &amp; Permission Middleware</span>
            </div>
            <div class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span>Bcrypt Password Hashing &amp; Audit Logs</span>
            </div>
          </div>
        </div>

        <div class="hero-footer">
          <span>Secure Portal v1.0.0 &bull; Node.js &amp; Vue 3 &bull; MySQL</span>
        </div>
      </div>

      <!-- Right Login Form -->
      <div class="login-form-wrapper">
        <div class="login-box">
          <div class="login-header">
            <h2 class="title">Sign In</h2>
            <p class="subtitle">Access your role-based dashboard</p>
          </div>

          <!-- Session expired alert -->
          <div v-if="sessionExpired" class="alert-box alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Your session has expired. Please log in again.</span>
          </div>

          <!-- General Error alert -->
          <div v-if="errorMessage" class="alert-box alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="login-email">Work Email</label>
              <div class="input-with-icon">
                <span class="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  class="form-input"
                  :class="{ error: emailError }"
                  placeholder="name@company.com"
                  autocomplete="email"
                  required
                />
              </div>
              <div v-if="emailError" class="form-error">{{ emailError }}</div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="login-password">Password</label>
              </div>
              <div class="input-with-icon">
                <span class="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input has-right-icon"
                  :class="{ error: passwordError }"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <!-- Password visibility toggle -->
                <button
                  type="button"
                  class="input-icon-right toggle-password"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                  tabindex="-1"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div v-if="passwordError" class="form-error">{{ passwordError }}</div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg submit-btn"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-if="loading">Verifying Credentials...</span>
              <span v-else>Sign In to Portal</span>
            </button>
          </form>

          <!-- Quick Test Credentials Box -->
          <div class="test-accounts-section">
            <div class="test-accounts-title">
              <span>QUICK FILL DEMO ACCOUNTS</span>
            </div>
            <div class="test-account-buttons">
              <button
                type="button"
                class="test-btn test-btn-admin"
                @click="fillCredentials('admin@rbacportal.com', 'Admin@123')"
              >
                <div class="test-role-title">Admin Account</div>
                <div class="test-credentials">admin@rbacportal.com / Admin@123</div>
              </button>
              <button
                type="button"
                class="test-btn test-btn-user"
                @click="fillCredentials('user@rbacportal.com', 'User@123')"
              >
                <div class="test-role-title">Regular User</div>
                <div class="test-credentials">user@rbacportal.com / User@123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

const emailError = ref('');
const passwordError = ref('');
const errorMessage = ref('');
const sessionExpired = ref(false);

onMounted(() => {
  if (route.query.session_expired) {
    sessionExpired.value = true;
  }
});

const validateForm = () => {
  let valid = true;
  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

  if (!email.value.trim()) {
    emailError.value = 'Email address is required.';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'Please enter a valid email address.';
    valid = false;
  }

  if (!password.value) {
    passwordError.value = 'Password is required.';
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  loading.value = true;
  errorMessage.value = '';
  sessionExpired.value = false;

  try {
    const data = await authService.login(email.value, password.value);
    auth.setAuth(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}!`);

    // Redirect to requested redirect route or role-specific dashboard
    const redirectUrl = route.query.redirect;
    if (redirectUrl && !redirectUrl.includes('/403') && !redirectUrl.includes('/login')) {
      router.push(redirectUrl);
    } else {
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  } catch (err) {
    const errorText = err.response?.data?.message || 'Login failed. Please verify your credentials.';
    errorMessage.value = errorText;
    toast.error(errorText);
  } finally {
    loading.value = false;
  }
};

const fillCredentials = (demoEmail, demoPassword) => {
  email.value = demoEmail;
  password.value = demoPassword;
  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  padding: 1.5rem;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1050px;
  min-height: 620px;
  background: #ffffff;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
  border: 1px solid var(--slate-200);
}

.login-hero {
  flex: 1;
  background: linear-gradient(145deg, #1e3a8a, #1e40af, #2563eb);
  color: #ffffff;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.brand-shield-icon {
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.hero-brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-content {
  margin: 2rem 0;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 0.95rem;
  color: #bfdbfe;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.security-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #e0e7ff;
}

.hero-footer {
  font-size: 0.75rem;
  color: #93c5fd;
}

.login-form-wrapper {
  flex: 1.1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 1.75rem;
}

.login-header .title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--slate-900);
}

.login-header .subtitle {
  font-size: 0.875rem;
  color: var(--slate-500);
  margin-top: 0.25rem;
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.825rem;
  margin-bottom: 1.25rem;
}

.alert-warning {
  background-color: var(--warning-50);
  color: var(--warning-700);
  border: 1px solid #fde68a;
}

.alert-error {
  background-color: var(--danger-50);
  color: var(--danger-700);
  border: 1px solid #fecaca;
}

.submit-btn {
  width: 100%;
  margin-top: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.test-accounts-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--slate-200);
}

.test-accounts-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--slate-400);
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
  text-align: center;
}

.test-account-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-btn {
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all var(--transition-fast);
  border: 1px solid var(--slate-200);
  background: var(--slate-50);
}

.test-btn:hover {
  background: #ffffff;
  border-color: var(--primary-400);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

.test-role-title {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--slate-800);
}

.test-credentials {
  font-size: 0.725rem;
  color: var(--slate-500);
  font-family: var(--font-mono);
}

@media (max-width: 860px) {
  .login-container {
    flex-direction: column;
  }
  .login-hero {
    padding: 2rem;
  }
  .login-form-wrapper {
    padding: 2rem;
  }
}
</style>

