import { getFileFromUrl } from "src/utils/file";


export const refreshFields = (object) => {
  for (const key of Object.keys(object)) {
    object[key].value = null;
    object[key].prevValue = null;
    object[key].blurred = false;
    object[key].valid = true;
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
