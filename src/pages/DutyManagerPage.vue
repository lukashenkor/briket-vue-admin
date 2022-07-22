<template>
  <div class="duty-manager flex">
    <div class="q-pa-md flex column duty-manager__datepicker">
      <q-date v-model="dateRange" range first-day-of-week="1"/>
      <q-btn
        label="Выбрать"
        color="positive"
        class="q-mt-lg"
        size="lg"
        @click="pickDateRange"
      />
    </div>
    <div class="q-pa-md duty-manager__content">
      123
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";


const dateRange = ref('');

const pickDateRange = () => {
  console.log('dateRange', dateRange.value);
}
</script>

<style scoped>

</style>
