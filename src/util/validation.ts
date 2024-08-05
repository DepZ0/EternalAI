export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateEmail(email: string) {
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }
}

export function validatePassword(password: string) {
  if (password.length < 6) {
    return { error: "Invalid password. Minimum length 6 characters" };
  }
}

const nameSurnameRegex = /^[a-zA-Z\s]{1,50}$/;
export function validateName(name: string) {
  if (!nameSurnameRegex.test(name)) {
    return { error: "Invalid name. It should contain only letters and a single space, and be 1 to 50 characters long" };
  }
  return null;
}

export function validateSurname(surname: string) {
  if (!nameSurnameRegex.test(surname)) {
    return {
      error: "Invalid surname. It should contain only letters and a single space, and be 1 to 60 characters long",
    };
  }
  return null;
}
