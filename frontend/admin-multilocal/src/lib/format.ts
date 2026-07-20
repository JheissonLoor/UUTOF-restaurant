const integerFormatter = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 0,
});

const solesFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function fmtInteger(value: number): string {
  return integerFormatter.format(value);
}

export function fmtSoles(value: number): string {
  return solesFormatter.format(value).replace('PEN', 'S/');
}

export function fmtPercent(value: number): string {
  return `${integerFormatter.format(value)}%`;
}
