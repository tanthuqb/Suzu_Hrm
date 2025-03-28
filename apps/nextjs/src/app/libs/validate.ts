export const isValidEmail = (email: string) => {
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allowedDomains = ["@suzu.edu.vn", "@suzu.group"];
  const lower = email.toLowerCase();
  return validFormat && allowedDomains.some((domain) => lower.endsWith(domain));
};

export const isStrongPassword = (password: string) => {
  return password.length >= 8 && /\d/.test(password);
};
