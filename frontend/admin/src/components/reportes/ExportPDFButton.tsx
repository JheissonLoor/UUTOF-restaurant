import { FileDown } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ExportPDFButtonProps {
  disabled?: boolean;
}

export function ExportPDFButton({ disabled = false }: ExportPDFButtonProps): JSX.Element {
  const { showToast } = useToast();

  function handleExport(): void {
    const previousTitle = document.title;
    document.title = 'UTTOF - Reporte de ventas';
    window.addEventListener('afterprint', () => {
      document.title = previousTitle;
    }, { once: true });
    showToast({
      variant: 'info',
      title: 'Reporte preparado',
      description: 'Selecciona Guardar como PDF en el dialogo de impresion.',
    });
    window.print();
  }

  return (
    <Button type="button" variant="ghost" disabled={disabled} onClick={handleExport}>
      <FileDown aria-hidden="true" size={16} strokeWidth={1.8} />
      Exportar PDF
    </Button>
  );
}
