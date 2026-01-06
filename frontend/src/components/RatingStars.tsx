import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function RatingStars({
  rating,
  onChange,
  readonly = false,
  size = 'lg',
}: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5]

  if (readonly) {
    return (
      <div className="flex gap-1">
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="star-rating flex-row-reverse">
      {stars.reverse().map((star) => (
        <label key={star} className="cursor-pointer">
          <input
            type="radio"
            name="rating"
            value={star}
            checked={rating === star}
            onChange={() => onChange?.(star)}
            className="hidden"
          />
          <Star
            className={cn(
              sizeClasses[size],
              'transition-all',
              star <= rating
                ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]'
                : 'text-muted-foreground hover:text-primary/50'
            )}
          />
        </label>
      ))}
    </div>
  )
}
