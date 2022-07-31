<template>
  <div class="user-bar">
    <span>{{ nameFirstLetter }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";


const props = defineProps(['modelValue']);
const nameFirstLetter = computed(() => {
  return props.modelValue?.username ? props.modelValue.username[0].toUpperCase() : '?';
})
</script>

<style scoped>
  .user-bar {
    border-radius: 50%;
    border: 1px solid #ffffff;
    background-color: #5db28d;
    width: 50px;
    height: 50px;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .user-bar > * {
    margin: 0;
  }

  .user-bar > span {
    font-size: 28px;
  }
</style>
