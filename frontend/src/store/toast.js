import { reactive } from 'vue';

const state = reactive({
  toasts: []
});

let toastId = 0;

export const useToast = () => {
  const show = (message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    state.toasts.push({
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    });

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  };

  const success = (message, duration = 4000) => show(message, 'success', duration);
  const error = (message, duration = 5000) => show(message, 'error', duration);
  const warning = (message, duration = 4500) => show(message, 'warning', duration);
  const info = (message, duration = 4000) => show(message, 'info', duration);

  const remove = (id) => {
    const index = state.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      state.toasts.splice(index, 1);
    }
  };

  return {
    toasts: state.toasts,
    show,
    success,
    error,
    warning,
    info,
    remove
  };
};

