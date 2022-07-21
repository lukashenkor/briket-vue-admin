<template>
  <button
    :class="classes"
    :type="type"
  >
    <slot></slot>
  </button>
</template>
<script setup>
const props = defineProps(['label', 'type', 'classes'])
</script>
<style></style>
