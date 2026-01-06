import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RatingStars } from '@/components/RatingStars'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Pagination } from '@/components/Pagination'
import { AnalyticsCards } from '@/components/AnalyticsCards'
import { AnalyticsChart } from '@/components/AnalyticsChart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getAdminSubmissions,
  getAdminAnalytics,
  ApiError,
  AdminSubmission,
  Analytics,
} from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { formatDate, truncate } from '@/lib/utils'
import { Loader2, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const ITEMS_PER_PAGE = 20

export function AdminDashboard() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  
  const [filters, setFilters] = useState({
    rating: '',
    status: '',
    q: '',
  })

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Removed - let ProtectedRoute in App.tsx handle auth

  useEffect(() => {
    fetchSubmissions()
  }, [currentPage, filters])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchSubmissions = async () => {
    console.log('Fetching submissions...')
    setLoading(true)
    setError(null)

    try {
      const params = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        ...(filters.rating && { rating: parseInt(filters.rating) }),
        ...(filters.status && { status: filters.status }),
        ...(filters.q && { q: filters.q }),
      }

      const data = await getAdminSubmissions(params)
      setSubmissions(data.submissions)
      setTotal(data.total)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch submissions')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    console.log('Fetching analytics...')
    setAnalyticsLoading(true)
    try {
      const data = await getAdminAnalytics()
      setAnalytics(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchSubmissions()
    fetchAnalytics()
  }

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between fade-in">
          <div>
            <h1 className="text-4xl font-serif mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage customer feedback
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : analytics && analytics.status_counts ? (
          <>
            <AnalyticsCards
              totalSubmissions={Object.values(analytics.status_counts || {}).reduce((a, b) => a + b, 0)}
              pendingCount={analytics.status_counts?.PENDING || 0}
              completedCount={analytics.status_counts?.COMPLETED || 0}
              failedCount={analytics.status_counts?.FAILED || 0}
            />
            <AnalyticsChart
              ratingCounts={analytics.rating_counts || {}}
              submissionsPerDay={analytics.submissions_per_day || []}
            />
          </>
        ) : null}

        <Card className="glassmorphism fade-in" style={{ '--delay': '0.3s' } as React.CSSProperties}>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={filters.rating || "all"}
                  onValueChange={(value) => handleFilterChange('rating', value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Processing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ rating: '', status: '', q: '' })
                    setCurrentPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No submissions found
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Review
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {submissions.map((submission) => (
                            <>
                              <tr key={submission.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRow(submission.id)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {expandedRows.has(submission.id) ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </Button>
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                                  {submission.id.split('-')[0]}
                                </td>
                                <td className="px-4 py-3">
                                  <RatingStars rating={submission.rating} readonly size="sm" />
                                </td>
                                <td className="px-4 py-3 max-w-md">
                                  <p className="text-sm truncate">
                                    {truncate(submission.review_preview, 100)}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={submission.status} showIcon={false} />
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {formatDate(submission.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                              {expandedRows.has(submission.id) && (
                                <tr className="bg-muted/20">
                                  <td colSpan={7} className="px-4 py-4">
                                    <div className="space-y-3 max-w-3xl">
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                          Full Review
                                        </p>
                                        <p className="text-sm whitespace-pre-wrap">
                                          {submission.review_preview}
                                        </p>
                                      </div>
                                      {submission.admin_summary && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground mb-1">
                                            AI Summary
                                          </p>
                                          <p className="text-sm whitespace-pre-wrap">
                                            {submission.admin_summary}
                                          </p>
                                        </div>
                                      )}
                                      {submission.recommended_actions && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Recommended Actions
                                          </p>
                                          <p className="text-sm whitespace-pre-wrap">
                                            {submission.recommended_actions}
                                          </p>
                                        </div>
                                      )}
                                      {submission.error_message && (
                                        <div>
                                          <p className="text-xs font-medium text-destructive mb-1">
                                            Error
                                          </p>
                                          <p className="text-sm text-destructive">
                                            {submission.error_message}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalItems={total}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Submission Details</span>
                  <StatusBadge status={selectedSubmission.status} />
                </DialogTitle>
                <DialogDescription>
                  ID: {selectedSubmission.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rating</p>
                  <RatingStars rating={selectedSubmission.rating} readonly />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedSubmission.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Review</p>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSubmission.review_preview}
                    </p>
                  </div>
                </div>

                {selectedSubmission.admin_summary && (
                  <div>
                    <p className="text-sm font-medium mb-2">AI Summary</p>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedSubmission.admin_summary}
                      </p>
                    </div>
                  </div>
                )}

                {selectedSubmission.recommended_actions && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Actions</p>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedSubmission.recommended_actions}
                      </p>
                    </div>
                  </div>
                )}

                {selectedSubmission.error_message && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-destructive">Error</p>
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                      <p className="text-sm text-destructive">
                        {selectedSubmission.error_message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
