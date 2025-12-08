import { useEffect, useRef, useState } from "react";

type AutosaveStatus = "idle" | "typing" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  value: string;
  onSave: (value: string) => Promise<void>;
  enabled?: boolean;
  delayMs?: number;
  minLength?: number;
}

/**
 * Dispara salvamento automático de um valor com debounce.
 */
export function useAutosave({
  value,
  onSave,
  enabled = true,
  delayMs = 800,
  minLength = 1,
}: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus("idle");
      setError(null);
      return;
    }

    const trimmed = value.trim();

    if (timerRef.current) clearTimeout(timerRef.current);

    if (trimmed.length < minLength) {
      setStatus("idle");
      setError(null);
      return;
    }

    if (trimmed === lastSavedRef.current) {
      setStatus("saved");
      return;
    }

    setStatus("typing");
    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      setError(null);

      try {
        await onSave(trimmed);

        if (requestIdRef.current === nextRequestId) {
          lastSavedRef.current = trimmed;
          setStatus("saved");
        }
      } catch (err) {
        if (requestIdRef.current === nextRequestId) {
          setStatus("error");
          setError(
            err instanceof Error ? err.message : "Erro ao salvar automaticamente",
          );
        }
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, enabled, delayMs, minLength, onSave]);

  return { status, error };
}
