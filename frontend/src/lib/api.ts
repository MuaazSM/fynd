import { getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fynd-api-cwwa.onrender.com'

export interface SubmissionRequest {
  rating: number
  review: string
}

export interface SubmissionResponse {
  submission_id: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
}

export interface SubmissionStatus {
  id: string
  rating: number
  review: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
  user_ai_response?: string
  error_message?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface AdminSubmission {
  id: string
  rating: number
  review_preview: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
  admin_summary?: string
  recommended_actions?: string[] | null
  error_message?: string
}

interface BackendSubmissionsResponse {
  items: AdminSubmission[]
  total: number
  limit: number
  offset: number
}

export interface AdminSubmissionsResponse {
  submissions: AdminSubmission[]
  total: number
}

interface BackendAnalytics {
  counts_by_rating: Record<string, number>
  counts_by_status: Record<string, number>
  submissions_per_day: Array<{ date: string; count: number }>
}

export interface Analytics {
  rating_counts: Record<string, number>
  status_counts: Record<string, number>
  submissions_per_day: Array<{ date: string; count: number }>
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

export async function createSubmission(
  data: SubmissionRequest
): Promise<SubmissionResponse> {
  return fetchApi<SubmissionResponse>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getSubmissionStatus(
  submissionId: string
): Promise<SubmissionStatus> {
  return fetchApi<SubmissionStatus>(`/api/submissions/${submissionId}`)
}

export async function adminLogin(
  credentials: LoginRequest
): Promise<LoginResponse> {
  return fetchApi<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function getAdminSubmissions(params: {
  rating?: number
  status?: string
  q?: string
  limit?: number
  offset?: number
}): Promise<AdminSubmissionsResponse> {
  const token = getToken()
  if (!token) {
    throw new ApiError('Not authenticated', 401)
  }

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  const endpoint = `/api/admin/submissions${queryString ? `?${queryString}` : ''}`

  const data = await fetchApi<BackendSubmissionsResponse>(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Transform backend response to frontend format
  return {
    submissions: data.items,
    total: data.total,
  }
}

export async function getAdminAnalytics(): Promise<Analytics> {
  const token = getToken()
  if (!token) {
    throw new ApiError('Not authenticated', 401)
  }

  const data = await fetchApi<BackendAnalytics>('/api/admin/analytics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Transform backend response to frontend format
  return {
    rating_counts: data.counts_by_rating,
    status_counts: data.counts_by_status,
    submissions_per_day: data.submissions_per_day,
  }
}

export { ApiError }
