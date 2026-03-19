import { useCallback, useRef, useState } from 'react';
import { streamGeminiResponse, GeminiAPIError, type GeminiErrorCode } from '@/api/gemini';
import { getStoredApiKey } from '@/utils/security';
import { consumeToken, getRateLimitStatus } from '@/utils/rateLimiter';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type StreamStatus = 'idle' | 'streaming' | 'success' | 'error';

export interface UseGeminiStreamOptions {
  /** Called after full completion to parse the streamed text */
  onComplete?: (fullText: string) => void;
  /** Called when an error occurs */
  onError?: (code: GeminiErrorCode, message: string) => void;
}

export interface UseGeminiStreamReturn {
  status: StreamStatus;
  streamedText: string;
  errorCode: GeminiErrorCode | null;
  errorMessage: string | null;
  start: (prompt: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

/**
 * Core streaming hook wrapping the Gemini SDK.
 * Handles rate limiting, abort control, and streaming state.
 *
 * @param options - Optional callbacks for completion and error handling
 * @returns Stream state and control functions
 */
export function useGeminiStream(options: UseGeminiStreamOptions = {}): UseGeminiStreamReturn {
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [streamedText, setStreamedText] = useState('');
  const [errorCode, setErrorCode] = useState<GeminiErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (prompt: string) => {
      // Rate limit check
      const rateCheck = consumeToken();
      if (!rateCheck.allowed) {
        const { resetInSeconds } = getRateLimitStatus();
        const msg = `Rate limit reached. Retry in ${resetInSeconds}s.`;
        setStatus('error');
        setErrorCode('QUOTA_EXCEEDED');
        setErrorMessage(msg);
        options.onError?.('QUOTA_EXCEEDED', msg);
        return;
      }

      // API Key check
      const apiKey = getStoredApiKey();
      if (!apiKey) {
        const msg = 'No API key found. Please set your Gemini API key in settings.';
        setStatus('error');
        setErrorCode('API_KEY_INVALID');
        setErrorMessage(msg);
        options.onError?.('API_KEY_INVALID', msg);
        return;
      }

      // Setup abort controller
      abortControllerRef.current = new AbortController();

      // Reset state for new stream
      setStatus('streaming');
      setStreamedText('');
      setErrorCode(null);
      setErrorMessage(null);

      await streamGeminiResponse(apiKey, prompt, {
        signal: abortControllerRef.current.signal,
        onChunk: (chunk) => {
          setStreamedText((prev) => prev + chunk);
        },
        onComplete: (fullText) => {
          setStatus('success');
          options.onComplete?.(fullText);
        },
        onError: (err: GeminiAPIError) => {
          setStatus('error');
          setErrorCode(err.code);
          setErrorMessage(err.message);
          options.onError?.(err.code, err.message);
        },
      });
    },
    [options],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus('idle');
    setStreamedText('');
    setErrorCode(null);
    setErrorMessage(null);
  }, []);

  return { status, streamedText, errorCode, errorMessage, start, stop, reset };
}
