import { defineStore } from 'pinia';

export const useUtilsStore = defineStore('utils', {
  state: () => ({
    waitingResponse: false
  }),

  getters: {
    /* doubleCount (state) {
      return state.counter * 2
    } */
  },

  actions: {
    updateWaitingResponse (value) {
      this.waitingResponse = value;
    }
  }
})
