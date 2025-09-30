// Input Sanitization Module
// Addresses DEBT-001: No Input Sanitization (XSS vulnerability)
// Threat Model references: T1.1 (XSS in player names), T1.2 (Dictionary injection), T1.3 (Malicious tile letters)

/**
 * Security Decision: Whitelist-based validation
 * We use whitelist validation (only allow known-good characters) rather than
 * blacklist filtering (block known-bad patterns). This is more secure because
 * attackers cannot bypass filters with encoding tricks.
 */

export interface SanitizationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

/**
 * Sanitize and validate player names
 *
 * Security Requirements:
 * - Only alphanumeric characters and spaces (prevents XSS)
 * - Length limits (prevents DoS via large payloads)
 * - No HTML entities or special characters
 *
 * Threat Model: T1.1 - XSS in Player Names
 * DEBT-001: This fixes the HIGH priority security debt
 */
export function sanitizePlayerName(name: string): SanitizationResult {
  // Security: Reject null/undefined/non-string inputs
  if (typeof name !== 'string') {
    return {
      valid: false,
      error: 'Player name must be a string',
    };
  }

  // Trim whitespace
  const trimmed = name.trim();

  // Security: Length validation (DoS protection - T3.3)
  if (trimmed.length < 3) {
    return {
      valid: false,
      error: 'Name must be at least 3 characters',
    };
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      error: 'Name must be at most 20 characters',
    };
  }

  // Security: Whitelist validation - only allow alphanumeric and spaces
  // This prevents XSS attacks like <script>alert('XSS')</script>
  // This prevents HTML injection like <img src=x onerror=alert(1)>
  const alphanumericPattern = /^[a-zA-Z0-9 ]+$/;

  if (!alphanumericPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, and spaces',
    };
  }

  // Security: Additional check for multiple consecutive spaces (normalization)
  const normalized = trimmed.replace(/\s+/g, ' ');

  return {
    valid: true,
    sanitized: normalized,
  };
}

/**
 * Validate tile letters
 *
 * Security Requirements:
 * - Only A-Z or _ (blank tile)
 * - Single character only
 * - Uppercase only
 *
 * Threat Model: T1.3 - Malicious Tile Letters
 * Prevents injection of HTML/script tags via tile letters
 */
export function validateTileLetter(letter: string): SanitizationResult {
  // Security: Type check
  if (typeof letter !== 'string') {
    return {
      valid: false,
      error: 'Tile letter must be a string',
    };
  }

  // Security: Length check (must be exactly 1 character)
  if (letter.length !== 1) {
    return {
      valid: false,
      error: 'Tile letter must be exactly one character',
    };
  }

  // Security: Whitelist validation - only A-Z or underscore (blank)
  // This prevents XSS like {letter: '<IMG SRC=x onerror=alert(1)>'}
  const validLetterPattern = /^[A-Z_]$/;

  if (!validLetterPattern.test(letter)) {
    return {
      valid: false,
      error: 'Tile letter must be A-Z or _ (blank)',
    };
  }

  return {
    valid: true,
    sanitized: letter,
  };
}

/**
 * Validate dictionary word queries
 *
 * Security Requirements:
 * - Only alphabetic characters (A-Z)
 * - Length limits
 * - No path traversal characters
 *
 * Threat Model: T1.2 - Injection in Dictionary Check Endpoint
 * Prevents path traversal: /api/dictionary/check/../../../etc/passwd
 */
export function validateDictionaryWord(word: string): SanitizationResult {
  // Security: Type check
  if (typeof word !== 'string') {
    return {
      valid: false,
      error: 'Word must be a string',
    };
  }

  const trimmed = word.trim();

  // Security: Empty check
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Word cannot be empty',
    };
  }

  // Security: Length validation (reasonable word length, DoS protection)
  if (trimmed.length > 15) {
    return {
      valid: false,
      error: 'Word too long (max 15 characters)',
    };
  }

  // Security: Whitelist validation - ONLY alphabetic characters
  // This prevents:
  // - Path traversal: ../../../etc/passwd
  // - Command injection: word; rm -rf /
  // - Special characters that might be interpreted
  const alphabeticPattern = /^[A-Za-z]+$/;

  if (!alphabeticPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Word can only contain letters A-Z',
    };
  }

  // Normalize to uppercase (Scrabble standard)
  const normalized = trimmed.toUpperCase();

  return {
    valid: true,
    sanitized: normalized,
  };
}

/**
 * Validate array sizes to prevent payload size attacks
 *
 * Security Requirement: Prevent DoS via large arrays
 * Threat Model: T3.3 - Large Payload Attacks
 */
export function validateArraySize<T>(
  array: any,
  maxSize: number,
  itemName: string
): SanitizationResult {
  // Security: Type check
  if (!Array.isArray(array)) {
    return {
      valid: false,
      error: `${itemName} must be an array`,
    };
  }

  // Security: Size limit to prevent memory exhaustion
  if (array.length > maxSize) {
    return {
      valid: false,
      error: `Too many ${itemName} (max ${maxSize})`,
    };
  }

  return {
    valid: true,
  };
}

/**
 * Sanitize error messages before sending to client
 *
 * Security Requirement: Don't leak internal state
 * Threat Model: T4.2 - Game State Leakage
 *
 * Removes stack traces, file paths, and internal details
 */
export function sanitizeErrorMessage(error: any): string {
  // Security: Never send raw error objects (might contain stack traces)
  if (typeof error === 'string') {
    // Remove file paths if present
    return error.replace(/\/[\w\/\-\.]+/g, '[path]')
                .replace(/\\[\w\\-\.]+/g, '[path]')
                .replace(/at .+/g, '');
  }

  if (error instanceof Error) {
    // Return only the message, never the stack
    return error.message;
  }

  // Security: Default safe error message
  return 'An error occurred';
}
