import { reactive, ref, watch } from "vue";


export function useField(field) {
  const valid = ref(true);
  const value = ref(field.value);
  const errors = reactive({});

  const reassign = val => {
    valid.value = true;
    Object.keys(field.validators ?? {}).forEach(validator => {
      const isValid = field.validators[validator](val);
      errors[validator] = !isValid;
      if (!isValid) {
        valid.value = false;
      }
    });
  }


  watch(value, reassign);
  reassign(value.value);

  return {
    value,
    valid,
    errors
  }
}
