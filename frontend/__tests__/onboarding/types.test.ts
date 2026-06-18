/**
 * Tests for onboarding types and validation helpers.
 */

import {
  isValidEmail,
  validatePassword,
  type PasswordStrength,
} from "@/features/onboarding/types/onboarding";

describe("onboarding types - email validation", () => {
  it("validates correct email formats", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user+tag@domain.co.uk")).toBe(true);
    expect(isValidEmail("name123@subdomain.example.org")).toBe(true);
  });

  it("rejects invalid email formats", () => {
    expect(isValidEmail("abc")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user domain@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("onboarding types - password validation", () => {
  it("accepts valid strong passwords", () => {
    const result = validatePassword("Password1");
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe("strong");
    expect(result.errors).toHaveLength(0);
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = validatePassword("Pass1");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters"
    );
  });

  it("rejects passwords without uppercase", () => {
    const result = validatePassword("password1");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  it("rejects passwords without lowercase", () => {
    const result = validatePassword("PASSWORD1");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  it("rejects passwords without number", () => {
    const result = validatePassword("Password");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one number"
    );
  });

  it("classifies password strength correctly", () => {
    // Weak: < 8 chars or only one character type
    const weak1 = validatePassword("short");
    expect(weak1.strength).toBe("weak");

    const weak2 = validatePassword("Short");
    expect(weak2.strength).toBe("weak");

    // Medium: 8+ chars, 2 of 3 types
    const medium = validatePassword("password1");
    expect(medium.strength).toBe("medium");

    // Strong: 8+ chars, all 3 types
    const strong = validatePassword("Password1");
    expect(strong.strength).toBe("strong");
  });

  it("returns multiple errors for multiple violations", () => {
    const result = validatePassword("a");
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
