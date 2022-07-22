import { reactive } from "vue";
import { useField } from "src/hooks/useField";


export function useEditAdmin(init = {}) {
  const object = reactive({});

  for (const [ key, value ] of Object.entries(init)) {
    object[key] = useField(value);
  }

  return object;
}
