export function normalizeEvolutionDigits(value: unknown): string {
  if (value === null || value === undefined) {
    throw new Error('Telefone WhatsApp ausente.');
  }
  const trimmed = String(value).trim();
  const lower = trimmed.toLowerCase();
  if (lower.endsWith('@lid') || lower.endsWith('@s.whatsapp.net')) {
    return trimmed;
  }

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  if (!/^[1-9]\d{9,10}$/.test(digits)) {
    throw new Error('Telefone brasileiro inválido. Informe DDD + número (10 ou 11 dígitos).');
  }
  if (digits.slice(0, 2) === '00') {
    throw new Error('DDD inválido.');
  }
  return `55${digits}`;
}

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

export function getEvolutionConfig(): EvolutionConfig {
  return {
    baseUrl: (Deno.env.get('EVOLUTION_API_URL') ?? '').trim().replace(/\/$/, ''),
    apiKey: (Deno.env.get('EVOLUTION_API_KEY') ?? '').trim(),
    instance: (Deno.env.get('EVOLUTION_INSTANCE_NAME') ?? '').trim(),
  };
}

export function isEvolutionConfigured(cfg: EvolutionConfig): boolean {
  return Boolean(cfg.baseUrl && cfg.apiKey && cfg.instance);
}

export interface EvolutionSendResult {
  ok: boolean;
  skipped?: boolean;
  messageId?: string | null;
  error?: string;
}

export async function sendEvolutionText(params: {
  to: string;
  text: string;
  linkPreview?: boolean;
}): Promise<EvolutionSendResult> {
  const cfg = getEvolutionConfig();
  if (!isEvolutionConfigured(cfg)) {
    return {
      ok: false,
      skipped: true,
      error: 'Secrets EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE_NAME não configuradas.',
    };
  }

  let number: string;
  try {
    number = normalizeEvolutionDigits(params.to);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Telefone inválido',
    };
  }

  try {
    const response = await fetch(
      `${cfg.baseUrl}/message/sendText/${encodeURIComponent(cfg.instance)}`,
      {
        method: 'POST',
        headers: {
          apikey: cfg.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          number,
          text: params.text,
          linkPreview: params.linkPreview ?? false,
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );

    const rawText = await response.text();
    let body: Record<string, unknown> | null = null;
    try {
      body = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;
    } catch {
      body = { raw: rawText.slice(0, 300) };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: `Evolution HTTP ${response.status}`,
      };
    }

    const key = body?.key as { id?: string } | undefined;
    const messageId =
      key?.id ||
      (typeof body?.messageId === 'string' ? body.messageId : null) ||
      (typeof body?.id === 'string' ? body.id : null) ||
      null;

    return { ok: true, messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao conectar na Evolution API',
    };
  }
}

export async function checkEvolutionInstance(): Promise<{
  ok: boolean;
  configured: boolean;
  state: string;
  instanceName: string;
  error?: string;
}> {
  const cfg = getEvolutionConfig();
  if (!isEvolutionConfigured(cfg)) {
    return {
      ok: false,
      configured: false,
      state: 'unconfigured',
      instanceName: cfg.instance,
      error: 'Secrets EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE_NAME não configuradas.',
    };
  }

  try {
    const response = await fetch(
      `${cfg.baseUrl}/instance/connectionState/${encodeURIComponent(cfg.instance)}`,
      {
        method: 'GET',
        headers: { apikey: cfg.apiKey },
        signal: AbortSignal.timeout(8_000),
      },
    );
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        state: 'error',
        instanceName: cfg.instance,
        error: `Evolution HTTP ${response.status}`,
      };
    }
    const inst = (data?.instance as Record<string, unknown> | undefined) ?? data;
    const state = typeof inst?.state === 'string' ? inst.state : 'unknown';
    return {
      ok: true,
      configured: true,
      state,
      instanceName: cfg.instance,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      state: 'unreachable',
      instanceName: cfg.instance,
      error: err instanceof Error ? err.message : 'Falha ao consultar Evolution API',
    };
  }
}
