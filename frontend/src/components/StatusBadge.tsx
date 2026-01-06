import { cn } from '@/lib/utils'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  showIcon?: boolean
}

const statusConfig = {
  PENDING: {
    label: 'Processing',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: XCircle,
  },
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  )
}
