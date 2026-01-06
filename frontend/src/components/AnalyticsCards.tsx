import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface AnalyticsCardsProps {
  totalSubmissions: number
  pendingCount: number
  completedCount: number
  failedCount: number
}

export function AnalyticsCards({
  totalSubmissions,
  pendingCount,
  completedCount,
  failedCount,
}: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total Submissions',
      value: totalSubmissions,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Processing',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Failed',
      value: failedCount,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="glassmorphism fade-in"
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
