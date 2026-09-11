const MAX_MESA_ID = 100000;

export type MesaQrTarget =
  | { kind: 'secure'; value: string }
  | { kind: 'legacy'; idMesa: number };

function parsePositiveId(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= MAX_MESA_ID ? id : null;
}

function parseSecureValue(value: string): string | null {
  const normalized = value.trim();
  return /^(?:[a-f0-9]{64}|[a-f0-9]{12})$/i.test(normalized) ? normalized : null;
}

export function parseMesaQrPayload(rawValue: string): MesaQrTarget | null {
  const value = rawValue.trim();
  if (!value) return null;

  const directId = parsePositiveId(value);
  if (directId) return { kind: 'legacy', idMesa: directId };
  const directSecure = parseSecureValue(value);
  if (directSecure) return { kind: 'secure', value: directSecure };

  try {
    const url = new URL(value);
    if (url.protocol === 'uttof:' && url.hostname === 'mesa') {
      const id = parsePositiveId(url.pathname.split('/').filter(Boolean)[0]);
      return id ? { kind: 'legacy', idMesa: id } : null;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const queryValue = url.searchParams.get('token') ?? url.searchParams.get('codigo');
    const secureQuery = queryValue ? parseSecureValue(queryValue) : null;
    if (secureQuery) return { kind: 'secure', value: secureQuery };

    const segment = url.pathname.match(/\/(?:mesa|mesas)\/([^/]+)(?:\/|$)/i)?.[1] ?? '';
    const securePath = parseSecureValue(segment);
    if (securePath) return { kind: 'secure', value: securePath };
    const pathId = parsePositiveId(segment);
    return pathId ? { kind: 'legacy', idMesa: pathId } : null;
  } catch {
    return null;
  }
}
