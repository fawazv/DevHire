// Centralized Gemini API exports
export {
  getGeminiClient,
  getModel,
  streamGeminiResponse,
  detectGeminiError,
  getGeminiErrorMessage,
  GeminiAPIError,
} from './gemini';
export type { GeminiErrorCode, StreamCallbacks } from './gemini';
