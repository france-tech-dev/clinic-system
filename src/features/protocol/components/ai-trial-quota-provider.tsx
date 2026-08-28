"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AiTrialQuotaDTO } from "@/shared/constants/ai-limits";
import { consumeTrialAiQuota } from "@/shared/lib/ai/_lib/quota";

type AiTrialQuotaContextValue = {
  quota: AiTrialQuotaDTO | null;
  consumeGeneration: () => void;
};

const AiTrialQuotaContext = createContext<AiTrialQuotaContextValue | null>(
  null,
);

export function AiTrialQuotaProvider({
  initialQuota,
  children,
}: {
  initialQuota: AiTrialQuotaDTO | null;
  children: ReactNode;
}) {
  const [quota, setQuota] = useState(initialQuota);

  const consumeGeneration = useCallback(() => {
    setQuota((current) => (current ? consumeTrialAiQuota(current) : current));
  }, []);

  return (
    <AiTrialQuotaContext.Provider value={{ quota, consumeGeneration }}>
      {children}
    </AiTrialQuotaContext.Provider>
  );
}

export function useAiTrialQuota(): AiTrialQuotaContextValue {
  const ctx = useContext(AiTrialQuotaContext);
  return ctx ?? { quota: null, consumeGeneration: () => {} };
}
