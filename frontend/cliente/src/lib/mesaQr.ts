const MAX_MESA_ID = 100000;

function parsePositiveId(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= MAX_MESA_ID ? id : null;
}

function parseJsonPayload(value: string): number | null {
  try {
    const payload: unknown = JSON.parse(value);
    if (typeof payload !== 'object' || payload === null) return null;
    const record = payload as Record<string, unknown>;
    if (record.type !== 'uttof_mesa') return null;
    return parsePositiveId(String(record.id_mesa ?? ''));
  } catch {
    return null;
  }
}

export function createMesaQrPayload(idMesa: number): string {
  return `uttof://mesa/${idMesa}`;
}

export function parseMesaQrPayload(rawValue: string): number | null {
  const value = rawValue.trim();
  if (!value) return null;

  const directId = parsePositiveId(value);
  if (directId) return directId;

  const jsonId = parseJsonPayload(value);
  if (jsonId) return jsonId;

  try {
    const url = new URL(value);
    if (url.protocol === 'uttof:' && url.hostname === 'mesa') {
      return parsePositiveId(url.pathname.split('/').filter(Boolean)[0]);
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const queryId = parsePositiveId(
      url.searchParams.get('id_mesa') ?? url.searchParams.get('mesa_id') ?? url.searchParams.get('mesa'),
    );
    if (queryId) return queryId;

    const pathMatch = url.pathname.match(/\/(?:mesa|mesas)\/(\d+)(?:\/|$)/i);
    return parsePositiveId(pathMatch?.[1]);
  } catch {
    return null;
  }
}
