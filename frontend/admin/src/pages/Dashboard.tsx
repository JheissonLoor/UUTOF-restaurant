import { useQuery } from '@tanstack/react-query';

import { getErrorDetail } from '@/api/errors';
import { getDashboard } from '@/api/reportes';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AlertsBanner } from '@/components/dashboard/AlertsBanner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DistribucionPedidos } from '@/components/dashboard/DistribucionPedidos';
import { HeatmapPedidos } from '@/components/dashboard/HeatmapPedidos';
import { PagosPorTipo } from '@/components/dashboard/PagosPorTipo';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { TopPlatillos } from '@/components/dashboard/TopPlatillos';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export function DashboardPage(): JSX.Element {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    refetchInterval: 30000,
  });

  if (dashboardQuery.isLoading) {
    return (
      <>
        <DashboardHeader />
        <DashboardSkeleton />
      </>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <>
        <DashboardHeader />
        <ErrorState
          message={getErrorDetail(dashboardQuery.error, 'No pudimos cargar los datos del dashboard.')}
          onRetry={() => {
            void dashboardQuery.refetch();
          }}
        />
      </>
    );
  }

  const data = dashboardQuery.data;

  return (
    <>
      <DashboardHeader />
      <div className="space-y-5">
        <StatsRow data={data} />
        <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <RevenueChart data={data.ingresos_por_dia} />
          <TopPlatillos data={data.top_platillos} />
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <DistribucionPedidos data={data.distribucion} />
          <PagosPorTipo data={data.pagos_por_tipo} />
          <ActivityFeed data={data.actividad} />
        </div>
        <HeatmapPedidos data={data.heatmap_pedidos} />
        <AlertsBanner data={data.alertas} />
      </div>
    </>
  );
}
