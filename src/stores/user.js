import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    data: {
      username: '',
      roles: [],
      id: null,
    },
    accessToken: '',
  }),

  getters: {
    getUsername (state) {
      return state.data.username;
    },
  },

  actions: {
    updateUserData(newData) {
      this.data = { ...this.data, ...newData };
    },
    updateAccessToken(token) {
      this.accessToken = token;
    },
    updateUserId(id) {
      this.id = id;
    },
  }
})
