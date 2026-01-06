import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsChartProps {
  ratingCounts: Record<string, number>
  submissionsPerDay: Array<{ date: string; count: number }>
}

const RATING_COLORS = [
  '#ef4444', // 1 star - red
  '#f97316', // 2 stars - orange
  '#eab308', // 3 stars - yellow
  '#84cc16', // 4 stars - lime
  '#22c55e', // 5 stars - green
]

export function AnalyticsChart({
  ratingCounts,
  submissionsPerDay,
}: AnalyticsChartProps) {
  const ratingData = Object.entries(ratingCounts).map(([rating, count]) => ({
    rating: `${rating} ★`,
    count,
  }))

  const dailyData = submissionsPerDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    count: item.count,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glassmorphism fade-in" style={{ '--delay': '0.1s' } as React.CSSProperties}>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rating, percent }) =>
                  `${rating}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {ratingData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={RATING_COLORS[index]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220 13% 10%)',
                  border: '1px solid hsl(217 33% 17%)',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glassmorphism fade-in" style={{ '--delay': '0.2s' } as React.CSSProperties}>
        <CardHeader>
          <CardTitle className="text-lg">Submissions (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(217 33% 17%)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(215 20% 65%)"
                tick={{ fill: 'hsl(215 20% 65%)' }}
              />
              <YAxis
                stroke="hsl(215 20% 65%)"
                tick={{ fill: 'hsl(215 20% 65%)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220 13% 10%)',
                  border: '1px solid hsl(217 33% 17%)',
                  borderRadius: '0.5rem',
                }}
                cursor={{ fill: 'rgba(252, 211, 77, 0.1)' }}
              />
              <Bar
                dataKey="count"
                fill="hsl(47 96% 53%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
