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
