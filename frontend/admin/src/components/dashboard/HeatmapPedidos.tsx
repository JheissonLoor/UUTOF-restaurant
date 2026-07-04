import { Heatmap } from '@/components/charts/Heatmap';
import { Card } from '@/components/ui/Card';

interface HeatmapPedidosProps {
  data: number[][];
}

export function HeatmapPedidos({ data }: HeatmapPedidosProps): JSX.Element {
  return (
    <Card title="Horas Pico · últimos 7 días" meta="pedidos por hora">
      <Heatmap data={data} />
    </Card>
  );
}
