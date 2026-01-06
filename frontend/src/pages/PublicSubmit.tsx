import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RatingStars } from '@/components/RatingStars'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSubmission, ApiError } from '@/lib/api'
import { Loader2, Send } from 'lucide-react'

export function PublicSubmit() {
  const navigate = useNavigate()
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!review.trim()) {
      setError('Please enter a review')
      return
    }

    setLoading(true)

    try {
      const response = await createSubmission({ rating, review })
      navigate(`/status/${response.submission_id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl font-serif mb-4 text-balance">
            Share Your Experience
          </h1>
          <p className="text-muted-foreground text-lg">
            Your feedback helps us improve and serve you better
          </p>
        </div>

        <Card className="glassmorphism glow fade-in" style={{ '--delay': '0.2s' } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-2xl">Submit Your Review</CardTitle>
            <CardDescription>
              Rate your experience and share your thoughts with us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center">
                  <RatingStars rating={rating} onChange={setRating} />
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-muted-foreground fade-in">
                    You selected {rating} star{rating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="review" className="block text-sm font-medium">
                  Tell us more about your experience
                </label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {review.length} characters
                </p>
              </div>

              {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

              <Button
                type="submit"
                className="w-full gap-2 h-12 text-base"
                disabled={loading || rating === 0 || !review.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground fade-in" style={{ '--delay': '0.4s' } as React.CSSProperties}>
          <p>
            Your feedback is valuable and helps us continuously improve our service.
          </p>
        </div>
      </div>
    </Layout>
  )
}
