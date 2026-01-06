import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RatingStars } from '@/components/RatingStars'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSubmissionStatus, ApiError, SubmissionStatus as SubmissionStatusType } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Loader2, Home, Sparkles } from 'lucide-react'

const POLL_INTERVAL_MS = parseInt(import.meta.env.VITE_POLL_INTERVAL_MS || '2000', 10)

export function SubmissionStatus() {
  const { id } = useParams<{ id: string }>()
  const [submission, setSubmission] = useState<SubmissionStatusType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let intervalId: number | undefined

    const fetchStatus = async () => {
      try {
        const data = await getSubmissionStatus(id)
        setSubmission(data)
        setError(null)

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          if (intervalId) {
            clearInterval(intervalId)
          }
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch submission status')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    intervalId = window.setInterval(fetchStatus, POLL_INTERVAL_MS)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading submission...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !submission) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <ErrorBanner message={error || 'Submission not found'} />
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 fade-in">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <Home className="w-4 h-4" />
              Submit Another Review
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif mb-2">Submission Status</h1>
              <p className="text-muted-foreground">ID: {submission.id}</p>
            </div>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glassmorphism fade-in" style={{ '--delay': '0.1s' } as React.CSSProperties}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Review</span>
                <RatingStars rating={submission.rating} readonly size="sm" />
              </CardTitle>
              <CardDescription>
                Submitted on {formatDate(submission.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {submission.review}
                </p>
              </div>
            </CardContent>
          </Card>

          {submission.status === 'PENDING' && (
            <Card className="glassmorphism border-primary/20 fade-in" style={{ '--delay': '0.2s' } as React.CSSProperties}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Processing your feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI is analyzing your review and preparing a response...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {submission.status === 'COMPLETED' && submission.user_ai_response && (
            <Card className="glassmorphism glow fade-in" style={{ '--delay': '0.2s' } as React.CSSProperties}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Response
                </CardTitle>
                <CardDescription>
                  Our AI has analyzed your feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {submission.user_ai_response}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {submission.status === 'FAILED' && (
            <ErrorBanner
              message={
                submission.error_message ||
                'Failed to process your submission. Please try again later.'
              }
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
