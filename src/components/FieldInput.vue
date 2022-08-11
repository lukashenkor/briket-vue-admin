<template>
  <q-input
    v-model="fieldValue"
    :key="field.attributes.name"
    v-bind="field.attributes"
    class="dialog-input"
    :error-message="inputErrorMessage"
    :type="field.attributes.type === 'password' ? isPwd ? 'password' : 'text' : field.attributes.type"
    :rules="[...Object.values(field.validators)] || []"
    :error="!field.valid && field.blurred"
    lazy-rules
  >
    <template v-slot:append v-if="field.attributes.type === 'password'">
      <q-icon
        :name="isPwd ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="isPwd = !isPwd"
      />
    </template>
  </q-input>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps(['field', 'modelValue']);

const emits = defineEmits(['update:modelValue']);
const isPwd = ref(props.field.attributes.type === 'password' ? true : null);

const fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
});

const inputErrorMessage = computed(() => props.field.attributes?.errorMessage || "Некорректное значение");
</script>
