import { reactive, ref, watch } from "vue";


export function useField(field) {
  const valid = ref(true);
  const value = ref(field.value);
  const prevValue = ref(field.prevValue);
  const errors = reactive({});
  const edited = ref(false);
  const blurred = ref(field.blurred);
  const isDate = ref(field.isDate);
  const validators = ref(field.validators);


  const reassign = val => {
    valid.value = true;
    blurred.value = false;
    if (val instanceof File || prevValue.value instanceof File) {
      edited.value = val?.name !== prevValue.value?.name
        ||  val?.size !== prevValue.value?.size
    } else if (typeof val === "object" && !Array.isArray(val)) {
      edited.value = val?.value !== prevValue?.value?.value;
    } else {
      edited.value = val !== prevValue.value;
    }
    Object.keys(field.validators ?? {}).forEach(validator => {
      const isValid = field.validators[validator](val);
      errors[validator] = !isValid;
      if (!isValid) {
        valid.value = false;
      }
    });
  };


  watch(value, reassign, {deep: true});
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
    attributes: field.attributes,
    hidden: field.hidden,
    input: field.input,
    validators,
    methods: field?.methods,
  };
}
