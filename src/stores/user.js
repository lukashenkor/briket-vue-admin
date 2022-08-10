import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    roles: [],
    accessToken: '',
  }),

  getters: {
    getUsername (state) {
      return state.username;
    },
  },

  actions: {
    updateUsername (username) {
      this.username = username;
    },
    updateRoles(roles) {
      this.roles = roles;
    },
    updateAccessToken(token) {
      this.accessToken = token;
    },
  }
})
