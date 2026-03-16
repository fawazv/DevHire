import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, ShieldAlert, X, Eye, EyeOff, Trash2 } from 'lucide-react';

import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  isValidGeminiKey,
  maskApiKey,
  storeApiKey,
  removeApiKey,
  getStoredApiKey,
} from '@/utils/security';

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

export interface ApiKeyManagerProps {
  // Driven primarily by global state, but can accept props
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function ApiKeyManager() {
  const { isApiKeyModalOpen, setApiKeyModalOpen, hasApiKey, setHasApiKey } = useAppStore();
  const { addToast } = useToast();

  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [storedMaskedKey, setStoredMaskedKey] = useState<string>('');

  // Sync masking state when modal opens
  useEffect(() => {
    if (isApiKeyModalOpen) {
      const stored = getStoredApiKey();
      if (stored) {
        setStoredMaskedKey(maskApiKey(stored));
      } else {
        setStoredMaskedKey('');
      }
      setInputKey('');
      setError(undefined);
      setShowPassword(false);
    }
  }, [isApiKeyModalOpen]);

  // Handle saving the key
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputKey.trim()) {
      setError('Key cannot be empty');
      return;
    }

    if (!isValidGeminiKey(inputKey)) {
      setError('Invalid Gemini API Key format (must start with AIza...)');
      return;
    }

    // Valid check passed
    storeApiKey(inputKey);
    setHasApiKey(true);
    setStoredMaskedKey(maskApiKey(inputKey));
    setInputKey('');
    setError(undefined);
    addToast('API Key saved securely', 'success', 'Stored in memory for this session only.');
    setApiKeyModalOpen(false);
  };

  // Handle removing the key
  const handleRemove = () => {
    removeApiKey();
    setHasApiKey(false);
    setStoredMaskedKey('');
    setInputKey('');
    addToast('API Key removed', 'info', 'Your key has been wiped from memory.');
  };

  // Close modal helper
  const handleClose = () => {
    setApiKeyModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isApiKeyModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              layoutId="api-key-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="api-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-text">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Key size={18} />
                  </div>
                  <h2 id="api-modal-title" className="text-lg font-display font-semibold">
                    Gemini API Key
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-text-secondary hover:bg-elevated hover:text-text transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-6">
                <p className="text-sm text-text-secondary font-body leading-relaxed">
                  DevHire Intelligence uses the <strong className="text-text">Gemini 2.0 Flash</strong> model.
                  Your key is securely stored in <code>sessionStorage</code> and is cleared automatically when you close the tab. It never touches our backend.
                </p>

                {/* State: Key is already set */}
                {hasApiKey && storedMaskedKey ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-accent-success/30 bg-accent-success/10">
                      <ShieldCheck size={20} className="text-accent-success shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none mb-1 text-accent-success">
                          Active Key Present
                        </p>
                        <p className="text-xs font-mono text-text-secondary truncate">
                          {storedMaskedKey}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemove} className="text-accent-danger hover:text-accent-danger hover:bg-accent-danger/10 border-accent-danger/20 w-full" leftIcon={<Trash2 size={16} />}>
                      Remove Key
                    </Button>
                  </div>
                ) : (
                  /* State: Enter new key */
                  <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <Input
                      id="gemini-api-key"
                      label="API Key"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={inputKey}
                      onChange={(e) => {
                        setInputKey(e.target.value);
                        if (error) setError(undefined);
                      }}
                      error={error}
                      rightAdornment={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-text transition-colors"
                          aria-label={showPassword ? 'Hide key' : 'Show key'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                      autoComplete="off"
                    />

                    <div className="flex items-start gap-2 text-xs text-text-secondary mt-1">
                      <ShieldAlert size={14} className="mt-0.5 shrink-0 text-accent-warning" />
                      <p>
                        Need an API key? Get a free one from{' '}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          Google AI Studio
                        </a>.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Save Key
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
