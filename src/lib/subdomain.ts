export function generateSubdomain(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8 + Math.floor(Math.random() * 3); // 8-10 chars
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || typeof subdomain !== "string") {
    return false;
  }
  // Must be 8-10 lowercase alphanumeric characters
  return /^[a-z0-9]{8,10}$/.test(subdomain);
}
