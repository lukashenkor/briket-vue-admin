import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
  }),

  getters: {
    getUsername (state) {
      return state.username;
    },
  },

  actions: {
    updateUsername (username) {
      this.username = username;
    }
  }
})
