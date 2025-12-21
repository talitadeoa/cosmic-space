import { useCallback, useState } from "react";
import type { MoonPhase, PhaseInputType, PhaseInputRecord } from "@/lib/phaseInputs";

export interface PhaseInputSave {
  moonPhase: MoonPhase;
  inputType: PhaseInputType;
  content: string;
  sourceId?: string | null;
  vibe?: string | null;
  metadata?: Record<string, any> | null;
}

export function usePhaseInputs() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const saveInput = useCallback(async (payload: PhaseInputSave) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/phase-inputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar input da fase");
      }

      const data = await response.json();
      return data.item as PhaseInputRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setSaveError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadInputs = useCallback(
    async (params?: { moonPhase?: MoonPhase; inputType?: PhaseInputType; limit?: number }) => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const searchParams = new URLSearchParams();
        if (params?.moonPhase) searchParams.set("moonPhase", params.moonPhase);
        if (params?.inputType) searchParams.set("inputType", params.inputType);
        if (params?.limit) searchParams.set("limit", String(params.limit));

        const response = await fetch(`/api/phase-inputs?${searchParams.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao carregar inputs da fase");
        }

        const data = await response.json();
        return (data.items as PhaseInputRecord[]) ?? [];
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setLoadError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    saveInput,
    loadInputs,
    isSaving,
    saveError,
    isLoading,
    loadError,
  };
}
