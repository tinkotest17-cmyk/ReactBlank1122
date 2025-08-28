import { TradingPair } from '@shared/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChartProps {
  pair: TradingPair;
  height?: number;
  showTitle?: boolean;
  className?: string;
}

export default function PriceChart({ pair, height = 200, showTitle = true, className }: PriceChartProps) {
  // Transform price history into chart data
  const chartData = pair.priceHistory.map((price, index) => ({
    time: index,
    price: price,
    formattedPrice: price.toFixed(pair.symbol.includes('JPY') ? 2 : 4)
  }));

  const chartConfig = {
    price: {
      label: "Price",
      color: pair.change24h >= 0 ? "#10b981" : "#ef4444",
    },
  };

  const formatPrice = (value: number) => {
    const decimals = pair.symbol.includes('JPY') ? 2 : 4;
    return value.toFixed(decimals);
  };

  const Content = (
    <ChartContainer config={chartConfig} className={className}>
      <LineChart
        data={chartData}
        width={400}
        height={height}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <XAxis 
          dataKey="time" 
          type="number"
          scale="linear"
          domain={['dataMin', 'dataMax']}
          hide
        />
        <YAxis 
          domain={['dataMin - 0.001', 'dataMax + 0.001']}
          hide
        />
        <ChartTooltip
          content={
            <ChartTooltipContent 
              hideLabel
              formatter={(value, name) => [
                formatPrice(value as number),
                pair.symbol
              ]}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={chartConfig.price.color}
          strokeWidth={2}
          dot={false}
          activeDot={{ 
            r: 4, 
            fill: chartConfig.price.color,
            stroke: "#fff",
            strokeWidth: 2
          }}
        />
      </LineChart>
    </ChartContainer>
  );

  if (!showTitle) {
    return Content;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{pair.symbol}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">
              {formatPrice(pair.price)}
            </span>
            <div className="flex items-center gap-1">
              {pair.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-sm ${
                pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {Content}
      </CardContent>
    </Card>
  );
}
