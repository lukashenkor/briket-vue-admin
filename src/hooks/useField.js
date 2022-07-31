import { reactive, ref, watch } from "vue";


export function useField(field) {
  const valid = ref(true);
  const value = ref(field.value);
  const prevValue = ref(field.prevValue);
  const errors = reactive({});
  const edited = ref(false);
  const blurred = ref(field.blurred);
  const isDate = ref(field.isDate);


  const reassign = val => {
    valid.value = true;
    edited.value = val !== prevValue.value;
    console.log('prevValue.value', prevValue.value);
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
    prevValue,
    valid,
    errors,
    edited,
    blurred,
    isDate,
    type: field.type,
  }
}
