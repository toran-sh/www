import { describe, it, expect } from "vitest";
import { generateSubdomain, isValidSubdomain } from "@/lib/subdomain";

describe("generateSubdomain", () => {
  it("should generate a string", () => {
    const subdomain = generateSubdomain();
    expect(typeof subdomain).toBe("string");
  });

  it("should generate a subdomain with 8-10 characters", () => {
    for (let i = 0; i < 100; i++) {
      const subdomain = generateSubdomain();
      expect(subdomain.length).toBeGreaterThanOrEqual(8);
      expect(subdomain.length).toBeLessThanOrEqual(10);
    }
  });

  it("should only contain lowercase alphanumeric characters", () => {
    for (let i = 0; i < 100; i++) {
      const subdomain = generateSubdomain();
      expect(subdomain).toMatch(/^[a-z0-9]+$/);
    }
  });

  it("should generate unique subdomains", () => {
    const subdomains = new Set<string>();
    for (let i = 0; i < 100; i++) {
      subdomains.add(generateSubdomain());
    }
    // With random generation, we should have mostly unique values
    expect(subdomains.size).toBeGreaterThan(90);
  });
});

describe("isValidSubdomain", () => {
  it("should return true for valid subdomains", () => {
    expect(isValidSubdomain("abcd1234")).toBe(true);
    expect(isValidSubdomain("xyz789abc")).toBe(true);
    expect(isValidSubdomain("0123456789")).toBe(true);
  });

  it("should return false for subdomains that are too short", () => {
    expect(isValidSubdomain("abc1234")).toBe(false);
    expect(isValidSubdomain("ab")).toBe(false);
    expect(isValidSubdomain("")).toBe(false);
  });

  it("should return false for subdomains that are too long", () => {
    expect(isValidSubdomain("abcdefghijk")).toBe(false);
    expect(isValidSubdomain("123456789012")).toBe(false);
  });

  it("should return false for subdomains with uppercase letters", () => {
    expect(isValidSubdomain("ABCD1234")).toBe(false);
    expect(isValidSubdomain("Abcd1234")).toBe(false);
  });

  it("should return false for subdomains with special characters", () => {
    expect(isValidSubdomain("abcd-123")).toBe(false);
    expect(isValidSubdomain("abcd_123")).toBe(false);
    expect(isValidSubdomain("abcd.123")).toBe(false);
  });

  it("should return false for null or undefined", () => {
    expect(isValidSubdomain(null as unknown as string)).toBe(false);
    expect(isValidSubdomain(undefined as unknown as string)).toBe(false);
  });

  it("should return false for non-string types", () => {
    expect(isValidSubdomain(12345678 as unknown as string)).toBe(false);
    expect(isValidSubdomain({} as unknown as string)).toBe(false);
  });
});
