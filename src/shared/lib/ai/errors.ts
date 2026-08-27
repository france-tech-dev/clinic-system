import { APICallError } from "ai";

/** Mensagens amigáveis para falhas do provider (quota, rede, etc.). */
export function formatAiProviderError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const body = error.responseBody ?? "";
    if (
      error.statusCode === 429 ||
      /insufficient_quota|quota/i.test(body) ||
      /insufficient_quota|quota/i.test(error.message)
    ) {
      return "Limite ou crédito da API de IA esgotado. Tente mais tarde ou verifique a conta do provider.";
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "Chave ou permissão da API de IA inválida. Verifique a configuração.";
    }
    if (error.statusCode === 400) {
      return "Pedido rejeitado pelo provider de IA. Verifique o modelo configurado.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Falha na geração por IA.";
}
