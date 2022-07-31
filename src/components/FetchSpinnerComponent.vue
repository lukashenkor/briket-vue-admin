<template>
  <div class="flex column items-center q-mx-auto q-pt-lg" v-if="fetching">
    <h2>{{ label }}</h2>
    <q-spinner-dots :size="size" :color="color"/>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Загрузка'
  },
  fetching: {
    type: Boolean,
    default: true,
  },
  size: {
    type: [ String, Number ],
    default: '80',
  },
  color: {
    type: String,
    default: "primary"
  }
});
</script>

<style scoped>

</style>
