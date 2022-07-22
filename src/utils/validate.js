export const isPasswordValid = (password) => {
  return !(password.length < 8 ||
    password.search(/\d/g) < 0 ||
    password.search(/[A-Z]/g) < 0 ||
    password.search(/[a-z]/g) < 0 ||
    password.search(/[`~!@#$%^&*\(\)_\-+=\[\]\{\};:'"\\\|,<.>\/?]/g) < 0);

};

export const isUsernameValid = (username) => {
  console.log('isUsernameValid');
  return username.search(/^[\s0-9a-zA-Z]{2,}$/g) >= 0;
};

export const isEmailValid = (email) => {
  console.log('isEmailValid');
  return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
};
