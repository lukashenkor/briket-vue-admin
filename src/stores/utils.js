import { defineStore } from 'pinia';

export const useUtilsStore = defineStore('utils', {
  state: () => ({
    waitingResponse: false
  }),

  getters: {
  },

  actions: {
    updateWaitingResponse (value) {
      this.waitingResponse = value;
    }
  }
})
