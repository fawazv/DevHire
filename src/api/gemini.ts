import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────

export type GeminiErrorCode =
  | 'API_KEY_INVALID'
  | 'QUOTA_EXCEEDED'
  | 'SAFETY_BLOCKED'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN';

export class GeminiAPIError extends Error {
  constructor(
    public readonly code: GeminiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// ─────────────────────────────────────────
// Error Detection Utility
// ─────────────────────────────────────────

/**
 * Detects semantic Gemini error codes from raw error messages.
 * Never exposes the API key in any branch.
 */
export function detectGeminiError(message: string): GeminiErrorCode {
  const msg = message.toLowerCase();
  if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('invalid api key')) {
    return 'API_KEY_INVALID';
  }
  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
    return 'QUOTA_EXCEEDED';
  }
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harm')) {
    return 'SAFETY_BLOCKED';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'NETWORK_ERROR';
  }
  return 'UNKNOWN';
}

export function getGeminiErrorMessage(code: GeminiErrorCode): string {
  switch (code) {
    case 'API_KEY_INVALID':
      return 'Your API key is invalid. Please update it in settings.';
    case 'QUOTA_EXCEEDED':
      return 'Gemini API quota exceeded. Please wait a few minutes and try again.';
    case 'SAFETY_BLOCKED':
      return 'Request was blocked by Gemini safety filters. Please modify your input.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// ─────────────────────────────────────────
// Client Initialization
// ─────────────────────────────────────────

/**
 * Creates a Gemini GenerativeAI client with the provided API key.
 * @param apiKey - Raw API key from sessionStorage (never logged)
 */
export const getGeminiClient = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Gets the gemini-2.0-flash model instance.
 * @param apiKey - Raw API key
 */
export const getModel = (apiKey: string) => {
  const genAI = getGeminiClient(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// ─────────────────────────────────────────
// Streaming Helper
// ─────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: GeminiAPIError) => void;
  signal?: AbortSignal;
}

/**
 * Executes a Gemini streaming request and fires callbacks per token.
 * Supports AbortController for cleanup on unmount.
 */
export async function streamGeminiResponse(
  apiKey: string,
  prompt: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  try {
    const model = getModel(apiKey);
    const result = await model.generateContentStream(prompt);

    let fullText = '';

    for await (const chunk of result.stream) {
      // Check if aborted before processing each chunk
      if (callbacks.signal?.aborted) return;

      const chunkText = chunk.text();
      fullText += chunkText;
      callbacks.onChunk(chunkText);
    }

    callbacks.onComplete(fullText);
  } catch (err) {
    if (err instanceof Error) {
      const code = detectGeminiError(err.message);
      callbacks.onError(new GeminiAPIError(code, getGeminiErrorMessage(code)));
    } else {
      callbacks.onError(new GeminiAPIError('UNKNOWN', getGeminiErrorMessage('UNKNOWN')));
    }
  }
}
