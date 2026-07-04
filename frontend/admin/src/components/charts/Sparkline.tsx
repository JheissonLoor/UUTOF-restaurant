import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
} from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;
  fill: string;
}

export function Sparkline({ data, color, fill }: SparklineProps): JSX.Element {
  const points = data.length > 0 ? data : [0, 0];
  const chartData = points.map((value, index) => ({ index, value }));

  return (
    <div className="h-6 w-[60px]" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity={0.9} />
              <stop offset="100%" stopColor={fill} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.7}
            fill={`url(#spark-${color.replace('#', '')})`}
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
