import { reactive } from "vue";
import { useField } from "src/hooks/useField";
import dayjs from "dayjs";


export function useEditField(init = {}) {
  const object = reactive({});

  for (const [ key, value ] of Object.entries(init)) {
    object[key] = useField(value);
    object[key].name = key;
  }
  return object;
}
