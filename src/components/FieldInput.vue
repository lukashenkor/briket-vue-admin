<template>
  <q-input
    v-model="fieldValue"
    :key="field.attributes.name"
    v-bind="field.attributes"
    class="dialog-input"
    error-message="Поле не может быть пустым"
    :rules="[...Object.values(field.validators)] || []"
  />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps(['field', 'modelValue']);

const emits = defineEmits(['update:modelValue'])

const fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

</script>
