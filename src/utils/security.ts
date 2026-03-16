/**
 * Validates a Google Gemini API key format.
 * Format: Starts with AIza followed by 35 alphanumeric characters or hyphens/underscores.
 *
 * @param key - The API key to validate
 * @returns true if valid, false otherwise
 */
export function isValidGeminiKey(key: string): boolean {
  if (!key) return false;
  // Gemini API keys start with AIza and are exactly 39 characters long
  const geminiKeyRegex = /^AIza[0-9A-Za-z_-]{35}$/;
  return geminiKeyRegex.test(key.trim());
}

/**
 * Masks an API key for safe display in the UI.
 * Shows only the "AIza" prefix and the last 4 characters.
 *
 * @param key - The raw API key
 * @returns The masked key (e.g., "AIza••••••••••••abcd")
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 10) return '';
  
  const prefix = key.slice(0, 4); // "AIza"
  const suffix = key.slice(-4);
  const maskLength = key.length - 8;
  const mask = '•'.repeat(Math.min(maskLength, 20)); // Limit mask dots for UI
  
  return `${prefix}${mask}${suffix}`;
}

/**
 * Safely retrieves the API key from sessionStorage.
 *
 * @returns The raw API key if valid, null otherwise
 */
export function getStoredApiKey(): string | null {
  try {
    const key = window.sessionStorage.getItem('dhip_gemini_key');
    if (key && isValidGeminiKey(key)) {
      return key;
    }
    // If key is invalid, clean it up
    if (key) window.sessionStorage.removeItem('dhip_gemini_key');
    return null;
  } catch {
    return null;
  }
}

/**
 * Stores the API key securely in sessionStorage (clears when browser tab closes).
 *
 * @param key - The valid API key to store
 */
export function storeApiKey(key: string): void {
  try {
    window.sessionStorage.setItem('dhip_gemini_key', key.trim());
  } catch (err) {
    console.error('Failed to securely store API key');
  }
}

/**
 * Removes the API key from sessionStorage.
 */
export function removeApiKey(): void {
  try {
    window.sessionStorage.removeItem('dhip_gemini_key');
  } catch {
    // Ignore
  }
}
