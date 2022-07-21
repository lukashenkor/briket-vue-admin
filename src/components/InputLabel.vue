<template>
  <label :for="name">{{ label }}
    <input :type="type" :name="name" :id="name">
  </label>
</template>

<script setup>

const props = defineProps([ 'label', 'name', 'type' ]);

console.log(props.label);
console.log(props.name);




/* onMounted(() => {
  console.log('On mounted')
}) */
</script>
