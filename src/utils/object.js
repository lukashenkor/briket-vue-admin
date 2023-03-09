import { getFileFromUrl } from "src/utils/file";


export const refreshFields = (object, isValid = true) => {
  for (const key of Object.keys(object)) {
    object[key].value = null;
    object[key].prevValue = null;
    object[key].blurred = false;
    object[key].valid = isValid;
  }
};

export const blurred = (object, field) => {
  object[field].blurred = true;
};

export const setFields = async (row, object) => {
  for (const entry of Object.entries(row)) {
    const [ key, value ] = entry;
    if (object.hasOwnProperty(key)) {
      if (key === 'file') {
        const file = await getFileFromUrl(value.url, value.name);
        object[key].value = file;
        object[key].prevValue = file;
      } else {
        object[key].value = value;
        object[key].prevValue = value;
      }
      object[key].blurred = false;
    }
  }
};


export const hasInvalidFields = (object) => {
  for (const value of Object.values(object)) {
    if (value.hasOwnProperty("hidden") && value.hidden) continue;
    if (value.hasOwnProperty("valid") && !value.valid) {
      return true;
    }
  }
  return false;
}
