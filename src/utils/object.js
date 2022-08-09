export const refreshFields = (object) => {
  for (const key of Object.keys(object)) {
    object[key].value = '';
    object[key].prevValue = '';
    object[key].blurred = false;
    object[key].valid = true;
  }
};
export const blurred = (object, field) => {
  object[field].blurred = true;
};

export const setFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [key, value] = entry;
    if (object.hasOwnProperty(key)) {
      object[key].value = value;
      object[key].prevValue = value;
      object[key].blurred = false;
    }
  });
};
