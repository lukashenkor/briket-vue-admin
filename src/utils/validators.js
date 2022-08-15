export const isPasswordValid = (password) => {
  return !(password.length < 8 ||
    password.search(/\d/g) < 0 ||
    password.search(/[A-Z]/g) < 0 ||
    password.search(/[a-z]/g) < 0 ||
    password.search(/[`~!@#$%^&*\(\)_\-+=\[\]\{\};:'"\\\|,<.>\/?]/g) < 0);

};

export const isUsernameValid = (username) => {
  return username.search(/^[\s0-9a-zA-Z]{2,}$/g) >= 0;
};

export const isEmailValid = (email) => {
  return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
};

export const required = val => !!val || val == '0';
export const minLength = num => val => val?.length >= num;

export const hasRole = (requiredRoles, userRoles) => {
  if (Array.isArray(requiredRoles)) {
    return userRoles.some(role => requiredRoles.includes(role));
  }
  return userRoles.includes(requiredRoles);
}
