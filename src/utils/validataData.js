export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const emailValidator = (rule, value) => {
  if (!value) {
    return Promise.reject("Email là bắt buộc!");
  }
  if (!validateEmail(value)) {
    return Promise.reject("Email không hợp lệ!");
  }
  return Promise.resolve();
};

//////////////////////
export const validatePassword = (password) => {
  // Kiểm tra độ dài mật khẩu tối thiểu
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự!";
  }
  // Kiểm tra có ký tự chữ cái và số
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ cái và một số!";
  }
  return "";
};

export const passwordValidator = (rule, value) => {
  if (!value) {
    return Promise.reject("Mật khẩu là bắt buộc!");
  }
  const error = validatePassword(value);
  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve();
};

export const validatePhoneNumber = (phoneNumber) => {
  return String(phoneNumber).match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g);
};

export const phoneNumberValidator = (rule, value) => {
  if (!value) {
    return Promise.reject("Số điện thoại là bắt buộc!");
  }
  if (!validatePhoneNumber(value)) {
    return Promise.reject("Số điện thoại không hợp lệ!");
  }
  return Promise.resolve();
};
